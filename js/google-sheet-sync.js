/**
 * CAMPUS BIRTHDAY HUB - GOOGLE FORM RESPONSES LIVE AUTO-SYNC
 * 
 * Automatically synchronizes responses submitted via Google Form into Campus Birthday Hub!
 * - Fetches live responses from the Google Form's linked Google Sheet
 * - Converts Google Drive photo links into high-res direct display images
 * - Auto-populates the Birthday Calendar, Birthday Post Designer, and Admin Dashboard
 * - Auto-polls in background so new submissions appear automatically!
 */

class GoogleSheetSyncService {
    constructor() {
        this.isSyncing = false;
        this.pollInterval = null;
        this.lastSyncTime = null;
    }

    init() {
        // Automatically start background polling if a sheet URL is configured
        this.startAutoPoll();

        // Also do an initial sync
        setTimeout(() => {
            this.syncResponses(false);
        }, 1200);
    }

    startAutoPoll() {
        if (this.pollInterval) clearInterval(this.pollInterval);
        // Poll every 35 seconds
        this.pollInterval = setInterval(() => {
            this.syncResponses(false);
        }, 35000);
    }

    /**
     * Fetch & parse live responses from Google Sheet
     */
    async syncResponses(showNotification = true) {
        if (this.isSyncing) return;

        const sheetUrlOrId = window.APP_CONFIG.getGoogleSheetUrl();
        if (!sheetUrlOrId || sheetUrlOrId.includes('/forms/')) {
            if (showNotification) {
                window.openModal('gform-sync-guide-modal');
            }
            return { success: false, reason: "no_sheet_configured" };
        }

        const sheetId = window.APP_CONFIG.extractSheetId(sheetUrlOrId);
        if (!sheetId) {
            if (showNotification) {
                window.openModal('gform-sync-guide-modal');
            }
            return { success: false, reason: "invalid_sheet_id" };
        }

        this.isSyncing = true;
        this.updateSyncIndicators(true);

        try {
            if (showNotification) {
                window.showToast("Fetching live Google Form submissions...", "info");
            }

            // Google Sheets public CSV export endpoint (No API key needed!)
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&headers=1`;
            const resp = await fetch(csvUrl);

            if (!resp.ok) {
                throw new Error("Could not access Google Sheet. Please make sure the sheet is shared as 'Anyone with the link can view'.");
            }

            const csvText = await resp.text();
            const rows = this.parseCSV(csvText);

            if (!rows || rows.length <= 1) {
                if (showNotification) window.showToast("No student responses found in Google Sheet yet.", "info");
                return { success: true, count: 0 };
            }

            const headerRow = rows[0];
            const dataRows = rows.slice(1);

            // Dynamically detect column indices
            const colMap = this.detectColumnIndices(headerRow);

            const newStudents = [];
            dataRows.forEach((row, idx) => {
                if (!row || row.length === 0) return;

                const fullName = (row[colMap.name] || "").trim();
                if (!fullName) return; // Skip empty rows

                const preferredName = (row[colMap.nickname] || "").trim() || fullName.split(' ')[0];
                const rawBirthday = (row[colMap.birthday] || "").trim();
                const rawPhotoLink = (row[colMap.photo] || "").trim();

                const normalizedBday = this.normalizeBirthday(rawBirthday);
                const directPhotoUrl = this.extractDriveImageDirectUrl(rawPhotoLink);

                const studentObj = {
                    id: `gform_${idx + 1}_${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                    student_id: `GF-${1001 + idx}`,
                    full_name: fullName,
                    preferred_name: preferredName,
                    birthday_date: normalizedBday || '2002-01-01',
                    department: "Created by Nisal",
                    profile_photo_url: directPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                    profile_photo_path: null,
                    approval_status: 'approved',
                    is_verified: true,
                    consent_social_media: true,
                    consent_public_calendar: true,
                    created_at: row[colMap.timestamp] || new Date().toISOString(),
                    source: 'google_form'
                };

                newStudents.push(studentObj);
            });

            // Merge into local storage & app
            if (newStudents.length > 0) {
                await this.mergeStudentsIntoApp(newStudents);
            }

            this.lastSyncTime = new Date();
            this.updateSyncIndicators(false, newStudents.length);

            if (showNotification) {
                window.showToast(`Successfully synced ${newStudents.length} responses from Google Form!`, "success");
            }

