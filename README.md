# 🎂 Campus Birthday Hub

> **Created by Nisal**

A modern, responsive web application built with pure **HTML5, CSS3, and JavaScript (ES6+)** with **Supabase (Auth, Database, Storage)** and **HTML5 Canvas** for a university department (~100 students).

Designed to run natively on **GitHub Pages** with **ZERO Node.js or npm build dependencies**.

---

## 🌟 Key Features

1. **Student Self-Service Portal (Simplified & No Sign-In Required)**:
   - Direct, open access: Any student can submit their birthday details and photo immediately without signing in or registering.
   - Minimal fields: **Full Name**, **Nickname / Preferred Name**, and **Birthday Date**.
   - Profile photo upload with **5 MB limit** and format validation (JPG, PNG, WEBP) with live preview.
   - **Instant Word Document (.doc) Download**: As soon as a student submits their details, they can download a formatted Microsoft Word sheet containing their photo, name, nickname, and birthday with one click!
   - Name / Nickname Lookup: Students can look up their profile anytime by typing their name to review approval status or edit information.
   - Self-service editing and photo replacement.
   - Submission review tracker: `Pending Approval`, `Verified & Approved`, `Needs Correction` (with admin notes).

2. **Interactive Department Birthday Calendar**:
   - Monthly grid view with birthday badges and avatars on celebration dates.
   - List view with countdown timers (`Today! 🎉`, `Tomorrow! 🎈`, `In 4 days`).
   - Handles leap years (Feb 29) and cross-year countdowns.
   - Search by student name or student ID.
   - Filters for department, degree programme, batch, and birthday month.

3. **Birthday Post Designer Studio (Canvas 1080px)**:
   - **PIN Protected Access**: Requires security password `0715157912` to enter the workspace.
   - **Direct Photo Download**: One-click download of the student's original portrait photograph.
   - 4 High-End Department Themes:
     - **Royal Navy & Gold** (University crest, navy radial gradient, gold foil borders, serif typography).
     - **Soft Purple Glass** (Glassmorphic cards, vibrant glowing orbs, elegant modern typography).
     - **Festive Fiesta** (Balloons, confetti explosions, warm celebratory joy).
     - **Minimal Luxury** (Clean editorial typography, luxury minimalist aesthetic).
   - Aspect ratio presets: **Square 1080 × 1080 px** (Instagram/Facebook) and **Portrait 1080 × 1350 px** (IG Story / Portrait).
   - Photo adjustment sliders: shape (circle, rounded, square), zoom scale, and X/Y offset for perfect face centering.
   - Decorative stickers: Confetti, Royal Crown, Party Hat, Balloons, Birthday Cake.
   - Editable greeting headline, student name, degree subtitle, and birthday quote.
   - **One-click High-Resolution PNG export** and **Copy to Clipboard**.
   - Designer workflow task tracker: `Pending`, `In Progress`, `Design Completed`, `Published`.

4. **Department Admin Dashboard & Word (.doc) Sheet Export**:
   - **PIN Protected Access**: Requires security password `0715157912` to enter the dashboard.
   - Real-time KPI statistics: Total Registered Students, Verified Profiles, Awaiting Review, Corrections Requested, Next 7 Days Birthdays, Posts Prepared.
   - Student records management table with search and filtering.
   - Action workflows: One-click **Approve & Verify**, **Request Correction** with custom feedback note, **Edit Information**, **Deactivate / Delete**.
   - **Download Word Sheet (.doc) with Photo**:
     - Single-click download of an individual student's formatted Word document containing their portrait photo, full name, nickname, and birthday date.
     - **Export All Word Sheets (.doc)**: Generates a complete multi-page Microsoft Word document with every registered student on their own page along with their photo.
     - **Print / PDF Cards Export** and **CSV Spreadsheet Export**.

5. **Universal Compatibility & Demo Mode**:
   - Out-of-the-box **Demo Mode** with 10 realistic university student records so anyone visiting the GitHub Pages repo can immediately test all features without backend configuration.
   - In-app **Settings Wizard** to connect your live Supabase project anytime with zero code changes.

---

## 📁 Project Architecture

