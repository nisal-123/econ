/**
 * CAMPUS BIRTHDAY HUB - AUTHENTICATION & ROLE MANAGEMENT MODULE
 * 
 * Manages Supabase Auth, login/signup modals, fast role switcher for testing,
 * and user session state synchronization.
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = 'student';
    }

    async init() {
        const session = await window.dbService.getCurrentUser();
        if (session) {
            this.currentUser = session.user;
            this.currentRole = session.role;
        }
        this.updateAuthUI();
    }

    // Update navbar and role pills
    updateAuthUI() {
        const adminNavTab = document.getElementById('nav-admin-tab');
        const designerNavTab = document.getElementById('nav-designer-tab');

        // Always keep designer and admin tabs accessible
        if (adminNavTab) adminNavTab.classList.remove('hidden');
        if (designerNavTab) designerNavTab.classList.remove('hidden');

        // Update active role pill in navbar
        const role = this.currentRole || 'student';
        ['student', 'designer', 'admin'].forEach(r => {
            const pill = document.getElementById(`role-pill-${r}`);
            if (pill) {
                if (r === role) {
                    let activeBg = 'bg-white dark:bg-slate-700 text-navy-700 dark:text-white shadow-sm';
                    if (r === 'designer') activeBg = 'bg-purple-600 text-white shadow-sm';
                    if (r === 'admin') activeBg = 'bg-rose-600 text-white shadow-sm';
                    pill.className = `px-2.5 py-1 rounded-lg text-xs font-bold ${activeBg} transition-all`;
                } else {
                    pill.className = 'px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors';
                }
            }
        });

        // Inform student portal
        if (window.studentPortal) {
            window.studentPortal.loadSavedProfile();
        }
    }

    // Sign In handler
    async handleSignIn(e) {
        e.preventDefault();
        const email = document.getElementById('auth-signin-email').value.trim();
        const password = document.getElementById('auth-signin-password').value;

        if (!email || !password) {
            window.showToast("Please enter your email and password", "warning");
            return;
        }

        try {
            const res = await window.dbService.signIn(email, password);
            this.currentUser = res.user;
            this.currentRole = res.role;
            this.updateAuthUI();
            window.closeModal('auth-modal');
            window.showToast(`Signed in successfully as ${res.role}!`, "success");
            if (window.app) window.app.refreshData();
        } catch (err) {
            window.showToast(err.message || "Failed to sign in", "error");
        }
    }

    // Sign Up handler
    async handleSignUp(e) {
        e.preventDefault();
        const fullName = document.getElementById('auth-signup-name').value.trim();
        const email = document.getElementById('auth-signup-email').value.trim();
        const password = document.getElementById('auth-signup-password').value;

        if (!fullName || !email || !password) {
            window.showToast("Please fill in all registration fields", "warning");
            return;
        }

        if (password.length < 6) {
            window.showToast("Password must be at least 6 characters", "warning");
            return;
        }

        try {
            const res = await window.dbService.signUp(email, password, fullName);
            this.currentUser = res.user;
            this.currentRole = res.role;
            this.updateAuthUI();
            window.closeModal('auth-modal');
            window.showToast("Account created successfully! Welcome to Campus Birthday Hub.", "success");
            if (window.app) window.app.refreshData();
        } catch (err) {
            window.showToast(err.message || "Registration failed", "error");
        }
    }

    // Fast Role Switcher (Especially convenient for GitHub Pages demos)
    async switchRoleQuick(role) {
        window.dbService.setDemoRole(role);
        this.currentRole = role;

        if (!this.currentUser) {
            // Create a temporary mock user
            const mockUser = {
                id: 'demo-user-' + role,
                email: `${role}@campus.ac.lk`,
                user_metadata: { full_name: role === 'admin' ? 'Department Admin' : (role === 'designer' ? 'Creative Post Designer' : 'Student Member') }
            };
            this.currentUser = mockUser;
            window.dbService.currentUser = mockUser;
        }

        this.updateAuthUI();
        window.showToast(`Role switched to: ${role.toUpperCase()}`, "info");

        // Route to the corresponding page for comfort
        if (role === 'admin') {
            window.app.navigate('admin');
        } else if (role === 'designer') {
            window.app.navigate('designer');
        } else {
            window.app.navigate('portal');
        }
    }

    // Sign Out
    async signOut() {
        await window.dbService.signOut();
        this.currentUser = null;
        this.currentRole = 'student';
        this.updateAuthUI();
        window.showToast("Signed out successfully", "info");
        window.app.navigate('home');
    }
}

window.authManager = new AuthManager();

