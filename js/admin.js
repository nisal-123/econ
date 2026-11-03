/**
 * CAMPUS BIRTHDAY HUB - ADMIN DASHBOARD MODULE
 * 
 * Manages all student records, verification workflows (Approve, Request Correction, Edit, Delete),
 * real-time statistical analytics, and CSV data export.
 */

class AdminDashboard {
    constructor() {
        this.students = [];
        this.filterStatus = 'all';
        this.searchQuery = '';
        this.selectedForEdit = null;
        this.selectedForCorrection = null;
    }

    setStudents(students) {
        this.students = students || [];
        this.renderStats();
        this.renderTable();
    }

    // 1. Calculate and Render Real-time Dashboard KPI Statistics
    renderStats() {
        const total = this.students.length;
        const verified = this.students.filter(s => s.approval_status === 'approved').length;
        const pending = this.students.filter(s => s.approval_status === 'pending').length;
        const correction = this.students.filter(s => s.approval_status === 'correction_requested').length;

        // Upcoming birthdays in next 7 days
        const upcoming7Days = this.students.filter(s => {
            const b = window.birthdayCalendar.calculateNextBirthday(s.birthday_date);
            return b && b.daysUntil >= 0 && b.daysUntil <= 7;
        }).length;

        // Post tasks statistics
        const completedPosts = this.students.filter(s => {
            const status = s.birthday_post_tasks?.post_status;
            return status === 'design_completed' || status === 'published';
        }).length;

        const remainingPosts = Math.max(0, total - completedPosts);

        // Update DOM elements
        this.safeSetText('stat-total-students', total);
        this.safeSetText('stat-verified-students', verified);
        this.safeSetText('stat-pending-students', pending);
        this.safeSetText('stat-upcoming-7days', upcoming7Days);
        this.safeSetText('stat-completed-posts', completedPosts);
        this.safeSetText('stat-remaining-posts', remainingPosts);
        this.safeSetText('stat-correction-students', correction);
    }