```
campus-birthday-hub/
├── index.html                   # Single-Page Web Application
├── css/
│   ├── style.css                # Core design system, glassmorphism, typography
│   └── calendar.css             # Calendar grid styling and animation tokens
├── js/
│   ├── config.js                # Supabase configuration & local storage settings
│   ├── supabase-service.js      # Supabase Auth, DB, and Storage client with Demo fallback
│   ├── calendar.js              # Birthday calculations, leap years, countdowns, monthly grid
│   ├── google-service.js        # Google Drive folder creation, Calendar 1-day reminders & .ics
│   ├── google-form.js           # Direct Google Form auto-sync & pre-filled form generator
│   ├── word-export.js           # Microsoft Word (.doc) sheet generator with embedded photos
│   ├── designer.js              # HTML5 Canvas 1080x1080/1080x1350 post studio & PNG exporter
│   ├── student-portal.js        # Profile submission, image validation, student self-edit
│   ├── admin.js                 # Admin verification, correction feedback, statistics, CSV export
│   ├── auth.js                  # Authentication state, login/signup modals, role switcher
│   └── app.js                   # Application controller, view router, dark/light theme, toasts
├── supabase/
│   └── schema.sql               # Complete SQL schema, RLS policies, tables, and storage bucket
├── .gitignore                   # Standard gitignore
└── README.md                    # Setup and deployment documentation
```

---

## 🚀 Beginner Setup Guide (පියවරෙන් පියවර උපදෙස්)

### පියවර 1: GitHub Pages හරහා Publish කිරීම (Publishing to GitHub Pages)

Node.js හෝ npm අවශ්‍ය නැත. මෙම files කෙලින්ම GitHub වෙත push කර GitHub Pages සක්‍රිය කරන්න:

1. Create a new repository on GitHub (e.g. `campus-birthday-hub`).
2. Open PowerShell in this project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Campus Birthday Hub"
   git branch -M main
   git remote add origin https://github.com/<your-username>/campus-birthday-hub.git
   git push -u origin main
   ```
3. Go to your GitHub repository -> **Settings** -> **Pages**.
4. Under **Branch**, select `main` and folder `/ (root)`. Click **Save**.
5. Within 1 minute, your website will be live at:
   `https://<your-username>.github.io/campus-birthday-hub/`

---

### පියවර 2: Supabase Backend සකස් කිරීම (Connecting Supabase Backend)

