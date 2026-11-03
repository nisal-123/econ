/**
 * CAMPUS BIRTHDAY HUB - STUDENT PORTAL MODULE (SIMPLIFIED)
 * 
 * Only collects:
 * 1. Profile Photo
 * 2. Full Name
 * 3. Nickname / Preferred Name
 * 4. Birthday Date
 */

class StudentPortal {
    constructor() {
        this.currentProfile = null;
        this.selectedFile = null;
        this.photoPreviewUrl = null;
        this.isEditingExisting = false;
        this.activeMode = 'gform';
    }

    // Initialize portal view
    async init() {
        // By default show Google Form so submissions go directly to Nisal's Google Drive
        this.switchPortalMode('gform');
    }

    // Switch between Google Form (Direct to Drive) and Campus Hub Form
    switchPortalMode(mode) {
        this.activeMode = mode;
        const gformContainer = document.getElementById('portal-gform-container');
        const formContainer = document.getElementById('student-form-view');
        const statusContainer = document.getElementById('student-status-view');
        const lookupBar = document.getElementById('portal-hub-lookup-bar');
        const tabGform = document.getElementById('portal-tab-gform');
        const tabHub = document.getElementById('portal-tab-hub');

        if (mode === 'gform') {
            if (gformContainer) gformContainer.classList.remove('hidden');
            if (formContainer) formContainer.classList.add('hidden');
            if (statusContainer) statusContainer.classList.add('hidden');
            if (lookupBar) lookupBar.classList.add('hidden');

            if (tabGform) {
                tabGform.className = "flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 text-navy-700 dark:text-white shadow-sm flex items-center justify-center space-x-2 transition-all";
            }
            if (tabHub) {
                tabHub.className = "flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center space-x-2 transition-all";
            }
        } else {
            if (gformContainer) gformContainer.classList.add('hidden');
            if (lookupBar) lookupBar.classList.remove('hidden');

            if (this.currentProfile) {
                if (statusContainer) statusContainer.classList.remove('hidden');
                if (formContainer) formContainer.classList.add('hidden');
            } else {
                if (statusContainer) statusContainer.classList.add('hidden');
                if (formContainer) formContainer.classList.remove('hidden');
            }

            if (tabHub) {
                tabHub.className = "flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 text-navy-700 dark:text-white shadow-sm flex items-center justify-center space-x-2 transition-all";
            }
            if (tabGform) {
                tabGform.className = "flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center space-x-2 transition-all";
            }
        }
    }

    // Check if current browser has a saved student profile
    async loadSavedProfile() {
        const savedStudentId = localStorage.getItem('campus_bday_my_student_id');
        const savedStudentName = localStorage.getItem('campus_bday_my_student_name');

        if (savedStudentId) {
            try {
                const profile = await window.dbService.getProfileByStudentId(savedStudentId);
                if (profile) {
                    this.currentProfile = profile;
                    this.render();
                    return;
                }
            } catch (err) {
                console.warn("Could not load saved student profile:", err);
            }
        } else if (savedStudentName) {
            try {
                const profile = await window.dbService.getProfileByName(savedStudentName);
                if (profile) {
                    this.currentProfile = profile;
                    this.render();
                    return;
                }
            } catch (err) {
                console.warn("Could not load saved student name:", err);
            }
        }

        // If no saved submission, show submission form directly
        this.currentProfile = null;
        this.render();
    }

    // Lookup profile by Name or Nickname so students can find their profile on any device
    async lookupByName(nameQuery) {
        if (!nameQuery || !nameQuery.trim()) {
            window.showToast("Please enter a name or nickname to search.", "warning");
            return;
        }

        const cleanQuery = nameQuery.trim();
        try {
            const profile = await window.dbService.getProfileByName(cleanQuery);
            if (profile) {
                this.currentProfile = profile;
                localStorage.setItem('campus_bday_my_student_id', profile.student_id);
                localStorage.setItem('campus_bday_my_student_name', profile.full_name);
                this.switchPortalMode('hub');
                this.render();
                window.showToast(`Found profile for ${profile.full_name}!`, "success");
            } else {
                window.showToast(`No profile found matching "${cleanQuery}".`, "info");
            }
        } catch (err) {
            window.showToast("Error finding profile: " + err.message, "error");
        }
    }

