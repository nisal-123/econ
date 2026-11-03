/**
 * CAMPUS BIRTHDAY HUB - MAIN APPLICATION CONTROLLER
 * 
 * Orchestrates routing, view rendering, dark/light theme, toast alerts,
 * modal dialogs, and initial bootstrap.
 */

class CampusBirthdayApp {
    constructor() {
        this.currentView = 'home';
        this.students = [];
        this.pendingSecurityTarget = null;
    }

    async init() {
        this.initTheme();
        this.initEventListeners();
        await window.authManager.init();
        await this.refreshData();

        // Check URL hash for routing
        const hash = window.location.hash.replace('#', '') || 'home';
        this.navigate(hash, false);

        // Update connection status pill
        this.updateConnectionPill();

        // Initialize Google Sheet Live Sync for Google Form submissions
        if (window.googleSheetSync) {
            window.googleSheetSync.init();
        }

        console.log("Campus Birthday Hub loaded successfully!");
    }

    // Refresh all data from database or demo storage
    async refreshData() {
        try {
            this.students = await window.dbService.fetchStudentProfiles();

            // Feed to modules
            if (window.birthdayCalendar) {
                window.birthdayCalendar.setStudents(this.students);
                this.renderHomeCelebrations();
                this.renderCalendarView();
            }

            if (window.adminDashboard) {
                window.adminDashboard.setStudents(this.students);
            }

            if (window.postDesigner) {
                window.postDesigner.allStudents = this.students;
                this.renderDesignerStudentList();
            }

            if (window.studentPortal) {
                await window.studentPortal.loadSavedProfile();
            }

        } catch (err) {
            console.error("Error refreshing application data:", err);
            window.showToast("Failed to refresh records: " + err.message, "error");
        }
    }

