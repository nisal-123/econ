/**
 * CAMPUS BIRTHDAY HUB - WORD DOCUMENT (.DOC) EXPORT SERVICE
 * 
 * Generates Microsoft Word compatible documents (.doc / MHTML format)
 * with fully embedded portrait photos, student birthday information,
 * and elegant university styling.
 * 
 * Works 100% offline in browser with pure JavaScript (No Node.js / npm required).
 */

class WordExportService {
    constructor() {
        this.isExporting = false;
    }

    /**
     * Convert any image URL (blob:, data:, or HTTP) to clean Base64 JPEG data
     */
    async urlToBase64(imageUrl, fallbackName = "Student") {
        if (!imageUrl) {
            return this.generateAvatarBase64(fallbackName);
        }

        if (imageUrl.startsWith('data:image')) {
            return imageUrl;
        }

        // Attempt 1: Fetch as Blob (works seamlessly with blob: URLs and CORS-enabled storage)
        try {
            const response = await fetch(imageUrl, { mode: 'cors' });
            if (response.ok) {
                const blob = await response.blob();
                const dataUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(blob);
                });
                if (dataUrl) return dataUrl;
            }
        } catch (e) {
            // Ignore fetch failure and try Canvas fallback
        }

        // Attempt 2: Offscreen Image + Canvas
        try {
            const dataUrl = await new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                const timeout = setTimeout(() => {
                    img.src = '';
                    resolve(null);
                }, 4000);

                img.onload = () => {
                    clearTimeout(timeout);
                    try {
                        const canvas = document.createElement('canvas');
                        const maxDim = 360;
                        let w = img.naturalWidth || img.width || 300;
                        let h = img.naturalHeight || img.height || 300;

                        if (w > maxDim || h > maxDim) {
                            if (w > h) {
                                h = Math.round((h * maxDim) / w);
                                w = maxDim;
                            } else {
                                w = Math.round((w * maxDim) / h);
                                h = maxDim;
                            }
                        }

                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, w, h);
                        ctx.drawImage(img, 0, 0, w, h);
                        resolve(canvas.toDataURL('image/jpeg', 0.85));
                    } catch (err) {
                        console.warn("Canvas export error:", err);
                        resolve(null);
                    }
                };

                img.onerror = () => {
                    clearTimeout(timeout);
                    resolve(null);
                };

                img.src = imageUrl;
            });

            if (dataUrl) return dataUrl;
        } catch (e) {
            console.warn("Image conversion exception:", e);
        }

        // Fallback: Generate initials avatar
        return this.generateAvatarBase64(fallbackName);
    }

    /**
     * Generate fallback initials avatar as Base64 JPEG if photo cannot be loaded
     */
    generateAvatarBase64(name = "Student") {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');

        // Elegant gradient
        const grad = ctx.createLinearGradient(0, 0, 240, 240);
        grad.addColorStop(0, '#0a192f');
        grad.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 240, 240);

        // Initials
        const initials = name.split(' ')
            .filter(Boolean)
            .map(n => n[0].toUpperCase())
            .slice(0, 2)
            .join('') || 'U';

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, 120, 120);

        return canvas.toDataURL('image/jpeg', 0.85);
    }

    /**
     * Build HTML for one student profile sheet formatted for Word
     */
    buildStudentSheetHtml(student, photoCid) {
        const bdayCalc = window.birthdayCalendar ? 
            window.birthdayCalendar.calculateNextBirthday(student.birthday_date) : null;
        
        const isApproved = student.approval_status === 'approved';
        const statusText = isApproved ? 'Verified & Approved' : 
            (student.approval_status === 'correction_requested' ? 'Correction Requested' : 'Pending Review');
        const statusColor = isApproved ? '#059669' : (student.approval_status === 'correction_requested' ? '#dc2626' : '#d97706');
        const statusBg = isApproved ? '#ecfdf5' : (student.approval_status === 'correction_requested' ? '#fef2f2' : '#fffbeb');

        const postStatus = student.birthday_post_tasks?.post_status || 'Pending';
        const formattedDate = bdayCalc ? bdayCalc.formattedDate : (student.birthday_date || 'Not specified');
        const countdownText = bdayCalc?.isToday ? '🎂 Celebrating Today!' : (bdayCalc ? `In ${bdayCalc.daysUntil} days` : '');

        return `
        <div class="student-profile-page" style="page-break-inside: avoid; margin-bottom: 30px;">
            <!-- Document Header -->
            <table class="doc-header-table" style="width: 100%; border-bottom: 3px solid #0a192f; padding-bottom: 12px; margin-bottom: 20px;">
                <tr>
                    <td style="vertical-align: middle;">
                        <div style="font-size: 20px; font-weight: 800; color: #0a192f; letter-spacing: 0.5px;">CAMPUS BIRTHDAY HUB</div>
                        <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px;">Created by Nisal &bull; Birthday Record Sheet</div>
                    </td>
                    <td style="text-align: right; vertical-align: middle;">
                        <span style="font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 12px; background-color: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor};">
                            ${statusText}
                        </span>
                        <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Ref: ${student.student_id || 'ID-CAMPUS'}</div>
                    </td>
                </tr>
            </table>

            <!-- Main Profile Section (Two Columns: Photo on Left, Details on Right) -->
            <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 20px;">
                <tr>
                    <!-- Left Photo Cell -->
                    <td style="width: 180px; vertical-align: top; padding-right: 20px; text-align: center;">
                        <div style="border: 3px solid #0a192f; border-radius: 12px; padding: 4px; display: inline-block; background-color: #ffffff;">
                            <img src="${photoCid}" alt="${student.full_name}" width="160" height="160" style="width: 160px; height: 160px; object-fit: cover; border-radius: 8px; display: block;" />
                        </div>
                        <div style="margin-top: 8px; font-size: 11px; font-weight: bold; color: #475569;">
                            Official Portrait Photo
                        </div>
                    </td>

                    <!-- Right Details Cell -->
                    <td style="vertical-align: top;">
                        <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
                            <tr>
                                <td colspan="2" style="padding: 12px 16px; background-color: #0a192f; color: #ffffff; border-top-left-radius: 9px; border-top-right-radius: 9px;">
                                    <div style="font-size: 18px; font-weight: bold; line-height: 1.2;">${student.full_name}</div>
                                    ${student.preferred_name ? `<div style="font-size: 13px; color: #cbd5e1; margin-top: 2px;">Nickname: <b>"${student.preferred_name}"</b></div>` : ''}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 16px; width: 38%; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">
                                    🎂 Birthday Date:
                                </td>
                                <td style="padding: 10px 16px; font-size: 14px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                                    ${formattedDate} 
                                    <span style="font-size: 12px; font-weight: 600; color: #2563eb; margin-left: 8px;">(${countdownText})</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 16px; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">
                                    Preferred Name:
                                </td>
                                <td style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: #7c3aed; border-bottom: 1px solid #e2e8f0;">
                                    ${student.preferred_name || student.full_name.split(' ')[0]}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 16px; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">
                                    Department:
                                </td>
                                <td style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #334155; border-bottom: 1px solid #e2e8f0;">
                                    ${student.department || 'Created by Nisal'}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 16px; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">
                                    Post Designer Status:
                                </td>
                                <td style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #334155; border-bottom: 1px solid #e2e8f0;">
                                    <span style="font-weight: 700; text-transform: capitalize;">${postStatus.replace('_', ' ')}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 16px; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">
                                    Submission Date:
                                </td>
                                <td style="padding: 10px 16px; font-size: 11px; color: #64748b;">
                                    ${new Date(student.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            <!-- Social Media Post Preparation Box -->
            <div style="background-color: #f1f5f9; border-left: 4px solid #7c3aed; padding: 12px 16px; border-radius: 6px; margin-top: 15px;">
                <div style="font-size: 12px; font-weight: bold; color: #4338ca; margin-bottom: 4px;">
                    🎨 Birthday Post Designer Checklist & Notes:
                </div>
                <div style="font-size: 11px; color: #475569; line-height: 1.4;">
                    &bull; Display Name on Birthday Banner: <b>${student.preferred_name || student.full_name}</b><br>
                    &bull; High-res square format (1080 &times; 1080 px) or Instagram Story format (1080 &times; 1350 px).<br>
                    &bull; Ensure portrait photo matches university department aesthetics before publishing.
                </div>
            </div>

            <!-- Page Footer -->
            <table style="width: 100%; border-top: 1px solid #e2e8f0; margin-top: 25px; padding-top: 8px;">
                <tr>
                    <td style="font-size: 9px; color: #94a3b8;">
                        Campus Birthday Hub &bull; University Official Record
                    </td>
                    <td style="text-align: right; font-size: 9px; color: #94a3b8;">
                        Generated on ${new Date().toLocaleString()}
                    </td>
                </tr>
            </table>
        </div>
        `;
    }

    /**
     * Package HTML sheets and Base64 images into an RFC 2557 MHTML Word Document (.doc)
     */
    packageMhtmlDoc(bodyHtml, imagesList) {
        const boundary = "----=_CampusBirthdayHub_WordDoc_Part_Bound_" + Date.now();

        let mhtml = "";
        mhtml += `MIME-Version: 1.0\r\n`;
        mhtml += `Content-Type: multipart/related; type="text/html"; boundary="${boundary}"\r\n\r\n`;

        // 1. Primary HTML Document Part
        mhtml += `--${boundary}\r\n`;
        mhtml += `Content-Type: text/html; charset="utf-8"\r\n`;
        mhtml += `Content-Transfer-Encoding: quoted-printable\r\n\r\n`;

        const fullHtml = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Campus Birthday Hub - Student Birthday Profile Sheet</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        @page {
            size: A4 portrait;
            margin: 20mm 15mm 20mm 15mm;
            mso-header-margin: 10mm;
            mso-footer-margin: 10mm;
        }
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            background-color: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 0;
        }
        .page-break {
            page-break-before: always;
            mso-break-type: section-break;
            clear: both;
        }
    </style>
