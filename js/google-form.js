/**
 * CAMPUS BIRTHDAY HUB - GOOGLE FORM SYNC SERVICE
 * Target Form: https://docs.google.com/forms/d/e/1FAIpQLScbv2NCVvrCBsaW4sZPxl1ciXz8CietUpK3j150RUadPZGTAg/viewform
 * 
 * Automatically sends student birthday submissions directly into Nisal's Google Form!
 * Supports both automatic background submission (via hidden iframe and no-cors fetch)
 * and 1-click pre-filled link opening.
 */

class GoogleFormSyncService {
    constructor() {
        this.defaultFormId = "1FAIpQLScbv2NCVvrCBsaW4sZPxl1ciXz8CietUpK3j150RUadPZGTAg";
        this.responseUrl = `https://docs.google.com/forms/d/e/${this.defaultFormId}/formResponse`;
        this.viewUrl = `https://docs.google.com/forms/d/e/${this.defaultFormId}/viewform`;
    }

    /**
     * Submit a student profile to Google Form automatically in the background
     */
    async submitStudentToGoogleForm(student, photoUrl = null) {
        if (!student) return;

        const fullName = student.full_name || "";
        const preferredName = student.preferred_name || fullName.split(' ')[0] || "";
        const birthdayDate = student.birthday_date || "";
        const photo = photoUrl || student.profile_photo_url || "";

        const entries = window.APP_CONFIG.getGoogleFormEntries();

        // 1. Prepare form data fields
        const formData = new FormData();
        const payloadEntries = [];

        // If specific entry IDs are configured:
        if (entries.name) {
            formData.append(entries.name, fullName);
            payloadEntries.push({ key: entries.name, val: fullName });
        }
        if (entries.nickname) {
            formData.append(entries.nickname, preferredName);
            payloadEntries.push({ key: entries.nickname, val: preferredName });
        }
        if (entries.birthday) {
            formData.append(entries.birthday, birthdayDate);
            payloadEntries.push({ key: entries.birthday, val: birthdayDate });

            // In Google Forms, Date widgets also accept _year, _month, _day
            if (birthdayDate.includes('-')) {
                const parts = birthdayDate.split('-');
                if (parts.length === 3) {
                    formData.append(`${entries.birthday}_year`, parts[0]);
                    formData.append(`${entries.birthday}_month`, parts[1]);
                    formData.append(`${entries.birthday}_day`, parts[2]);
                    payloadEntries.push({ key: `${entries.birthday}_year`, val: parts[0] });
                    payloadEntries.push({ key: `${entries.birthday}_month`, val: parts[1] });
                    payloadEntries.push({ key: `${entries.birthday}_day`, val: parts[2] });
                }
            }
        }
        if (entries.photo && photo) {
            formData.append(entries.photo, photo);
            payloadEntries.push({ key: entries.photo, val: photo });
        }

        // If no custom entry IDs have been set yet, send standard common parameters
        if (payloadEntries.length === 0) {
            formData.append("entry.1", fullName);
            formData.append("entry.2", preferredName);
            formData.append("entry.3", birthdayDate);
            if (photo) formData.append("entry.4", photo);

            payloadEntries.push({ key: "entry.1", val: fullName });
            payloadEntries.push({ key: "entry.2", val: preferredName });
            payloadEntries.push({ key: "entry.3", val: birthdayDate });
        }

        console.log("Submitting to Google Form...", payloadEntries);

        // Technique A: Hidden iframe submission (The most reliable for Google Forms)
        try {
            this.submitViaHiddenIframe(payloadEntries);
        } catch (iframeErr) {
            console.warn("Iframe submit error:", iframeErr);
        }

        // Technique B: no-cors fetch
        try {
            await fetch(this.responseUrl, {
                method: "POST",
                mode: "no-cors",
                body: formData
            });
            console.log("Google Form background fetch completed.");
            return true;
        } catch (fetchErr) {
            console.log("Google Form fetch note:", fetchErr);
            return true;
        }
    }

    /**
     * Submit via invisible offscreen iframe so browser doesn't navigate away
     */
    submitViaHiddenIframe(entriesList) {
        const iframeName = `gform_iframe_${Date.now()}`;
        const iframe = document.createElement("iframe");
        iframe.name = iframeName;
        iframe.id = iframeName;
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        const form = document.createElement("form");
        form.target = iframeName;
        form.method = "POST";
        form.action = this.responseUrl;
        form.style.display = "none";

        entriesList.forEach(item => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = item.key;
            input.value = item.val;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();

        // Cleanup after 4 seconds
        setTimeout(() => {
            if (form.parentNode) form.parentNode.removeChild(form);
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 4000);
    }

    /**
     * Generate 1-click pre-filled Google Form URL
     */
    getPrefilledUrl(student) {
        if (!student) return this.viewUrl;

        const entries = window.APP_CONFIG.getGoogleFormEntries();
        const params = new URLSearchParams();
        params.set("usp", "pp_url");

        if (entries.name && student.full_name) {
            params.set(entries.name, student.full_name);
        }
        if (entries.nickname && student.preferred_name) {
            params.set(entries.nickname, student.preferred_name);
        }
        if (entries.birthday && student.birthday_date) {
            params.set(entries.birthday, student.birthday_date);
        }
        if (entries.photo && student.profile_photo_url) {
            params.set(entries.photo, student.profile_photo_url);
        }

        const qs = params.toString();
        return `${this.viewUrl}?${qs}`;
    }

    /**
     * Parse a pre-filled link pasted by the user to automatically extract entry IDs
     */
    parseAndSavePrefilledLink(pastedUrl) {
        if (!pastedUrl) return { success: false, message: "URL is empty" };

        try {
            const urlObj = new URL(pastedUrl);
            const foundEntries = [];

            urlObj.searchParams.forEach((val, key) => {
                if (key.startsWith('entry.')) {
                    foundEntries.push({ key, val });
                }
            });

            if (foundEntries.length === 0) {
                return { 
                    success: false, 
                    message: "No entry.XXXXX fields found in this link. Make sure to click 'Get pre-filled link' in Google Forms." 
                };
            }

            // Auto-assign based on order or values
            let nameEntry = foundEntries[0]?.key || "";
            let nicknameEntry = foundEntries[1]?.key || "";
            let bdayEntry = foundEntries[2]?.key || "";
            let photoEntry = foundEntries[3]?.key || "";

            window.APP_CONFIG.setGoogleFormEntries(nameEntry, nicknameEntry, bdayEntry, photoEntry);
            
            return {
                success: true,
                count: foundEntries.length,
                entries: { name: nameEntry, nickname: nicknameEntry, birthday: bdayEntry, photo: photoEntry }
            };
        } catch (err) {
            return { success: false, message: "Invalid URL: " + err.message };
        }
    }
}

window.googleFormService = new GoogleFormSyncService();