    safeSetText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // 2. Render Student Management Table
    renderTable() {
        const tbody = document.getElementById('admin-students-tbody');
        if (!tbody) return;

        let filtered = this.students;

        // Status filter
        if (this.filterStatus !== 'all') {
            filtered = filtered.filter(s => s.approval_status === this.filterStatus);
        }

        // Search filter
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(s => 
                (s.full_name || '').toLowerCase().includes(q) ||
                (s.student_id || '').toLowerCase().includes(q) ||
                (s.department || '').toLowerCase().includes(q) ||
                (s.batch || '').toLowerCase().includes(q)
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="py-12 text-center text-slate-500 dark:text-slate-400">
                        <i class="fa-solid fa-users-slash text-4xl mb-3 text-slate-300 dark:text-slate-600 block"></i>
                        <p class="font-medium">No student records found.</p>
                        <p class="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(s => {
            const bdayCalc = window.birthdayCalendar.calculateNextBirthday(s.birthday_date);
            const task = s.birthday_post_tasks || {};

            let statusBadge = '';
            if (s.approval_status === 'approved') {
                statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <i class="fa-solid fa-check mr-1"></i> Approved
                </span>`;
            } else if (s.approval_status === 'correction_requested') {
                statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                    <i class="fa-solid fa-triangle-exclamation mr-1"></i> Correction
                </span>`;
            } else {
                statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    <i class="fa-solid fa-clock mr-1"></i> Pending
                </span>`;
            }

            let postBadge = '';
            const pStatus = task.post_status || 'pending';
            if (pStatus === 'published') {
                postBadge = `<span class="text-xs font-medium text-emerald-600 dark:text-emerald-400"><i class="fa-solid fa-circle-check mr-1"></i>Published</span>`;
            } else if (pStatus === 'design_completed') {
                postBadge = `<span class="text-xs font-medium text-indigo-600 dark:text-indigo-400"><i class="fa-solid fa-circle-check mr-1"></i>Designed</span>`;
            } else if (pStatus === 'in_progress') {
                postBadge = `<span class="text-xs font-medium text-amber-600 dark:text-amber-400"><i class="fa-solid fa-spinner fa-spin mr-1"></i>In Progress</span>`;
            } else {
                postBadge = `<span class="text-xs font-medium text-slate-400"><i class="fa-regular fa-circle mr-1"></i>Pending</span>`;
            }

            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800">
                    <td class="py-3.5 px-4">
                        <div class="flex items-center space-x-3">
                            <img src="${s.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}" 
                                 alt="${s.full_name}" 
                                 class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700">
                            <div>
                                <p class="text-sm font-semibold text-slate-900 dark:text-white">${s.full_name}</p>
                                <p class="text-xs text-slate-500 font-mono">${s.student_id}</p>
                            </div>
                        </div>
                    </td>

                    <td class="py-3.5 px-4">
                        <div class="text-sm font-medium text-slate-800 dark:text-slate-200">
                            ${bdayCalc ? bdayCalc.formattedDate : s.birthday_date}
                        </div>
                        <div class="text-xs text-navy-600 dark:text-navy-400 font-medium">
                            ${bdayCalc?.isToday ? '🎂 Today!' : (bdayCalc ? `In ${bdayCalc.daysUntil}d` : '')}
                        </div>
                    </td>

                    <td class="py-3.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        ${s.preferred_name ? `<span class="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">${s.preferred_name}</span>` : '<span class="text-slate-400">-</span>'}
                    </td>

                    <td class="py-3.5 px-4">
                        ${statusBadge}
                    </td>

                    <td class="py-3.5 px-4">
                        ${postBadge}
                    </td>

                    <td class="py-3.5 px-4">
                        <div class="flex items-center space-x-1.5">
                            ${s.approval_status !== 'approved' ? `
                                <button onclick="window.adminDashboard.approveStudent('${s.id}')" 
                                        title="Approve & Verify" 
                                        class="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors">
                                    <i class="fa-solid fa-check"></i>
                                </button>
                            ` : ''}

                            <button onclick="window.adminDashboard.openCorrectionModal('${s.id}')" 
                                    title="Request Correction" 
                                    class="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors">
                                <i class="fa-solid fa-comment-dots"></i>
                            </button>

                            <button onclick="window.adminDashboard.openEditModal('${s.id}')" 
                                    title="Edit Record" 
                                    class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button onclick="window.googleSyncService.openGoogleCalendar('${s.id}')" 
                                    title="Add to Google Calendar (1-Day Reminder to nisalmuhandiram2004@gmail.com)" 
                                    class="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors">
                                <i class="fa-brands fa-google"></i>
                            </button>

                            <button onclick="window.wordExportService.exportSingleStudent('${s.id}')" 
                                    title="Download Word Profile Sheet (.doc)" 
                                    class="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors">
                                <i class="fa-solid fa-file-word"></i>
                            </button>

                            <button onclick="window.adminDashboard.openDesignerFor('${s.id}')" 
                                    title="Design Birthday Post" 
                                    class="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-colors">
                                <i class="fa-solid fa-wand-magic-sparkles"></i>
                            </button>

                            <button onclick="window.adminDashboard.confirmDelete('${s.id}', '${s.full_name}')" 
                                    title="Delete Student" 
                                    class="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Filter status tab change
    setFilterStatus(status) {
        this.filterStatus = status;
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            const btnStatus = btn.getAttribute('data-status');
            if (btnStatus === status) {
                btn.className = "admin-tab-btn px-4 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white shadow-sm";
            } else {
                btn.className = "admin-tab-btn px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors";
            }
        });
        this.renderTable();
    }

    // Fast quick actions
    async approveStudent(id) {
        try {
            await window.dbService.updateApprovalStatus(id, 'approved', '');
            window.showToast("Student profile approved and verified!", "success");
            if (window.app) window.app.refreshData();
        } catch (err) {
            window.showToast("Failed to approve student: " + err.message, "error");
        }
    }

    openCorrectionModal(id) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        this.selectedForCorrection = student;
        document.getElementById('correction-student-name').textContent = student.full_name;
        document.getElementById('correction-notes').value = student.admin_notes || "Please re-upload a clear portrait photograph without sunglasses or filters.";
        window.openModal('admin-correction-modal');
    }

    async submitCorrection() {
        if (!this.selectedForCorrection) return;
        const notes = document.getElementById('correction-notes').value.trim();

        try {
            await window.dbService.updateApprovalStatus(this.selectedForCorrection.id, 'correction_requested', notes);
            window.showToast("Correction request sent to student.", "success");
            window.closeModal('admin-correction-modal');
            if (window.app) window.app.refreshData();
        } catch (err) {
            window.showToast("Failed to request correction: " + err.message, "error");
        }
    }

    openEditModal(id) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        this.selectedForEdit = student;
        document.getElementById('edit-std-id').value = student.id;
        document.getElementById('edit-std-fullname').value = student.full_name;
        document.getElementById('edit-std-preferred').value = student.preferred_name || '';
        document.getElementById('edit-std-bday').value = student.birthday_date;
        document.getElementById('edit-std-status').value = student.approval_status;

        window.openModal('admin-edit-modal');
    }

    async saveEditedStudent(e) {
        e.preventDefault();
        if (!this.selectedForEdit) return;

        try {
            const updated = {
                id: this.selectedForEdit.id,
                full_name: document.getElementById('edit-std-fullname').value.trim(),
                preferred_name: document.getElementById('edit-std-preferred').value.trim() || null,
                birthday_date: document.getElementById('edit-std-bday').value,
                approval_status: document.getElementById('edit-std-status').value,
                is_verified: document.getElementById('edit-std-status').value === 'approved'
            };

            await window.dbService.upsertStudentProfile(updated);
            window.showToast("Student details updated successfully!", "success");
            window.closeModal('admin-edit-modal');
            if (window.app) window.app.refreshData();
        } catch (err) {
            window.showToast("Failed to update student: " + err.message, "error");
        }
    }

    confirmDelete(id, name) {
        if (confirm(`Are you sure you want to permanently delete the student record for "${name}"? This action cannot be undone.`)) {
            this.deleteStudent(id);
        }
    }

    async deleteStudent(id) {
        try {
            await window.dbService.deleteStudentProfile(id);
            window.showToast("Student profile deleted successfully.", "success");
            if (window.app) window.app.refreshData();
        } catch (err) {
            window.showToast("Failed to delete student: " + err.message, "error");
        }
    }

    openDesignerFor(id) {
        const student = this.students.find(s => s.id === id);
        if (student) {
            window.app.navigate('designer');
            window.postDesigner.selectStudent(student);
        }
    }

    // Open Export with Photos Modal (Individual student cards with photos)
    openExportPhotosModal() {
        if (!this.students || this.students.length === 0) {
            window.showToast("No student records available to export.", "warning");
            return;
        }

        const container = document.getElementById('admin-export-cards-container');
        const countBadge = document.getElementById('export-count-badge');
        if (countBadge) countBadge.textContent = `${this.students.length} Profiles`;

        if (container) {
            container.innerHTML = this.students.map(s => {
                const bdayCalc = window.birthdayCalendar.calculateNextBirthday(s.birthday_date);
                const isApproved = s.approval_status === 'approved';
                const statusBadge = isApproved ?
                    `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Verified</span>` :
                    `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Pending</span>`;

                return `
                    <div class="export-student-card p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                        <div class="flex items-center space-x-3.5">
                            <img src="${s.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'}" 
                                 alt="${s.full_name}" 
                                 class="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700 shrink-0">
                            <div class="flex-1 min-w-0">
                                <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate">${s.full_name}</h4>
                                <p class="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-0.5 truncate">
                                    ${s.preferred_name ? `Nickname: "${s.preferred_name}"` : 'No nickname'}
                                </p>
                                <div class="mt-1.5">
                                    ${statusBadge}
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                            <div class="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                                <i class="fa-solid fa-cake-candles text-amber-500"></i>
                                <span>${bdayCalc ? bdayCalc.formattedDate : s.birthday_date}</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="text-[11px] font-semibold text-navy-600 dark:text-navy-400">
                                    ${bdayCalc?.isToday ? '🎂 Today!' : (bdayCalc ? `In ${bdayCalc.daysUntil}d` : '')}
                                </span>
                                <button onclick="window.wordExportService.exportSingleStudent('${s.id}')" title="Download Word Sheet (.doc)" class="p-1 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-[10px] flex items-center space-x-1 transition-colors">
                                    <i class="fa-solid fa-file-word"></i>
                                    <span>Word</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        window.openModal('admin-export-photos-modal');
    }

    // Trigger Print / Save as PDF
    printDirectory() {
        window.print();
    }

    // Download standalone offline HTML report with photos
    downloadHTMLDossier() {
        if (!this.students || this.students.length === 0) return;

        const cardsHtml = this.students.map(s => {
            const bdayCalc = window.birthdayCalendar.calculateNextBirthday(s.birthday_date);
            const photoSrc = s.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80';
            return `
                <div style="border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div style="display: flex; align-items: center; gap: 14px;">
                        <img src="${photoSrc}" alt="${s.full_name}" style="width: 70px; height: 70px; border-radius: 14px; object-fit: cover; border: 2px solid #e2e8f0;">
                        <div>
                            <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">${s.full_name}</h3>
                            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: #7c3aed;">${s.preferred_name ? `Nickname: "${s.preferred_name}"` : ''}</p>
                            <span style="display: inline-block; margin-top: 6px; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; background: #ecfdf5; color: #065f46;">${s.approval_status === 'approved' ? 'Verified' : 'Pending'}</span>
                        </div>
                    </div>
                    <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 700; color: #334155;">
                        <span>🎂 Birthday: ${bdayCalc ? bdayCalc.formattedDate : s.birthday_date}</span>
                        <span style="color: #2563eb;">${bdayCalc?.isToday ? 'Today! 🎉' : (bdayCalc ? `In ${bdayCalc.daysUntil} days` : '')}</span>
                    </div>
                </div>
            `;
        }).join('');

        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Campus Birthday Hub - Student Directory with Photos</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 26px; color: #0a192f; }
        .header p { margin: 6px 0 0 0; color: #64748b; font-size: 14px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; max-width: 1200px; margin: 0 auto; }
        @media print {
            body { background: white; padding: 0; }
            .grid { grid-template-columns: repeat(2, 1fr); }
            div { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎂 Campus Birthday Hub - Member Directory</h1>
        <p>Exported on ${new Date().toLocaleDateString()} &bull; Total ${this.students.length} Profiles</p>
    </div>
    <div class="grid">
        ${cardsHtml}
    </div>
</body>
</html>`;

        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `campus_birthday_records_with_photos_${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        window.showToast("HTML report with photos downloaded!", "success");
    }

    // Export all student birthday data as CSV (including photo URL)
    exportCSV() {
        if (!this.students || this.students.length === 0) {
            window.showToast("No student records available to export.", "warning");
            return;
        }

        const headers = ["Full Name", "Nickname", "Birthday Date", "Photo URL", "Review Status", "Verified"];
        
        const rows = this.students.map(s => [
            `"${s.full_name || ''}"`,
            `"${s.preferred_name || ''}"`,
            `"${s.birthday_date || ''}"`,
            `"${s.profile_photo_url || ''}"`,
            `"${s.approval_status || ''}"`,
            `"${s.is_verified ? 'Yes' : 'No'}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `campus_birthday_hub_records_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.showToast("CSV file exported successfully!", "success");
    }
}

window.adminDashboard = new AdminDashboard();