    // ==========================================
    // NAVIGATION & VIEW SWITCHER
    // ==========================================
    navigate(viewId, updateHash = true) {
        const validViews = ['home', 'calendar', 'portal', 'designer', 'admin'];
        if (!validViews.includes(viewId)) viewId = 'home';

        // Security PIN Check for Designer and Admin tabs (Password: 0715157912)
        const RESTRICTED_VIEWS = ['designer', 'admin'];
        const ACCESS_PIN = '0715157912';

        if (RESTRICTED_VIEWS.includes(viewId)) {
            const isUnlocked = sessionStorage.getItem('campus_bday_auth_pin') === ACCESS_PIN;
            if (!isUnlocked) {
                this.pendingSecurityTarget = viewId;
                this.showSecurityPrompt(viewId);
                return;
            }
        }

        // Direct access for unlocked sections
        if (viewId === 'admin') {
            window.authManager.currentRole = 'admin';
        } else if (viewId === 'designer') {
            window.authManager.currentRole = 'designer';
        }

        // Hide all views
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));

        // Show target view
        const targetSection = document.getElementById(`view-${viewId}`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        this.currentView = viewId;
        if (updateHash) {
            window.location.hash = viewId;
        }

        // Update nav links active styling
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkView = link.getAttribute('data-view');
            if (linkView === viewId) {
                link.className = "nav-link px-3.5 py-2 rounded-xl text-sm font-semibold bg-navy-50 text-navy-700 dark:bg-navy-950/60 dark:text-navy-300 transition-all";
            } else {
                link.className = "nav-link px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-navy-600 dark:hover:text-white transition-all";
            }
        });

        // Close mobile drawer if open
        const mobileMenu = document.getElementById('mobile-nav-drawer');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }

        // Trigger view specific re-renders
        if (viewId === 'portal' && window.studentPortal) {
            // Default to Google Form mode so details and photos store directly in Nisal's Google Drive
            window.studentPortal.switchPortalMode('gform');
        } else if (viewId === 'designer' && window.postDesigner) {
            // If no student is selected yet, select the first student with upcoming birthday
            if (!window.postDesigner.selectedStudent && this.students.length > 0) {
                const upcoming = window.birthdayCalendar.getCelebrationGroups().allUpcoming;
                window.postDesigner.selectStudent(upcoming[0] || this.students[0]);
            }
            window.postDesigner.render();
        } else if (viewId === 'calendar') {
            this.renderCalendarView();
        }
    }

    // ==========================================
    // SECURITY ACCESS PIN HANDLERS (Password: 0715157912)
    // ==========================================
    showSecurityPrompt(targetView) {
        const input = document.getElementById('security-pin-input');
        const err = document.getElementById('security-pin-error');
        const desc = document.getElementById('security-modal-desc');

        if (desc) {
            const targetName = targetView === 'admin' ? 'Admin Dashboard' : 'Birthday Post Designer Studio';
            desc.textContent = `Please enter the authorization password to access the ${targetName}.`;
        }

        if (input) {
            input.value = '';
            input.classList.remove('ring-2', 'ring-rose-500');
        }
        if (err) err.classList.add('hidden');

        window.openModal('security-pin-modal');
        setTimeout(() => { if (input) input.focus(); }, 150);
    }

    submitSecurityPin(e) {
        if (e) e.preventDefault();
        const input = document.getElementById('security-pin-input');
        const err = document.getElementById('security-pin-error');
        const entered = input ? input.value.trim() : '';
        const ACCESS_PIN = '0715157912';

        if (entered === ACCESS_PIN) {
            sessionStorage.setItem('campus_bday_auth_pin', ACCESS_PIN);
            if (err) err.classList.add('hidden');
            window.closeModal('security-pin-modal');
            window.showToast("Access granted! Welcome.", "success");

            const target = this.pendingSecurityTarget || 'admin';
            this.pendingSecurityTarget = null;
            this.navigate(target);
        } else {
            if (err) {
                err.classList.remove('hidden');
                err.textContent = "Incorrect password! Please try again.";
            }
            if (input) {
                input.classList.add('ring-2', 'ring-rose-500');
                input.select();
            }
            window.showToast("Incorrect password. Access denied.", "error");
        }
    }

    cancelSecurityPrompt() {
        this.pendingSecurityTarget = null;
        window.closeModal('security-pin-modal');
    }

    togglePinVisibility() {
        const input = document.getElementById('security-pin-input');
        const icon = document.getElementById('security-pin-eye');
        if (!input) return;

        if (input.type === 'password') {
            input.type = 'text';
            if (icon) {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        } else {
            input.type = 'password';
            if (icon) {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    }

    lockSecurity() {
        sessionStorage.removeItem('campus_bday_auth_pin');
        this.navigate('home');
        window.showToast("Workspace locked.", "info");
    }

    // ==========================================
    // RENDER: HOME SECTION CELEBRATIONS
    // ==========================================
    renderHomeCelebrations() {
        const groups = window.birthdayCalendar.getCelebrationGroups();
        
        // Update hero quick stats
        const totalEl = document.getElementById('hero-stat-total');
        const todayEl = document.getElementById('hero-stat-today');
        const weekEl = document.getElementById('hero-stat-week');

        if (totalEl) totalEl.textContent = this.students.length;
        if (todayEl) todayEl.textContent = groups.today.length;
        if (weekEl) weekEl.textContent = groups.thisWeek.length;

        // Today's Spotlight Container
        const todayContainer = document.getElementById('home-today-container');
        const todayList = document.getElementById('home-today-list');

        if (groups.today.length > 0) {
            if (todayContainer) todayContainer.classList.remove('hidden');
            if (todayList) {
                todayList.innerHTML = groups.today.map(s => `
                    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-xl hover:scale-[1.02] transition-transform">
                        <div class="bg-white dark:bg-slate-900 rounded-[15px] p-5 flex items-center space-x-4">
                            <div class="relative">
                                <img src="${s.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" 
                                     alt="${s.full_name}" 
                                     class="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400">
                                <span class="absolute -top-2 -right-2 text-xl animate-bounce">🎂</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 mb-1">
                                    ★ TODAY'S BIRTHDAY ★
                                </span>
                                <h4 class="text-base font-bold text-slate-900 dark:text-white truncate">${s.full_name}</h4>
                                <p class="text-xs text-slate-500 truncate">${s.degree_programme || s.department} • Batch ${s.batch || 'General'}</p>
                            </div>
                            <button onclick="window.app.openStudentModal('${s.id}')" 
                                    class="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors">
                                View Wishes
                            </button>
                        </div>
                    </div>
                `).join('');
            }

            // Trigger festive confetti once
            if (window.confetti && !this._homeConfettiShown) {
                this._homeConfettiShown = true;
                setTimeout(() => {
                    window.confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
                }, 500);
            }
        } else {
            if (todayContainer) todayContainer.classList.add('hidden');
        }

        // Upcoming Carousel/Grid
        const upcomingGrid = document.getElementById('home-upcoming-grid');
        if (upcomingGrid) {
            const nextCelebrations = groups.allUpcoming.slice(0, 6);
            if (nextCelebrations.length === 0) {
                upcomingGrid.innerHTML = `
                    <div class="col-span-full py-12 text-center text-slate-400">
                        <i class="fa-solid fa-cake-candles text-4xl mb-3 opacity-40"></i>
                        <p class="text-sm font-medium">No upcoming birthdays scheduled.</p>
                    </div>
                `;
            } else {
                upcomingGrid.innerHTML = nextCelebrations.map(s => {
                    const daysBadge = s.bday.isToday ? 
                        `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">Today! 🎉</span>` :
                        (s.bday.isTomorrow ?
                            `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">Tomorrow! 🎈</span>` :
                            `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-navy-100 text-navy-800 dark:bg-navy-900/60 dark:text-navy-300">In ${s.bday.daysUntil} days</span>`
                        );

                    return `
                        <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-navy-400 dark:hover:border-navy-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div class="flex items-start justify-between">
                                <div class="flex items-center space-x-3.5">
                                    <img src="${s.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" 
                                         alt="${s.full_name}" 
                                         class="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm">
                                    <div>
                                        <h4 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">${s.full_name}</h4>
                                        ${s.preferred_name ? `<p class="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5">"${s.preferred_name}"</p>` : ''}
                                    </div>
                                </div>
                            </div>

                            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                <div class="flex items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                                    <i class="fa-regular fa-calendar-days text-navy-500 mr-1.5"></i>
                                    <span>${s.bday.formattedDate}</span>
                                </div>
                                ${daysBadge}
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    // ==========================================
    // RENDER: CALENDAR VIEW
    // ==========================================
    renderCalendarView() {
        const cal = window.birthdayCalendar;
        const monthTitle = document.getElementById('cal-month-title');
        if (monthTitle) monthTitle.textContent = cal.getViewMonthName();

        const gridView = document.getElementById('cal-grid-view');
        const listView = document.getElementById('cal-list-view');

        if (cal.activeFilter.viewMode === 'grid') {
            if (gridView) gridView.classList.remove('hidden');
            if (listView) listView.classList.add('hidden');
            this.renderCalendarGrid();
        } else {
            if (gridView) gridView.classList.add('hidden');
            if (listView) listView.classList.remove('hidden');
            this.renderCalendarList();
        }
    }

    renderCalendarGrid() {
        const gridContainer = document.getElementById('cal-grid-cells');
        if (!gridContainer) return;

        const days = window.birthdayCalendar.getMonthGridDays();

        gridContainer.innerHTML = days.map(d => {
            if (!d.isCurrentMonth) {
                return `
                    <div class="min-h-[100px] p-2 bg-slate-50/50 dark:bg-slate-900/30 text-slate-300 dark:text-slate-700 text-xs font-semibold select-none border border-slate-100 dark:border-slate-800/50">
                        ${d.day}
                    </div>
                `;
            }

            const isToday = d.isToday;
            const students = d.students || [];

            return `
                <div class="min-h-[110px] p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col justify-between relative group ${isToday ? 'ring-2 ring-inset ring-amber-500 dark:ring-amber-400' : ''}">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold ${isToday ? 'w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center' : 'text-slate-700 dark:text-slate-300'}">
                            ${d.day}
                        </span>
                        ${isToday ? '<span class="text-[10px] uppercase tracking-wider font-extrabold text-amber-500">Today</span>' : ''}
                    </div>

                    <div class="mt-1 space-y-1 overflow-y-auto max-h-[75px] scrollbar-thin">
                        ${students.map(s => `
                            <button onclick="window.app.openStudentModal('${s.id}')" 
                                    class="w-full text-left p-1 rounded-lg bg-navy-50 hover:bg-navy-100 dark:bg-navy-950/60 dark:hover:bg-navy-900 text-navy-800 dark:text-navy-200 text-[11px] font-semibold flex items-center space-x-1.5 transition-colors truncate">
                                <img src="${s.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}" 
                                     alt="${s.full_name}" 
                                     class="w-4 h-4 rounded-full object-cover">
                                <span class="truncate">${s.preferred_name || s.full_name}</span>
                                <span class="text-[9px]">🎂</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderCalendarList() {
        const listContainer = document.getElementById('cal-list-container');
        if (!listContainer) return;

        const processed = window.birthdayCalendar.getProcessedStudents();
        const filtered = window.birthdayCalendar.filterStudents(processed);

        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <div class="py-16 text-center text-slate-400">
                    <i class="fa-solid fa-calendar-xmark text-4xl mb-3 opacity-40"></i>
                    <p class="text-sm font-medium">No student birthdays found matching criteria.</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = filtered.map(s => `
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                <div class="flex items-center space-x-4">
                    <img src="${s.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" 
                         alt="${s.full_name}" 
                         class="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800">
                    <div>
                        <div class="flex items-center space-x-2">
                            <h4 class="text-base font-bold text-slate-900 dark:text-white">${s.full_name}</h4>
                            ${s.preferred_name ? `<span class="text-xs text-slate-500">("${s.preferred_name}")</span>` : ''}
                        </div>
                        <p class="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5">${s.preferred_name ? `Nickname: "${s.preferred_name}"` : ''}</p>
                    </div>
                </div>

                <div class="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div class="text-right">
                        <p class="text-sm font-bold text-slate-900 dark:text-white">${s.bday.formattedDate}</p>
                        <p class="text-xs font-semibold ${s.bday.isToday ? 'text-amber-500' : 'text-navy-600 dark:text-navy-400'}">
                            ${s.bday.isToday ? 'Celebrating Today! 🎂' : `In ${s.bday.daysUntil} days`}
                        </p>
                    </div>
                    <button onclick="window.app.openStudentModal('${s.id}')" 
                            class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-navy-50 text-slate-700 hover:text-navy-700 dark:bg-slate-800 dark:hover:bg-navy-950/40 dark:text-slate-200 text-xs font-semibold transition-colors">
                        Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ==========================================
    // RENDER: DESIGNER STUDENT LIST
    // ==========================================
    renderDesignerStudentList() {
        const container = document.getElementById('designer-students-list');
        if (!container) return;

        let students = this.students;
        const q = (document.getElementById('designer-search-input')?.value || '').toLowerCase().trim();
        const statusFilter = document.getElementById('designer-status-filter')?.value || 'all';

        if (statusFilter !== 'all') {
            students = students.filter(s => (s.birthday_post_tasks?.post_status || 'pending') === statusFilter);
        }

        if (q) {
            students = students.filter(s => 
                (s.full_name || '').toLowerCase().includes(q) ||
                (s.preferred_name || '').toLowerCase().includes(q)
            );
        }

        if (students.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center text-xs text-slate-400">
                    No matching students found.
                </div>
            `;
            return;
        }

        container.innerHTML = students.map(s => {
            const isSelected = window.postDesigner?.selectedStudent?.id === s.id;
            const bdayCalc = window.birthdayCalendar.calculateNextBirthday(s.birthday_date);
            const task = s.birthday_post_tasks || {};

            let statusColor = 'bg-slate-200 text-slate-700';
            if (task.post_status === 'published') statusColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
            else if (task.post_status === 'design_completed') statusColor = 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
            else if (task.post_status === 'in_progress') statusColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';

            return `
                <div onclick="window.app.selectDesignerStudent('${s.id}')" 
                     class="p-3 rounded-xl cursor-pointer border transition-all flex items-center space-x-3 ${isSelected ? 'bg-navy-50/80 border-navy-500 dark:bg-navy-950/50 dark:border-navy-400 ring-2 ring-navy-400/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'}">
                    <img src="${s.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}" 
                         alt="${s.full_name}" 
                         class="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate">${s.full_name}</h5>
                            <span class="text-[10px] font-semibold text-navy-600 dark:text-navy-400 ml-1 shrink-0">${bdayCalc ? bdayCalc.shortDate : ''}</span>
                        </div>
                        <p class="text-[11px] text-purple-600 dark:text-purple-400 font-semibold truncate mt-0.5">${s.preferred_name ? `"${s.preferred_name}"` : 'Birthday'}</p>
                        <div class="mt-1 flex items-center space-x-1.5">
                            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusColor}">
                                ${task.post_status || 'Pending'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    selectDesignerStudent(id) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        window.postDesigner.selectStudent(student);
        this.renderDesignerStudentList();

        // Update designer workspace status form
        const task = student.birthday_post_tasks || {};
        const statusSelect = document.getElementById('designer-task-status');
        const notesInput = document.getElementById('designer-task-notes');

        if (statusSelect) statusSelect.value = task.post_status || 'pending';
        if (notesInput) notesInput.value = task.designer_notes || '';
    }

    async saveDesignerTask() {
        const student = window.postDesigner.selectedStudent;
        if (!student) return;

        const statusSelect = document.getElementById('designer-task-status');
        const notesInput = document.getElementById('designer-task-notes');

        const newStatus = statusSelect?.value || 'pending';
        const newNotes = notesInput?.value.trim() || '';

        try {
            await window.dbService.updatePostTask(student.id, {
                post_status: newStatus,
                designer_notes: newNotes,
                design_template: window.postDesigner.config.template,
                published_at: newStatus === 'published' ? new Date().toISOString() : null
            });

            window.showToast("Post status and designer notes saved!", "success");
            await this.refreshData();
        } catch (err) {
            window.showToast("Failed to save post status: " + err.message, "error");
        }
    }

    // ==========================================
    // STUDENT DETAILS POPUP MODAL
    // ==========================================
    openStudentModal(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        const bdayCalc = window.birthdayCalendar.calculateNextBirthday(student.birthday_date);

        document.getElementById('modal-std-photo').src = student.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
        document.getElementById('modal-std-name').textContent = student.full_name;
        document.getElementById('modal-std-pref').textContent = student.preferred_name ? `Nickname: "${student.preferred_name}"` : '';
        document.getElementById('modal-std-bday').textContent = bdayCalc ? bdayCalc.formattedDate : student.birthday_date;
        document.getElementById('modal-std-countdown').textContent = bdayCalc?.isToday ? 'Celebrating Today! 🎂🎉' : (bdayCalc ? `Birthday in ${bdayCalc.daysUntil} days` : '');

        // Action button for post designer
        const designerBtn = document.getElementById('modal-std-designer-btn');
        if (designerBtn) {
            designerBtn.onclick = () => {
                window.closeModal('student-detail-modal');
                this.navigate('designer');
                window.postDesigner.selectStudent(student);
            };
        }

        // Action button for downloading Word Sheet
        const wordBtn = document.getElementById('modal-std-word-btn');
        if (wordBtn) {
            wordBtn.onclick = () => {
                window.wordExportService.exportSingleStudent(student);
            };
        }

        // Action button for Google Calendar
        const gcalBtn = document.getElementById('modal-std-gcal-btn');
        if (gcalBtn) {
            gcalBtn.onclick = () => {
                window.googleSyncService.openGoogleCalendar(student);
            };
        }

        window.openModal('student-detail-modal');
    }

    // ==========================================
    // THEME (Dark / Light)
    // ==========================================
    initTheme() {
        const savedTheme = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.THEME);
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            this.updateThemeIcons(true);
        } else {
            document.documentElement.classList.remove('dark');
            this.updateThemeIcons(false);
        }
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
        this.updateThemeIcons(isDark);
        window.showToast(`Switched to ${isDark ? 'Dark' : 'Light'} theme`, 'info', 2000);
    }

    updateThemeIcons(isDark) {
        document.querySelectorAll('.theme-toggle-icon').forEach(icon => {
            if (isDark) {
                icon.className = "theme-toggle-icon fa-solid fa-sun text-amber-400";
            } else {
                icon.className = "theme-toggle-icon fa-solid fa-moon text-slate-600";
            }
        });
    }

    // ==========================================
    // SUPABASE CONNECTION STATUS PILL
    // ==========================================
    updateConnectionPill() {
        const pill = document.getElementById('db-connection-pill');
        if (!pill) return;

        if (window.dbService.isDemo) {
            pill.innerHTML = `
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Demo Mode (Active)</span>
            `;
            pill.className = "px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center space-x-1.5 cursor-pointer";
        } else {
            pill.innerHTML = `
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Supabase Connected</span>
            `;
            pill.className = "px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1.5 cursor-pointer";
        }
    }

    // ==========================================
    // EVENT LISTENERS & SETUP
    // ==========================================
    initEventListeners() {
        // Hash routing listener
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '') || 'home';
            this.navigate(hash, false);
        });

        // Initialize Canvas when designer opens
        setTimeout(() => {
            window.postDesigner.init('post-preview-canvas');
        }, 100);

        // Photo upload file input change & drag-and-drop
        const fileInput = document.getElementById('std-photo');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    window.studentPortal.handlePhotoSelect(e.target.files[0]);
                }
            });
        }

        const dropZone = document.getElementById('photo-drop-zone');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('border-navy-500', 'bg-navy-50/50');
            });
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('border-navy-500', 'bg-navy-50/50');
            });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-navy-500', 'bg-navy-50/50');
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    window.studentPortal.handlePhotoSelect(e.dataTransfer.files[0]);
                }
            });
        }

        // Student Portal Form Submit
        const studentForm = document.getElementById('student-registration-form');
        if (studentForm) {
            studentForm.addEventListener('submit', (e) => window.studentPortal.handleSubmit(e));
        }

        // Designer live control bindings
        this.bindDesignerControls();
    }

    bindDesignerControls() {
        const bindInput = (id, prop, isNumber = false) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', (e) => {
                    window.postDesigner.config[prop] = isNumber ? parseFloat(e.target.value) : e.target.value;
                    window.postDesigner.render();
                });
            }
        };

        bindInput('ctrl-headline', 'headline');
        bindInput('ctrl-name', 'studentName');
        bindInput('ctrl-subtitle', 'subtitle');
        bindInput('ctrl-wish', 'wishNote');
        bindInput('ctrl-zoom', 'photoZoom', true);
        bindInput('ctrl-offset-x', 'photoOffsetX', true);
        bindInput('ctrl-offset-y', 'photoOffsetY', true);

        // Photo shape
        document.querySelectorAll('.ctrl-shape-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shape = btn.getAttribute('data-shape');
                window.postDesigner.config.photoShape = shape;
                document.querySelectorAll('.ctrl-shape-btn').forEach(b => b.classList.remove('ring-2', 'ring-navy-600', 'bg-navy-50'));
                btn.classList.add('ring-2', 'ring-navy-600', 'bg-navy-50');
                window.postDesigner.render();
            });
        });

        // Stickers selector
        document.querySelectorAll('.ctrl-sticker-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sticker = btn.getAttribute('data-sticker');
                window.postDesigner.config.activeSticker = sticker;
                document.querySelectorAll('.ctrl-sticker-btn').forEach(b => b.classList.remove('ring-2', 'ring-navy-600', 'bg-navy-50'));
                btn.classList.add('ring-2', 'ring-navy-600', 'bg-navy-50');
                window.postDesigner.render();
            });
        });
    }
}