    // Switch to new submission form
    createNewSubmission() {
        this.currentProfile = null;
        this.isEditingExisting = false;
        this.selectedFile = null;
        this.photoPreviewUrl = null;

        const form = document.getElementById('student-registration-form');
        if (form) form.reset();

        const formTitle = document.getElementById('form-submit-title');
        if (formTitle) formTitle.textContent = "Submit Birthday Profile";

        const submitBtnText = document.getElementById('std-submit-btn-text');
        if (submitBtnText) submitBtnText.textContent = "Submit Birthday Details";

        const cancelBtn = document.getElementById('std-cancel-edit-btn');
        if (cancelBtn) cancelBtn.classList.add('hidden');

        this.removePhoto();

        this.switchPortalMode('hub');
    }

    // Render Student Portal UI
    render() {
        const statusContainer = document.getElementById('student-status-view');
        const formContainer = document.getElementById('student-form-view');

        if (!statusContainer || !formContainer) return;

        // If student has already submitted a profile in this device
        if (this.currentProfile) {
            this.renderStatusCard(this.currentProfile);
            statusContainer.classList.remove('hidden');
            formContainer.classList.add('hidden');
        } else {
            // New direct submission form
            statusContainer.classList.add('hidden');
            formContainer.classList.remove('hidden');
        }
    }