            return { success: true, count: newStudents.length };

        } catch (err) {
            console.warn("Google Sheet sync error:", err);
            if (showNotification) {
                window.showToast("Sync note: " + err.message, "warning");
            }
            return { success: false, error: err.message };
        } finally {
            this.isSyncing = false;
            this.updateSyncIndicators(false);
        }
    }

    /**
     * Merge Google Form students into existing list without duplicating
     */
    async mergeStudentsIntoApp(gformStudents) {
        const existing = (window.app && window.app.students) || [];
        const existingMap = new Map();

        // Index existing students by name or id
        existing.forEach(s => {
            const key = (s.full_name || '').toLowerCase().trim();
            if (key) existingMap.set(key, s);
        });

        // Merge or append
        gformStudents.forEach(gs => {
            const key = (gs.full_name || '').toLowerCase().trim();
            if (existingMap.has(key)) {
                // Update existing record with Google Form photo & details if newer
                const ex = existingMap.get(key);
                ex.preferred_name = gs.preferred_name || ex.preferred_name;
                ex.birthday_date = gs.birthday_date || ex.birthday_date;
                if (gs.profile_photo_url && !gs.profile_photo_url.includes('unsplash')) {
                    ex.profile_photo_url = gs.profile_photo_url;
                }
            } else {
                existing.unshift(gs);
                existingMap.set(key, gs);
            }
        });

        if (window.app) {
            window.app.students = existing;
            // Persist to local cache so records remain offline
            localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS, JSON.stringify(existing));
            
            // Re-render Calendar, Designer, Admin & Home views
            if (window.birthdayCalendar) {
                window.birthdayCalendar.setStudents(existing);
                window.app.renderHomeCelebrations();
                window.app.renderCalendarView();
            }
            if (window.adminDashboard) {
                window.adminDashboard.setStudents(existing);
            }
            if (window.postDesigner) {
                window.postDesigner.allStudents = existing;
                window.app.renderDesignerStudentList();
            }
        }
    }

    /**
     * Manual Trigger with UI Toast
     */
    syncNow() {
        this.syncResponses(true);
    }

    /**
     * Detect column positions from Google Sheet headers
     */
    detectColumnIndices(headerRow) {
        const colMap = { timestamp: 0, name: 1, nickname: 2, birthday: 3, photo: 4 };

        headerRow.forEach((col, idx) => {
            const title = (col || "").toLowerCase().trim();

            if (title.includes("timestamp") || title.includes("දිනය/වේලාව")) {
                colMap.timestamp = idx;
            } else if (title.includes("full name") || (title.includes("name") && !title.includes("nick") && !title.includes("preferred"))) {
                colMap.name = idx;
            } else if (title.includes("nick") || title.includes("preferred") || title.includes("කෙටි නම")) {
                colMap.nickname = idx;
            } else if (title.includes("birth") || title.includes("bday") || title.includes("උපන්දිනය") || title.includes("date")) {
                colMap.birthday = idx;
            } else if (title.includes("photo") || title.includes("image") || title.includes("picture") || title.includes("drive") || title.includes("ඡායාරූප")) {
                colMap.photo = idx;
            }
        });

        return colMap;
    }

    /**
     * Convert Google Drive open/view links to direct high-res CDN image URL
     */
    extractDriveImageDirectUrl(link) {
        if (!link) return null;
        link = link.trim();

        // Extract Google Drive ID from any format
        const idMatch = link.match(/[?&]id=([a-zA-Z0-9_\-]+)/) || 
                        link.match(/\/d\/([a-zA-Z0-9_\-]+)/) ||
                        link.match(/id=([a-zA-Z0-9_\-]+)/);

        if (idMatch && idMatch[1]) {
            const fileId = idMatch[1];
            // Google Drive official direct CDN image thumbnail
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }

        if (link.startsWith('http')) return link;
        return null;
    }

    /**
     * Normalize various date formats from Google Sheets into YYYY-MM-DD
     */
    normalizeBirthday(rawDate) {
        if (!rawDate) return "2002-01-01";
        rawDate = rawDate.trim();

        // Format: YYYY-MM-DD
        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(rawDate)) {
            const p = rawDate.split('-');
            return `${p[0]}-${p[1].padStart(2, '0')}-${p[2].padStart(2, '0')}`;
        }

        // Format: MM/DD/YYYY or DD/MM/YYYY
        if (rawDate.includes('/')) {
            const parts = rawDate.split('/');
            if (parts.length === 3) {
                let p1 = parseInt(parts[0], 10);
                let p2 = parseInt(parts[1], 10);
                let p3 = parseInt(parts[2], 10);
                let year = p3 < 100 ? 2000 + p3 : p3;

                if (p1 > 12) {
                    return `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
                } else {
                    return `${year}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`;
                }
            }
        }

        // Try standard Date parse
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
            const y = parsed.getFullYear();
            const m = String(parsed.getMonth() + 1).padStart(2, '0');
            const d = String(parsed.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }

        return "2002-01-01";
    }

    /**
     * CSV parser supporting quotes, commas, and line breaks
     */
    parseCSV(text) {
        const lines = [];
        let row = [];
        let inQuotes = false;
        let entry = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    entry += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                row.push(entry.trim());
                entry = '';
            } else if ((char === '\r' || char === '\n') && !inQuotes) {
                if (char === '\r' && nextChar === '\n') i++;
                row.push(entry.trim());
                if (row.some(cell => cell.length > 0)) {
                    lines.push(row);
                }
                row = [];
                entry = '';
            } else {
                entry += char;
            }
        }
        if (entry || row.length > 0) {
            row.push(entry.trim());
            if (row.some(cell => cell.length > 0)) {
                lines.push(row);
            }
        }
        return lines;
    }

    /**
     * Update UI spinner / button status indicators
     */
    updateSyncIndicators(isSyncing, count = null) {
        const syncBtns = document.querySelectorAll('.gform-sync-btn-icon');
        syncBtns.forEach(icon => {
            if (isSyncing) {
                icon.classList.add('fa-spin');
            } else {
                icon.classList.remove('fa-spin');
            }
        });

        const syncBadges = document.querySelectorAll('.gform-sync-count-badge');
        if (count !== null) {
            syncBadges.forEach(b => {
                b.textContent = `${count} Synced`;
            });
        }
    }
}

window.googleSheetSync = new GoogleSheetSyncService();

