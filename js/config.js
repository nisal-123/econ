/**
 * CAMPUS BIRTHDAY HUB - CONFIGURATION
 * 
 * Replace the empty strings below with your own Supabase project credentials,
 * or configure them directly via the in-app "Connect Supabase" settings modal.
 * 
 * To get your credentials:
 * 1. Go to https://supabase.com and create a free project.
 * 2. Go to Project Settings > API.
 * 3. Copy "Project URL" and the "anon public" key.
 */

const CONFIG = {
    // Put your default credentials here (optional, or configure via UI)
    SUPABASE_URL: window.CAMPUS_BDAY_SUPABASE_URL || "",
    SUPABASE_ANON_KEY: window.CAMPUS_BDAY_SUPABASE_ANON_KEY || "",

    // Storage bucket name
    PHOTO_BUCKET: "student-photos",

    // Department details
    DEFAULT_DEPARTMENT: "Created by Nisal",
    APP_NAME: "Campus Birthday Hub",
    MAX_PHOTO_SIZE_MB: 5,
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],

    // LocalStorage keys
    STORAGE_KEYS: {
        SUPABASE_URL: "campus_bday_supabase_url",
        SUPABASE_ANON_KEY: "campus_bday_supabase_key",
        DEMO_MODE: "campus_bday_demo_mode",
        LOCAL_STUDENTS: "campus_bday_local_students",
        LOCAL_POST_TASKS: "campus_bday_local_tasks",
        ACTIVE_USER: "campus_bday_active_user",
        THEME: "campus_bday_theme",
        GOOGLE_WEBHOOK_URL: "campus_bday_google_webhook_url",
        GOOGLE_FORM_URL: "campus_bday_google_form_url",
        GOOGLE_FORM_NAME_ENTRY: "campus_bday_gform_name_entry",
        GOOGLE_FORM_NICKNAME_ENTRY: "campus_bday_gform_nickname_entry",
        GOOGLE_FORM_BDAY_ENTRY: "campus_bday_gform_bday_entry",
        GOOGLE_FORM_PHOTO_ENTRY: "campus_bday_gform_photo_entry",
        GOOGLE_SHEET_URL: "campus_bday_google_sheet_url"
    },

    // Google Account Integration (nisalmuhandiram2004@gmail.com)
    GOOGLE_ACCOUNT: "nisalmuhandiram2004@gmail.com",

    // Google Form Details (Provided by user)
    DEFAULT_GOOGLE_FORM_URL: "https://docs.google.com/forms/d/e/1FAIpQLScbv2NCVvrCBsaW4sZPxl1ciXz8CietUpK3j150RUadPZGTAg/viewform",
    DEFAULT_GOOGLE_FORM_RESPONSE_URL: "https://docs.google.com/forms/d/e/1FAIpQLScbv2NCVvrCBsaW4sZPxl1ciXz8CietUpK3j150RUadPZGTAg/formResponse",

    // Default linked responses Google Sheet (can be pre-configured)
    DEFAULT_GOOGLE_SHEET_URL: "",

    getGoogleSheetUrl() {
        return localStorage.getItem(this.STORAGE_KEYS.GOOGLE_SHEET_URL) || this.DEFAULT_GOOGLE_SHEET_URL || "";
    },

    setGoogleSheetUrl(url) {
        if (url) {
            localStorage.setItem(this.STORAGE_KEYS.GOOGLE_SHEET_URL, url.trim());
        } else {
            localStorage.removeItem(this.STORAGE_KEYS.GOOGLE_SHEET_URL);
        }
    },

    extractSheetId(urlOrId) {
        if (!urlOrId) return "";
        const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9_\-]+)/);
        if (match && match[1]) return match[1];
        if (/^[a-zA-Z0-9_\-]+$/.test(urlOrId.trim())) return urlOrId.trim();
        return "";
    },

    getGoogleWebhookUrl() {
        return localStorage.getItem(this.STORAGE_KEYS.GOOGLE_WEBHOOK_URL) || "";
    },

    setGoogleWebhookUrl(url) {
        if (url) {
            localStorage.setItem(this.STORAGE_KEYS.GOOGLE_WEBHOOK_URL, url.trim());
        } else {
            localStorage.removeItem(this.STORAGE_KEYS.GOOGLE_WEBHOOK_URL);
        }
    },

    getGoogleFormUrl() {
        return localStorage.getItem(this.STORAGE_KEYS.GOOGLE_FORM_URL) || this.DEFAULT_GOOGLE_FORM_URL;
    },

    getGoogleFormResponseUrl() {
        const viewUrl = this.getGoogleFormUrl();
        return viewUrl.replace(/\/viewform(\?.*)?$/, '/formResponse');
    },

    getGoogleFormEntries() {
        return {
            name: localStorage.getItem(this.STORAGE_KEYS.GOOGLE_FORM_NAME_ENTRY) || "",
            nickname: localStorage.getItem(this.STORAGE_KEYS.GOOGLE_FORM_NICKNAME_ENTRY) || "",
            birthday: localStorage.getItem(this.STORAGE_KEYS.GOOGLE_FORM_BDAY_ENTRY) || "",
            photo: localStorage.getItem(this.STORAGE_KEYS.GOOGLE_FORM_PHOTO_ENTRY) || ""
        };
    },

    setGoogleFormEntries(nameEntry, nicknameEntry, bdayEntry, photoEntry) {
        if (nameEntry !== undefined) localStorage.setItem(this.STORAGE_KEYS.GOOGLE_FORM_NAME_ENTRY, nameEntry.trim());
        if (nicknameEntry !== undefined) localStorage.setItem(this.STORAGE_KEYS.GOOGLE_FORM_NICKNAME_ENTRY, nicknameEntry.trim());
        if (bdayEntry !== undefined) localStorage.setItem(this.STORAGE_KEYS.GOOGLE_FORM_BDAY_ENTRY, bdayEntry.trim());
        if (photoEntry !== undefined) localStorage.setItem(this.STORAGE_KEYS.GOOGLE_FORM_PHOTO_ENTRY, photoEntry.trim());
    },

    // Get current effective URL
    getUrl() {
        return localStorage.getItem(this.STORAGE_KEYS.SUPABASE_URL) || this.SUPABASE_URL || "";
    },

    // Get current effective anon key
    getKey() {
        return localStorage.getItem(this.STORAGE_KEYS.SUPABASE_ANON_KEY) || this.SUPABASE_ANON_KEY || "";
    },

    // Check if real Supabase credentials are configured
    isConfigured() {
        const url = this.getUrl();
        const key = this.getKey();
        return Boolean(url && key && url.startsWith("https://") && key.length > 20);
    },

    // Check if demo mode is active
    isDemoMode() {
        const stored = localStorage.getItem(this.STORAGE_KEYS.DEMO_MODE);
        if (stored !== null) {
            return stored === "true";
        }
        // If Supabase is not configured, default to demo mode so the app works out-of-the-box
        return !this.isConfigured();
    },

    setDemoMode(val) {
        localStorage.setItem(this.STORAGE_KEYS.DEMO_MODE, val ? "true" : "false");
    },

    saveCredentials(url, key) {
        if (url) localStorage.setItem(this.STORAGE_KEYS.SUPABASE_URL, url.trim());
        if (key) localStorage.setItem(this.STORAGE_KEYS.ANON_KEY, key.trim());
        localStorage.setItem(this.STORAGE_KEYS.DEMO_MODE, "false");
    },

    resetCredentials() {
        localStorage.removeItem(this.STORAGE_KEYS.SUPABASE_URL);
        localStorage.removeItem(this.STORAGE_KEYS.SUPABASE_ANON_KEY);
        localStorage.removeItem(this.STORAGE_KEYS.DEMO_MODE);
    }
};

window.APP_CONFIG = CONFIG;