    // Render status card showing submitted details and review status
    renderStatusCard(profile) {
        const statusContainer = document.getElementById('student-status-view');
        if (!statusContainer) return;

        let statusBadge = '';
        let statusNotice = '';

        if (profile.approval_status === 'approved') {
            statusBadge = `
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <i class="fa-solid fa-circle-check mr-1.5"></i> Verified & Approved
                </span>
            `;
            statusNotice = `
                <div class="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-200 flex items-start space-x-3">
                    <i class="fa-solid fa-bullhorn text-emerald-600 mt-0.5 text-base"></i>
                    <div>
                        <p class="font-semibold">Your birthday profile is active & verified!</p>
                        <p class="text-xs mt-0.5 opacity-90">The birthday post designer has your details ready for your celebration post.</p>
                    </div>
                </div>
            `;
        } else if (profile.approval_status === 'correction_requested') {
            statusBadge = `
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                    <i class="fa-solid fa-triangle-exclamation mr-1.5"></i> Needs Correction
                </span>
            `;
            statusNotice = `
                <div class="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-sm text-rose-800 dark:text-rose-200 flex items-start space-x-3">
                    <i class="fa-solid fa-circle-exclamation text-rose-600 mt-0.5 text-base"></i>
                    <div>
                        <p class="font-semibold">Admin Feedback / Correction Required:</p>
                        <p class="text-xs mt-1 bg-white/70 dark:bg-rose-900/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800">${profile.admin_notes || 'Please update your submitted photo or info to proceed.'}</p>
                        <p class="text-xs mt-2 font-medium">Click "Edit Submitted Details" below to make corrections and resubmit.</p>
                    </div>
                </div>
            `;
        } else {
            statusBadge = `
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    <i class="fa-solid fa-clock mr-1.5"></i> Pending Admin Verification
                </span>
            `;
            statusNotice = `
                <div class="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200 flex items-start space-x-3">
                    <i class="fa-solid fa-hourglass-half text-amber-600 mt-0.5 text-base"></i>
                    <div>
                        <p class="font-semibold">Submission Under Review</p>
                        <p class="text-xs mt-0.5 opacity-90">Your profile has been submitted and will be verified by the admin shortly.</p>
                    </div>
                </div>
            `;
        }

        const bdayCalc = window.birthdayCalendar.calculateNextBirthday(profile.birthday_date);

        statusContainer.innerHTML = `
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                
                <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <span class="text-xs font-mono text-slate-400">Your Submitted Birthday Record</span>
                    <button onclick="window.studentPortal.createNewSubmission()" class="text-xs font-semibold text-navy-600 dark:text-navy-400 hover:underline flex items-center space-x-1">
                        <i class="fa-solid fa-plus text-[10px]"></i>
                        <span>Submit for Another Person</span>
                    </button>
                </div>

                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                    <div class="flex items-center space-x-4">
                        <img src="${profile.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" 
                             alt="${profile.full_name}" 
                             class="w-20 h-20 rounded-2xl object-cover ring-4 ring-navy-100 dark:ring-navy-900 shadow-md">
                        <div>
                            <div class="flex items-center space-x-2">
                                <h3 class="text-xl font-bold text-slate-900 dark:text-white">${profile.full_name}</h3>
                                ${profile.preferred_name ? `<span class="text-sm font-semibold text-purple-600 dark:text-purple-400">("${profile.preferred_name}")</span>` : ''}
                            </div>
                            <div class="mt-2">
                                ${statusBadge}
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button onclick="window.googleSyncService.openGoogleCalendar(window.studentPortal.currentProfile)" 
                                title="Add to Google Calendar with 1-day reminder" 
                                class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center space-x-1.5">
                            <i class="fa-brands fa-google text-sm"></i>
                            <span>Google Calendar</span>
                        </button>
                        <a href="${window.googleFormService.getPrefilledUrl(window.studentPortal.currentProfile)}" 
                           target="_blank"
                           title="Open Google Form with these details"
                           class="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center space-x-1.5">
                            <i class="fa-solid fa-square-poll-vertical text-purple-600"></i>
                            <span>Google Form</span>
                        </a>
                        <button onclick="window.wordExportService.exportSingleStudent(window.studentPortal.currentProfile)" 
                                class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center space-x-1.5">
                            <i class="fa-solid fa-file-word text-sm"></i>
                            <span>Download Word (.doc)</span>
                        </button>
                        <button onclick="window.studentPortal.enableEditMode()" 
                                class="px-3.5 py-2 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center space-x-1.5">
                            <i class="fa-solid fa-pen-to-square text-sm"></i>
                            <span>Edit Details</span>
                        </button>
                    </div>
                </div>

                ${statusNotice}

                <!-- Dedicated Word Sheet Download Banner -->
                <div class="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                    <div class="flex items-center space-x-3.5">
                        <div class="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 text-lg">
                            <i class="fa-solid fa-file-word"></i>
                        </div>
                        <div>
                            <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Download Your Details as a Word Document (.doc)</h4>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Contains your embedded photo, full name, nickname, and birthday formatted for printing or office archiving.</p>
                        </div>
                    </div>
                    <button onclick="window.wordExportService.exportSingleStudent(window.studentPortal.currentProfile)" 
                            class="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 shrink-0 transition-all flex items-center justify-center space-x-1.5">
                        <i class="fa-solid fa-download"></i>
                        <span>Download Word Sheet</span>
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span class="text-xs uppercase tracking-wider text-slate-500 font-semibold">Birthday Date</span>
                        <p class="text-base font-bold text-slate-900 dark:text-white mt-1">
                            <i class="fa-solid fa-cake-candles text-amber-500 mr-1.5"></i>
                            ${bdayCalc ? bdayCalc.formattedDate : profile.birthday_date}
                        </p>
                        <p class="text-xs text-navy-600 dark:text-navy-400 font-medium mt-1">
                            ${bdayCalc?.isToday ? '🎉 Celebrating Today!' : (bdayCalc ? `In ${bdayCalc.daysUntil} days` : '')}
                        </p>
                    </div>

                    <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <span class="text-xs uppercase tracking-wider text-slate-500 font-semibold">Nickname on Post</span>
                            <p class="text-base font-bold text-purple-600 dark:text-purple-400 mt-1">
                                ${profile.preferred_name || profile.full_name.split(' ')[0]}
                            </p>
                        </div>
                        <button onclick="window.app.navigate('designer'); window.postDesigner.selectStudent(window.studentPortal.currentProfile)" class="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm">
                            <i class="fa-solid fa-wand-magic-sparkles"></i>
                            <span>View Post</span>
                        </button>
                    </div>
                </div>

                <!-- Big Call to Action to Add Another Student -->
                <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl">
                    <div>
                        <h5 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">Need to save another student's birthday details?</h5>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Click below to open a clean form and add another student.</p>
                    </div>
                    <button onclick="window.studentPortal.createNewSubmission()" 
                            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all shrink-0">
                        <i class="fa-solid fa-user-plus text-sm"></i>
                        <span>+ Add Another Person</span>
                    </button>
                </div>
            </div>
        `;
    }