// Global Toast System
window.showToast = function(message, type = "info", duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    let bg = 'bg-slate-900 text-white';
    let icon = 'fa-solid fa-circle-info text-blue-400';

    if (type === 'success') {
        bg = 'bg-emerald-900 text-emerald-100 border border-emerald-700';
        icon = 'fa-solid fa-circle-check text-emerald-400';
    } else if (type === 'error') {
        bg = 'bg-rose-900 text-rose-100 border border-rose-700';
        icon = 'fa-solid fa-circle-exclamation text-rose-400';
    } else if (type === 'warning') {
        bg = 'bg-amber-900 text-amber-100 border border-amber-700';
        icon = 'fa-solid fa-triangle-exclamation text-amber-400';
    }

    toast.className = `flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-2xl ${bg} text-sm font-medium transform transition-all duration-300 translate-y-3 opacity-0`;
    toast.innerHTML = `
        <i class="${icon} text-base shrink-0"></i>
        <span class="flex-1">${message}</span>
        <button onclick="this.parentElement.remove()" class="text-white/60 hover:text-white ml-2">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-3', 'opacity-0');
    });

    // Auto dismiss
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

// Global Modal Utilities
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
};

// Bootstrap application on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.app = new CampusBirthdayApp();
    window.app.init();
});

