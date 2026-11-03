/**
 * CAMPUS BIRTHDAY HUB - SUPABASE SERVICE
 * 
 * Provides unified interface for Supabase Auth, Database, and Storage,
 * with automatic, full-featured Demo Mode fallback for GitHub Pages hosting.
 */

class SupabaseService {
    constructor() {
        this.client = null;
        this.isDemo = true;
        this.currentUser = null;
        this.currentUserRole = 'student';
        this.init();
    }

    init() {
        const url = window.APP_CONFIG.getUrl();
        const key = window.APP_CONFIG.getKey();

        if (window.APP_CONFIG.isConfigured() && window.supabase) {
            try {
                this.client = window.supabase.createClient(url, key);
                this.isDemo = window.APP_CONFIG.isDemoMode();
                console.log("Supabase client initialized successfully. Demo Mode:", this.isDemo);
            } catch (err) {
                console.warn("Error initializing Supabase client, falling back to Demo Mode:", err);
                this.isDemo = true;
            }
        } else {
            this.isDemo = true;
            console.log("Supabase not configured or library loading. Operating in Demo Mode.");
        }

        // Initialize seed data for demo mode if not present
        if (this.isDemo) {
            this.initDemoData();
        }

        // Restore active user session from localStorage if in demo mode
        if (this.isDemo) {
            const savedUser = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.ACTIVE_USER);
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    this.currentUser = parsed.user;
                    this.currentUserRole = parsed.role || 'student';
                } catch (e) {
                    console.error("Failed to restore demo session", e);
                }
            }
        }
    }

    // ==========================================
    // DEMO DATA SEEDING (Realistic University Dept)
    // ==========================================
    initDemoData() {
        const existingStudents = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS);
        if (!existingStudents) {
            const today = new Date();
            const y = today.getFullYear();
            const m = today.getMonth() + 1; // 1-12
            const d = today.getDate();

            // Helper to format YYYY-MM-DD
            const fmtDate = (year, month, day) => {
                const mm = String(month).padStart(2, '0');
                const dd = String(day).padStart(2, '0');
                return `${year}-${mm}-${dd}`;
            };

            // Calculate dates relative to today
            const addDays = (days) => {
                const target = new Date(today);
                target.setDate(today.getDate() + days);
                return fmtDate(2002, target.getMonth() + 1, target.getDate());
            };

            const sampleStudents = [
                {
                    id: "demo-std-1",
                    auth_user_id: "demo-user-1",
                    student_id: "SE/2021/042",
                    full_name: "Kasun Tharaka Perera",
                    preferred_name: "Kasun",
                    birthday_date: fmtDate(2001, m, d), // TODAY!
                    department: "Created by Nisal",
                    degree_programme: "BSc (Hons) in Software Engineering",
                    batch: "2021/2022",
                    contact_email: "kasun.perera@campus.ac.lk",
                    personal_note: "Excited for the final year project! Love AI & full-stack web dev.",
                    profile_photo_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
                    approval_status: "approved",
                    is_verified: true,
                    is_active: true,
                    consent_social_media: true,
                    consent_public_calendar: true,
                    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
                },
                {
                    id: "demo-std-2",
                    auth_user_id: "demo-user-2",
                    student_id: "CS/2022/108",
                    full_name: "Dilini Oshadi Wickramasinghe",
                    preferred_name: "Dilini",
                    birthday_date: addDays(1), // Tomorrow
                    department: "Created by Nisal",
                    degree_programme: "BSc (Hons) in Computer Science",
                    batch: "2022/2023",
                    contact_email: "dilini.w@campus.ac.lk",
                    personal_note: "Passionate UI/UX designer and classical dancer.",
                    profile_photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                    approval_status: "approved",
                    is_verified: true,
                    is_active: true,
                    consent_social_media: true,
                    consent_public_calendar: true,
                    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
                },
                {
                    id: "demo-std-3",
                    auth_user_id: "demo-user-3",
                    student_id: "SE/2021/015",
                    full_name: "Akila Bhanuka Jayawardena",
                    preferred_name: "Akila",
                    birthday_date: addDays(3), // In 3 days
                    department: "Created by Nisal",
                    degree_programme: "BSc (Hons) in Software Engineering",
                    batch: "2021/2022",
                    contact_email: "akila.b@campus.ac.lk",
                    personal_note: "Open-source contributor & competitive programmer.",
                    profile_photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                    approval_status: "approved",
                    is_verified: true,
                    is_active: true,
                    consent_social_media: true,
                    consent_public_calendar: true,
                    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
                },
                {
                    id: "demo-std-4",
                    auth_user_id: "demo-user-4",
                    student_id: "IT/2023/077",
                    full_name: "Rashmi Nimasha Silva",
                    preferred_name: "Rashmi",
                    birthday_date: addDays(5), // In 5 days
                    department: "Created by Nisal",
                    degree_programme: "BSc (Hons) in Information Technology",
                    batch: "2023/2024",
                    contact_email: "rashmi.silva@campus.ac.lk",
                    personal_note: "Robotics enthusiast & badminton player.",
                    profile_photo_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
                    approval_status: "approved",
                    is_verified: true,
                    is_active: true,
                    consent_social_media: true,
                    consent_public_calendar: true,
                    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
                },
                {
                    id: "demo-std-5",
                    auth_user_id: "demo-user-5",
                    student_id: "SE/2022/089",
                    full_name: "Sahan Kavinda Gunaratne",
                    preferred_name: "Sahan",
                    birthday_date: addDays(8), // In 8 days
                    department: "Created by Nisal",
                    degree_programme: "BSc (Hons) in Software Engineering",
                    batch: "2022/2023",
                    contact_email: "sahan.k@campus.ac.lk",
                    personal_note: "Cloud architect in making. AWS certified.",
                    profile_photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
                    approval_status: "approved",
                    is_verified: true,
                    is_active: true,
                    consent_social_media: true,
                    consent_public_calendar: true,
                    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
                },
                {
                    id: "demo-std-6",
                    auth_user_id: "demo-user-6",
                    student_id: "CS/2021/003",
                    full_name: "Nimna Kavindi Fernando",
                    preferred_name: "Nimna",
                    birthday_date: addDays(12), // In 12 days
                    department: "Created by Nisal",
                    degree_programme: "BSc (Hons) in Computer Science",
                    batch: "2021/2022",
                    contact_email: "nimna.f@campus.ac.lk",
                    personal_note: "Data Science & Machine Learning lover.",
                    profile_photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
                    approval_status: "pending", // Pending approval!
                    is_verified: false,
                    is_active: true,
                    consent_social_media: true,
                    consent_public_calendar: true,
                    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
                },
                {
                    id: "demo-std-7",
                    auth_user_id: "demo-user-7",
                    student_id: "IT/2022/054",
                    full_name: "Thisara Madushanka Weerasinghe",
                    preferred_name: "Thisara",
                    birthday_date: addDays(18),
                    department: "Created by Nisal",
                    degree_programme: "BSc (Hons) in Information Technology",
                    batch: "2022/2023",
                    contact_email: "thisara.m@campus.ac.lk",
                    personal_note: "Cybersecurity geek and CTF player.",
                    profile_photo_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
                    approval_status: "pending",
                    is_verified: false,
                    is_active: true,
                    consent_social_media: true,
                    consent_public_calendar: true,
                    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
                },
                {
                    id: "demo-std-8",
                    auth_user_id: "demo-user-8",
                    student_id: "SE/2023/112",
                    full_name: "Praveen Dinuka Senanayake",
                    preferred_name: "Praveen",
                    birthday_date: addDays(24),
                    department: "Created by Nisal",
                    degree_programme: "BSc (Hons) in Software Engineering",
                    batch: "2023/2024",
                    contact_email: "praveen.s@campus.ac.lk",
                    personal_note: "Mobile app developer (Flutter & Kotlin).",
                    profile_photo_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
                    approval_status: "correction_requested", // Needs correction
                    admin_notes: "Please upload a clearer front-facing portrait photo without sunglasses.",
                    is_verified: false,
                    is_active: true,
                    consent_social_media: true,
                    consent_public_calendar: true,
                    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
                },
                {
                    id: "demo-std-9",
                    auth_user_id: "demo-user-9",
                    student_id: "CS/2023/048",
                    full_name: "Chathuni Hansika Senaratne",
                    preferred_name: "Chathuni",
                    birthday_date: fmtDate(2002, 2, 29), // Leap Year Birthday!
                    department: "Created by Nisal",
                    degree_programme: "BSc (Hons) in Computer Science",
                    batch: "2023/2024",
                    contact_email: "chathuni.h@campus.ac.lk",
                    personal_note: "Born on a leap day! Celebrating uniquely every 4 years.",
                    profile_photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
                    approval_status: "approved",
                    is_verified: true,
                    is_active: true,
                    consent_social_media: true,
                    consent_public_calendar: true,
                    created_at: new Date(Date.now() - 40 * 86400000).toISOString()
                },
                {
                    id: "demo-std-10",
                    auth_user_id: "demo-user-10",
                    student_id: "SE/2020/001",
                    full_name: "Danuka Ruwan Kumara",
                    preferred_name: "Danuka",
                    birthday_date: fmtDate(2000, 11, 28),
                    department: "Created by Nisal",
                    degree_programme: "BSc (Hons) in Software Engineering",
                    batch: "2020/2021",
                    contact_email: "danuka.k@campus.ac.lk",
                    personal_note: "Senior batch rep & tech meetup organizer.",
                    profile_photo_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
                    approval_status: "approved",
                    is_verified: true,
                    is_active: true,
                    consent_social_media: true,
                    consent_public_calendar: true,
                    created_at: new Date(Date.now() - 50 * 86400000).toISOString()
                }
            ];

            const sampleTasks = [
                {
                    id: "task-1",
                    student_profile_id: "demo-std-1",
                    post_status: "published",
                    design_template: "navy_gold",
                    designer_notes: "Published on Department Instagram and LinkedIn! Got great engagement.",
                    published_at: new Date().toISOString()
                },
                {
                    id: "task-2",
                    student_profile_id: "demo-std-2",
                    post_status: "design_completed",
                    design_template: "purple_glass",
                    designer_notes: "Design finished, ready for scheduling tomorrow morning.",
                    published_at: null
                },
                {
                    id: "task-3",
                    student_profile_id: "demo-std-3",
                    post_status: "in_progress",
                    design_template: "fiesta_burst",
                    designer_notes: "Drafting graphics, waiting for greeting quote signoff.",
                    published_at: null
                },
                {
                    id: "task-4",
                    student_profile_id: "demo-std-4",
                    post_status: "pending",
                    design_template: "navy_gold",
                    designer_notes: "Birthday coming up in 5 days.",
                    published_at: null
                },
                {
                    id: "task-5",
                    student_profile_id: "demo-std-5",
                    post_status: "pending",
                    design_template: "minimal_luxury",
                    designer_notes: "",
                    published_at: null
                }
            ];

            localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS, JSON.stringify(sampleStudents));
            localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_POST_TASKS, JSON.stringify(sampleTasks));
        }
    }

    // ==========================================
    // AUTHENTICATION METHODS
    // ==========================================
    async signIn(email, password) {
        if (!this.isDemo && this.client) {
            const { data, error } = await this.client.auth.signInWithPassword({ email, password });
            if (error) throw error;
            this.currentUser = data.user;
            await this.refreshUserRole(data.user.id);
            return { user: data.user, role: this.currentUserRole };
        } else {
            // Demo Mode login:
            // Check if user credentials match admin or student
            let role = 'student';
            let name = email.split('@')[0];
            if (email.includes('admin')) {
                role = 'admin';
            } else if (email.includes('designer')) {
                role = 'designer';
            }

            const mockUser = {
                id: 'demo-user-' + Math.abs(this.hashCode(email)),
                email: email,
                user_metadata: { full_name: name }
            };

            this.currentUser = mockUser;
            this.currentUserRole = role;

            localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.ACTIVE_USER, JSON.stringify({
                user: mockUser,
                role: role
            }));

            return { user: mockUser, role };
        }
    }

    async signUp(email, password, fullName) {
        if (!this.isDemo && this.client) {
            const { data, error } = await this.client.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName }
                }
            });
            if (error) throw error;
            this.currentUser = data.user;
            this.currentUserRole = 'student';
            return { user: data.user, role: 'student' };
        } else {
            // Demo Mode Signup
            const role = email.includes('admin') ? 'admin' : (email.includes('designer') ? 'designer' : 'student');
            const mockUser = {
                id: 'demo-user-' + Math.abs(this.hashCode(email)),
                email: email,
                user_metadata: { full_name: fullName }
            };
            this.currentUser = mockUser;
            this.currentUserRole = role;

            localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.ACTIVE_USER, JSON.stringify({
                user: mockUser,
                role: role
            }));

            return { user: mockUser, role };
        }
    }

    async signOut() {
        if (!this.isDemo && this.client) {
            await this.client.auth.signOut();
        }
        this.currentUser = null;
        this.currentUserRole = 'student';
        localStorage.removeItem(window.APP_CONFIG.STORAGE_KEYS.ACTIVE_USER);
    }

    async getCurrentUser() {
        if (!this.isDemo && this.client) {
            const { data } = await this.client.auth.getUser();
            if (data?.user) {
                this.currentUser = data.user;
                await this.refreshUserRole(data.user.id);
                return { user: this.currentUser, role: this.currentUserRole };
            }
            return null;
        } else {
            if (this.currentUser) {
                return { user: this.currentUser, role: this.currentUserRole };
            }
            return null;
        }
    }

    async refreshUserRole(userId) {
        if (!this.isDemo && this.client) {
            try {
                const { data } = await this.client
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', userId)
                    .single();
                if (data && data.role) {
                    this.currentUserRole = data.role;
                } else {
                    this.currentUserRole = 'student';
                }
            } catch (e) {
                this.currentUserRole = 'student';
            }
        }
    }

    setDemoRole(role) {
        this.currentUserRole = role;
        if (this.currentUser) {
            localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.ACTIVE_USER, JSON.stringify({
                user: this.currentUser,
                role: role
            }));
        }
    }

    // ==========================================
    // STUDENT PROFILES DATABASE METHODS
    // ==========================================
    async fetchStudentProfiles(filters = {}) {
        if (!this.isDemo && this.client) {
            let query = this.client
                .from('student_profiles')
                .select(`
                    *,
                    birthday_post_tasks (
                        id, post_status, design_template, designer_notes, published_at
                    )
                `)
                .order('created_at', { ascending: false });

            if (filters.department) query = query.eq('department', filters.department);
            if (filters.batch) query = query.eq('batch', filters.batch);
            if (filters.approval_status) query = query.eq('approval_status', filters.approval_status);
            if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } else {
            // LocalStorage Demo Mode
            const raw = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS) || "[]";
            let students = JSON.parse(raw);

            // Merge with local tasks
            const rawTasks = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_POST_TASKS) || "[]";
            const tasks = JSON.parse(rawTasks);

            students = students.map(st => {
                const task = tasks.find(t => t.student_profile_id === st.id) || {
                    id: "task-" + st.id,
                    student_profile_id: st.id,
                    post_status: "pending",
                    design_template: "navy_gold",
                    designer_notes: ""
                };
                return {
                    ...st,
                    birthday_post_tasks: task
                };
            });

            if (filters.department) students = students.filter(s => s.department === filters.department);
            if (filters.batch) students = students.filter(s => s.batch === filters.batch);
            if (filters.approval_status) students = students.filter(s => s.approval_status === filters.approval_status);
            if (filters.is_active !== undefined) students = students.filter(s => s.is_active === filters.is_active);

            return students;
        }
    }

    async getProfileByUserId(userId) {
        if (!userId) return null;
        if (!this.isDemo && this.client) {
            const { data, error } = await this.client
                .from('student_profiles')
                .select(`
                    *,
                    birthday_post_tasks (
                        id, post_status, design_template, designer_notes, published_at
                    )
                `)
                .eq('auth_user_id', userId)
                .maybeSingle();
            if (error) throw error;
            return data;
        } else {
            const raw = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS) || "[]";
            const students = JSON.parse(raw);
            const found = students.find(s => s.auth_user_id === userId);
            if (found) {
                const rawTasks = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_POST_TASKS) || "[]";
                const tasks = JSON.parse(rawTasks);
                const task = tasks.find(t => t.student_profile_id === found.id);
                return { ...found, birthday_post_tasks: task || null };
            }
            return null;
        }
    }

    async getProfileByStudentId(studentId) {
        if (!studentId) return null;
        const cleanId = studentId.trim().toUpperCase();
        if (!this.isDemo && this.client) {
            const { data, error } = await this.client
                .from('student_profiles')
                .select(`
                    *,
                    birthday_post_tasks (
                        id, post_status, design_template, designer_notes, published_at
                    )
                `)
                .ilike('student_id', cleanId)
                .maybeSingle();
            if (error) throw error;
            return data;
        } else {
            const raw = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS) || "[]";
            const students = JSON.parse(raw);
            const found = students.find(s => (s.student_id || '').toUpperCase() === cleanId);
            if (found) {
                const rawTasks = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_POST_TASKS) || "[]";
                const tasks = JSON.parse(rawTasks);
                const task = tasks.find(t => t.student_profile_id === found.id);
                return { ...found, birthday_post_tasks: task || null };
            }
            return null;
        }
    }

    async getProfileByName(nameQuery) {
        if (!nameQuery) return null;
        const q = nameQuery.trim().toLowerCase();
        if (!this.isDemo && this.client) {
            const { data, error } = await this.client
                .from('student_profiles')
                .select(`
                    *,
                    birthday_post_tasks (
                        id, post_status, design_template, designer_notes, published_at
                    )
                `)
                .or(`full_name.ilike.%${q}%,preferred_name.ilike.%${q}%`)
                .limit(1)
                .maybeSingle();
            if (error) throw error;
            return data;
        } else {
            const raw = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS) || "[]";
            const students = JSON.parse(raw);
            const found = students.find(s => 
                (s.full_name || '').toLowerCase().includes(q) ||
                (s.preferred_name || '').toLowerCase().includes(q) ||
                (s.student_id || '').toLowerCase() === q
            );
            if (found) {
                const rawTasks = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_POST_TASKS) || "[]";
                const tasks = JSON.parse(rawTasks);
                const task = tasks.find(t => t.student_profile_id === found.id);
                return { ...found, birthday_post_tasks: task || null };
            }
            return null;
        }
    }

    async upsertStudentProfile(profile) {
        if (!this.isDemo && this.client) {
            const { data, error } = await this.client
                .from('student_profiles')
                .upsert(profile, { onConflict: 'student_id' })
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const raw = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS) || "[]";
            let students = JSON.parse(raw);

            const existingIndex = students.findIndex(s => s.student_id === profile.student_id || s.id === profile.id || (profile.auth_user_id && s.auth_user_id === profile.auth_user_id));

            let savedProfile;
            if (existingIndex >= 0) {
                savedProfile = {
                    ...students[existingIndex],
                    ...profile,
                    updated_at: new Date().toISOString()
                };
                students[existingIndex] = savedProfile;
            } else {
                savedProfile = {
                    id: "std-" + Date.now(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    approval_status: "pending",
                    is_verified: false,
                    is_active: true,
                    ...profile
                };
                students.unshift(savedProfile);

                // Create initial task
                const rawTasks = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_POST_TASKS) || "[]";
                const tasks = JSON.parse(rawTasks);
                tasks.push({
                    id: "task-" + savedProfile.id,
                    student_profile_id: savedProfile.id,
                    post_status: "pending",
                    design_template: "navy_gold",
                    designer_notes: "",
                    created_at: new Date().toISOString()
                });
                localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_POST_TASKS, JSON.stringify(tasks));
            }

            localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS, JSON.stringify(students));
            return savedProfile;
        }
    }

    async updateApprovalStatus(profileId, status, adminNotes = '') {
        const isVerified = status === 'approved';
        if (!this.isDemo && this.client) {
            const { data, error } = await this.client
                .from('student_profiles')
                .update({
                    approval_status: status,
                    is_verified: isVerified,
                    admin_notes: adminNotes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profileId)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const raw = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS) || "[]";
            let students = JSON.parse(raw);
            const idx = students.findIndex(s => s.id === profileId);
            if (idx >= 0) {
                students[idx].approval_status = status;
                students[idx].is_verified = isVerified;
                students[idx].admin_notes = adminNotes;
                students[idx].updated_at = new Date().toISOString();
                localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS, JSON.stringify(students));
                return students[idx];
            }
            throw new Error("Student not found");
        }
    }

    async deleteStudentProfile(profileId) {
        if (!this.isDemo && this.client) {
            const { error } = await this.client
                .from('student_profiles')
                .delete()
                .eq('id', profileId);
            if (error) throw error;
            return true;
        } else {
            const raw = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS) || "[]";
            let students = JSON.parse(raw);
            students = students.filter(s => s.id !== profileId);
            localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_STUDENTS, JSON.stringify(students));

            // Remove associated task
            const rawTasks = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_POST_TASKS) || "[]";
            let tasks = JSON.parse(rawTasks);
            tasks = tasks.filter(t => t.student_profile_id !== profileId);
            localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_POST_TASKS, JSON.stringify(tasks));

            return true;
        }
    }

    // ==========================================
    // BIRTHDAY POST TASKS (Designer Workspace)
    // ==========================================
    async updatePostTask(studentProfileId, updates) {
        if (!this.isDemo && this.client) {
            const { data, error } = await this.client
                .from('birthday_post_tasks')
                .upsert({
                    student_profile_id: studentProfileId,
                    ...updates,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'student_profile_id' })
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const rawTasks = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_POST_TASKS) || "[]";
            let tasks = JSON.parse(rawTasks);
            const idx = tasks.findIndex(t => t.student_profile_id === studentProfileId);

            let updatedTask;
            if (idx >= 0) {
                updatedTask = {
                    ...tasks[idx],
                    ...updates,
                    updated_at: new Date().toISOString()
                };
                tasks[idx] = updatedTask;
            } else {
                updatedTask = {
                    id: "task-" + studentProfileId,
                    student_profile_id: studentProfileId,
                    post_status: "pending",
                    design_template: "navy_gold",
                    ...updates,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                tasks.push(updatedTask);
            }

            localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LOCAL_POST_TASKS, JSON.stringify(tasks));
            return updatedTask;
        }
    }

    // ==========================================
    // PHOTO STORAGE UPLOAD
    // ==========================================
    async uploadPhoto(file, userId) {
        // Validation: 5MB size limit
        const maxSize = window.APP_CONFIG.MAX_PHOTO_SIZE_MB * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error(`File size exceeds maximum limit of ${window.APP_CONFIG.MAX_PHOTO_SIZE_MB}MB.`);
        }

        // Validation: file types
        if (!window.APP_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
            throw new Error("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
        }

        if (!this.isDemo && this.client) {
            const fileExt = file.name.split('.').pop() || 'jpg';
            const folder = userId ? `${userId}` : 'public';
            const fileName = `${folder}/${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExt}`;
            const bucketName = window.APP_CONFIG.PHOTO_BUCKET;

            const { data, error } = await this.client.storage
                .from(bucketName)
                .upload(fileName, file, {
                    upsert: true,
                    cacheControl: '3600'
                });

            if (error) throw error;

            const { data: publicUrlData } = this.client.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            return {
                url: publicUrlData.publicUrl,
                path: fileName
            };
        } else {
            // In Demo / Static hosting mode, convert image to base64 Data URL
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        url: e.target.result,
                        path: "local-" + Date.now() + "-" + file.name
                    });
                };
                reader.onerror = () => reject(new Error("Failed to read image file."));
                reader.readAsDataURL(file);
            });
        }
    }

    // Hash helper for mock user ids
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }
}

// Export singleton instance to window
window.dbService = new SupabaseService();