</head>
<body>
    ${bodyHtml}
</body>
</html>
        `;

        // Simple quoted-printable escaping for '=' sign
        mhtml += fullHtml.replace(/=/g, '=3D') + `\r\n\r\n`;

        // 2. Attached Image Parts
        for (const img of imagesList) {
            // img.cid: filename reference, img.base64: data URL
            const rawB64 = img.base64.replace(/^data:image\/\w+;base64,/, '');

            mhtml += `--${boundary}\r\n`;
            mhtml += `Content-Type: image/jpeg\r\n`;
            mhtml += `Content-Transfer-Encoding: base64\r\n`;
            mhtml += `Content-Location: ${img.cid}\r\n\r\n`;
            mhtml += `${rawB64}\r\n\r\n`;
        }

        mhtml += `--${boundary}--\r\n`;
        return mhtml;
    }

    /**
     * Download an individual student's birthday profile sheet as a Word document (.doc)
     */
    async exportSingleStudent(studentOrId) {
        if (this.isExporting) return;
        this.isExporting = true;

        try {
            let student = null;
            if (typeof studentOrId === 'string') {
                const students = (window.app && window.app.students) || [];
                student = students.find(s => s.id === studentOrId);
                if (!student && window.dbService) {
                    student = await window.dbService.getProfileByStudentId(studentOrId);
                }
            } else {
                student = studentOrId;
            }

            if (!student) {
                window.showToast("Could not find student details to export.", "warning");
                return;
            }

            window.showToast(`Preparing Word document for ${student.full_name}...`, "info");

            // Convert photo to Base64
            const photoUrl = student.profile_photo_url;
            const base64Data = await this.urlToBase64(photoUrl, student.full_name);
            const cid = `photo_${Date.now()}_0.jpg`;

            const sheetHtml = this.buildStudentSheetHtml(student, cid);
            const imagesList = [{ cid, base64: base64Data }];

            const mhtmlContent = this.packageMhtmlDoc(sheetHtml, imagesList);

            // Trigger file download
            const blob = new Blob([mhtmlContent], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            const cleanName = (student.preferred_name || student.full_name || 'student')
                .replace(/[^a-zA-Z0-9_\-]/g, '_');
            link.href = url;
            link.download = `${cleanName}_Birthday_Profile.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            window.showToast(`Word sheet downloaded for ${student.full_name}!`, "success");

        } catch (err) {
            console.error("Export error:", err);
            window.showToast("Failed to download Word document: " + err.message, "error");
        } finally {
            this.isExporting = false;
        }
    }

    /**
     * Download ALL students into a single consolidated Word document (.doc)
     * Each student receives their own page with their photo and details.
     */
    async exportAllStudents() {
        if (this.isExporting) return;
        this.isExporting = true;

        try {
            const students = (window.app && window.app.students) || [];
            if (!students || students.length === 0) {
                window.showToast("No student records available to export.", "warning");
                return;
            }

            window.showToast(`Processing Word document for ${students.length} students with photos...`, "info");

            const sheetsHtmlArr = [];
            const imagesList = [];

            // Process students
            for (let i = 0; i < students.length; i++) {
                const s = students[i];
                const cid = `student_photo_${i + 1}.jpg`;

                // Fetch Base64
                const base64Data = await this.urlToBase64(s.profile_photo_url, s.full_name);
                imagesList.push({ cid, base64: base64Data });

                const sheetHtml = this.buildStudentSheetHtml(s, cid);
                
                // Add page break between students
                if (i > 0) {
                    sheetsHtmlArr.push(`<div class="page-break" style="page-break-before: always; mso-break-type: section-break;"></div>`);
                }
                sheetsHtmlArr.push(sheetHtml);
            }

            const combinedHtml = sheetsHtmlArr.join('\n');
            const mhtmlContent = this.packageMhtmlDoc(combinedHtml, imagesList);

            // Trigger file download
            const blob = new Blob([mhtmlContent], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            const dateStr = new Date().toISOString().slice(0, 10);
            link.href = url;
            link.download = `Campus_Birthday_Hub_All_Students_${dateStr}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            window.showToast(`Word document with ${students.length} profile sheets downloaded!`, "success");

        } catch (err) {
            console.error("Bulk export error:", err);
            window.showToast("Failed to export Word document: " + err.message, "error");
        } finally {
            this.isExporting = false;
        }
    }
}

// Global singleton instance
window.wordExportService = new WordExportService();