    // Switch from status card to edit form
    enableEditMode() {
        const statusContainer = document.getElementById('student-status-view');
        const formContainer = document.getElementById('student-form-view');

        if (!this.currentProfile) return;
        this.isEditingExisting = true;

        const p = this.currentProfile;
        document.getElementById('std-fullname').value = p.full_name || '';
        document.getElementById('std-preferred').value = p.preferred_name || '';
        document.getElementById('std-bday').value = p.birthday_date || '';

        if (p.profile_photo_url) {
            this.setPhotoPreview(p.profile_photo_url);
        }

        const formTitle = document.getElementById('form-submit-title');
        if (formTitle) formTitle.textContent = "Update Birthday Profile";

        const submitBtn = document.getElementById('std-submit-btn-text');
        if (submitBtn) submitBtn.textContent = "Save Changes & Update Profile";

        const cancelBtn = document.getElementById('std-cancel-edit-btn');
        if (cancelBtn) cancelBtn.classList.remove('hidden');

        statusContainer.classList.add('hidden');
        formContainer.classList.remove('hidden');
    }

    cancelEdit() {
        if (this.currentProfile) {
            this.render();
        }
    }

    // Set photo preview in UI
    setPhotoPreview(srcUrl) {
        this.photoPreviewUrl = srcUrl;
        const previewImg = document.getElementById('photo-preview-img');
        const previewPlaceholder = document.getElementById('photo-upload-placeholder');
        const previewContainer = document.getElementById('photo-preview-container');

        if (previewImg && previewPlaceholder && previewContainer) {
            previewImg.src = srcUrl;
            previewContainer.classList.remove('hidden');
            previewPlaceholder.classList.add('hidden');
        }
    }

    removePhoto() {
        this.selectedFile = null;
        this.photoPreviewUrl = null;
        const previewImg = document.getElementById('photo-preview-img');
        const previewPlaceholder = document.getElementById('photo-upload-placeholder');
        const previewContainer = document.getElementById('photo-preview-container');
        const fileInput = document.getElementById('std-photo');

        if (fileInput) fileInput.value = '';
        if (previewImg) previewImg.src = '';
        if (previewContainer) previewContainer.classList.add('hidden');
        if (previewPlaceholder) previewPlaceholder.classList.remove('hidden');
    }

    // Handle photo file selection from input
    handlePhotoSelect(file) {
        if (!file) return;

        // Size check (5MB)
        const maxBytes = window.APP_CONFIG.MAX_PHOTO_SIZE_MB * 1024 * 1024;
        if (file.size > maxBytes) {
            window.showToast(`Photo exceeds the 5 MB size limit (${(file.size / 1024 / 1024).toFixed(1)} MB). Please select a smaller photo.`, "error");
            return;
        }

        // Format check
        if (!window.APP_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
            window.showToast("Unsupported image format. Please upload JPG, PNG, or WEBP.", "error");
            return;
        }

        this.selectedFile = file;

        // Create local object URL for instant preview
        const previewUrl = URL.createObjectURL(file);
        this.setPhotoPreview(previewUrl);
    }