1. Go to [https://supabase.com](https://supabase.com) and create a **Free** account.
2. Click **New Project**, enter a project name (e.g. `campus-birthday-hub`), set a database password, and choose your preferred region.
3. Once the project is created:
   - Open **SQL Editor** from the left sidebar.
   - Click **New query**.
   - Copy all the SQL code inside [`supabase/schema.sql`](file:///c:/Users/nisal/OneDrive/Desktop/data/supabase/schema.sql) and paste it into the SQL Editor.
   - Click **Run**. This will automatically create all tables (`student_profiles`, `birthday_post_tasks`, `user_roles`), RLS policies, triggers, and the `student-photos` storage bucket!
4. Go to **Project Settings** -> **API**:
   - Copy **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - Copy **Project API Key (anon public)** (starts with `eyJ...`)
5. You can connect it to the app in two ways:
   - **Method A (Easy UI)**: Open your deployed website, click the yellow **"Demo Mode"** pill at the top right, paste your Supabase URL & Anon Key, and click **"Connect Supabase"**.
   - **Method B (Code)**: Open [`js/config.js`](file:///c:/Users/nisal/OneDrive/Desktop/data/js/config.js) and fill in:
     ```javascript
     SUPABASE_URL: "https://your-project.supabase.co",
     SUPABASE_ANON_KEY: "your-anon-public-key-here",
     ```

### පියවර 3: Google Drive & Google Calendar ස්වයංක්‍රීය සම්බන්ධතාවය (nisalmuhandiram2004@gmail.com)

ශිෂ්‍යයෙක් විස්තර add කළ විට **Google Drive හි ඒ නමින් Folder එකක් සෑදී Photo සහ විස්තර Save වීමට** සහ **Google Calendar එකේ දිනකට පෙර Email / Notification reminder එකක් ඒමට**:

1. පරිගණකයෙන් [script.google.com](https://script.google.com) වෙත `nisalmuhandiram2004@gmail.com` ගිණුමෙන් Login වන්න.
2. **New project** click කරන්න.
3. Editor හි ඇති සියල්ල මකා, අපගේ Settings Modal එකේ ඇති **"Copy Apps Script Code"** බොත්තමෙන් copy කරගත් code එක (හෝ `js/google-service.js` හි ඇති Apps Script code එක) paste කරන්න.
4. ඉහළ දකුණු කෙළවරේ **Deploy** -> **New deployment** click කරන්න.
5. Gear (⚙️) icon එක click කර **Web app** තෝරන්න.
   - **Execute as**: `Me (nisalmuhandiram2004@gmail.com)`
   - **Who has access**: `Anyone`
6. **Deploy** click කර Permissions Authorize කරන්න.
7. ලැබෙන **Web App URL** එක copy කරගන්න (`https://script.google.com/macros/s/.../exec`).
8. Campus Birthday Hub වෙබ් අඩවියේ **Settings (Database icon)** විවෘත කර **Google Apps Script Webhook URL** කොටුවට paste කර **Save Google Webhook** click කරන්න.

> **සටහන**: Webhook එකක් නැතත්, Admin Dashboard එකෙන් හෝ ශිෂ්‍යයාගේ Status Card එකෙන් **"Google Calendar"** බොත්තම click කර කෙලින්ම Calendar එකට එක් කළ හැකි අතර, **"Google Calendar (.ics)"** මගින් සියලුම ශිෂ්‍යයන්ගේ උපන්දින දිනකට පෙර Reminder සහිතව එකවර Calendar එකට import කළ හැක.

---

### පියවර 4: Google Form & Google Sheet ස්වයංක්‍රීය සම්බන්ධතාවය (Google Form Live Auto-Sync)

ශිෂ්‍යයන් **Google Form** එකේ පිරවූ සියලුම තොරතුරු (නම, කෙටි නම, උපන්දිනය, සහ ඡායාරූපය) **Campus Birthday Hub** වෙත ස්වයංක්‍රීයව Live Update වේ:

1. **Google Drive එකට Photos Save වීම**:
   - ශිෂ්‍යයන් Campus Birthday Hub හි `Google Form (To Drive)` ටැබ් එක ඔස්සේ ඔබගේ නිල Google Form එක පුරවන බැවින් සියලුම ඡායාරූප සහ විස්තර කෙලින්ම ඔබගේ Google Drive (`nisalmuhandiram2004@gmail.com`) එකට Save වේ.

2. **Campus Hub වෙත Data ස්වයංක්‍රීයව Auto-Update වීම**:
   - ඔබගේ Google Form එක Edit mode එකෙන් විවෘත කරන්න: [Google Form Edit](https://docs.google.com/forms/d/1FAIpQLScbv2NCVvrCBsaW4sZPxl1ciXz8CietUpK3j150RUadPZGTAg/edit)
   - ඉහළ ඇති **"Responses" (ප්‍රතිචාර)** ටැබ් එකට යන්න.
   - එහි ඇති කොළ පැහැති **"Link to Sheets"** (Spreadsheet එකට සම්බන්ධ කරන්න) අයිකන් එක click කර නව Google Sheet එකක් සාදන්න.
   - එම Google Sheet එක විවෘත කර ඉහළ දකුණු කෙළවරේ **Share (බෙදාගන්න)** click කරන්න.
   - **General access** යටතේ **"Anyone with the link" (ලින්ක් එක ඇති ඕනෑම කෙනෙකුට)** Viewer ලෙස සකසා **Copy link** click කරන්න.
   - Campus Birthday Hub හි Google Form එකට පහළින් ඇති **"Google Sheet link"** කොටුවට හෝ **Settings** හි paste කර **"Save Link"** ඔබන්න!

3. **ප්‍රතිඵලය**:
   - කිසිවෙකු Google Form එක පිරවූ සැණින්, තත්පර 30ක් ඇතුළත හෝ **"Sync Now"** එබූ විගස එම ශිෂ්‍යයාගේ නම, උපන්දිනය සහ ඡායාරූපය ඔටෝම:
     - **Birthday Calendar** එකට ඇතුළත් වේ.
     - **Birthday Post Designer** එකට ඡායාරූපය සහිතව පැමිණේ (1080px Social Media Post සෑදීමට).
     - **Word Sheets (.doc)** එකට ඡායාරූපය සහිතව download කරගත හැකි වේ.
     - **Admin Dashboard** එකට එකතු වේ!

---

## 🔒 Security & Privacy by Design

- **Row Level Security (RLS)**: Enforced on all Supabase tables so students can only modify their own profile records.
- **Storage Protection**: Files are organized per user identity with a strict 5 MB limit and image format validation.
- **Privacy Consent**: Students have separate checkboxes to approve their photo/name for public birthday posts and the department calendar.
- **Admin Verification**: Records can be held in pending status until reviewed by the department administrator.

---

## 🎨 Social Media Post Specifications

- **Square 1:1**: 1080 × 1080 pixels (Instagram & Facebook Post).
- **Portrait 4:5**: 1080 × 1350 pixels (Instagram Feed Portrait & Stories).
- **Format**: Lossless 24-bit PNG.
- **DPI**: Standard high-resolution screen buffer for crisp typography and vibrant gradient rendering.