    // Handle Form Submit: Only Full Name, Nickname, Birthday Date, and Photo!
    async handleSubmit(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('std-submit-btn');
        const btnText = document.getElementById('std-submit-btn-text');
        const btnSpinner = document.getElementById('std-submit-spinner');

        try {
            // Gather the 3 fields
            const fullName = document.getElementById('std-fullname').value.trim();
            const preferredName = document.getElementById('std-preferred').value.trim();
            const birthdayDate = document.getElementById('std-bday').value;

            // Form Validation
            if (!fullName) throw new Error("Full Name is required.");
            if (!birthdayDate) throw new Error("Please select your Birthday Date.");

            // Check photo
            let photoUrl = this.currentProfile?.profile_photo_url || null;
            let photoPath = this.currentProfile?.profile_photo_path || null;

            if (!this.selectedFile && !photoUrl) {
                throw new Error("Please upload a personal profile photo.");
            }

            // Start loading state
            if (submitBtn) submitBtn.disabled = true;
            if (btnSpinner) btnSpinner.classList.remove('hidden');
            if (btnText) btnText.textContent = "Uploading & Saving...";

            // Auto-generate or reuse ID only if explicitly editing an existing student
            let studentId;
            let existingId = null;

            if (this.isEditingExisting && this.currentProfile) {
                studentId = this.currentProfile.student_id;
                existingId = this.currentProfile.id;
            } else {
                studentId = 'ID-' + Math.floor(1000 + Math.random() * 9000);
            }

            // Upload photo if a new one was selected
            if (this.selectedFile) {
                const uploadRes = await window.dbService.uploadPhoto(this.selectedFile, studentId.replace(/[^a-zA-Z0-9]/g, ''));
                photoUrl = uploadRes.url;
                photoPath = uploadRes.path;
            }

            // Construct payload
            const payload = {
                student_id: studentId,
                full_name: fullName,
                preferred_name: preferredName || fullName.split(' ')[0],
                birthday_date: birthdayDate,
                department: window.APP_CONFIG.DEFAULT_DEPARTMENT,
                degree_programme: null,
                batch: null,
                profile_photo_url: photoUrl,
                profile_photo_path: photoPath,
                consent_social_media: true,
                consent_public_calendar: true,
                approval_status: (this.isEditingExisting && this.currentProfile?.approval_status === 'approved') ? 'approved' : 'pending',
                admin_notes: (this.isEditingExisting && this.currentProfile?.approval_status === 'correction_requested') ? '' : ((this.isEditingExisting && this.currentProfile?.admin_notes) || '')
            };

            if (existingId) {
                payload.id = existingId;
            }

            const saved = await window.dbService.upsertStudentProfile(payload);
            this.currentProfile = saved;
            this.isEditingExisting = false;

            // Trigger automatic sync to Nisal's Google Drive & Calendar if configured
            if (window.googleSyncService) {
                window.googleSyncService.syncStudentToGoogle(saved, photoUrl).then(res => {
                    if (res && res.synced) {
                        window.showToast("Saved to Nisal's Google Drive & Calendar!", "info");
                    }
                }).catch(e => console.log("Google sync background log:", e));
            }

            // Automatically submit to Nisal's Google Form
            if (window.googleFormService) {
                window.googleFormService.submitStudentToGoogleForm(saved, photoUrl)
                    .then(() => console.log("Google Form background submission dispatched"))
                    .catch(err => console.log("Google Form background note:", err));
            }

            // Remember in localStorage
            localStorage.setItem('campus_bday_my_student_id', studentId);
            localStorage.setItem('campus_bday_my_student_name', fullName);

            window.showToast("Birthday profile submitted successfully! You can now download your Word sheet.", "success");

            // Confetti animation
            if (window.confetti) {
                window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
            }

            // Re-render
            this.render();
            if (window.app) window.app.refreshData();

        } catch (err) {
            console.error("Submission error:", err);
            window.showToast(err.message || "Failed to submit profile", "error");
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            if (btnSpinner) btnSpinner.classList.add('hidden');
            if (btnText) btnText.textContent = this.currentProfile ? "Save Changes & Update Profile" : "Submit Birthday Details";
        }
    }
}

window.studentPortal = new StudentPortal();
