/**
 * CAMPUS BIRTHDAY HUB - GOOGLE CALENDAR & DRIVE SYNC SERVICE
 * Target Account: nisalmuhandiram2004@gmail.com
 * 
 * Features:
 * 1. Automatic background sync via Google Apps Script Webhook:
 *    - Creates a dedicated folder per student in Google Drive (nisalmuhandiram2004@gmail.com)
 *    - Saves student photo and details text file in that folder
 *    - Creates an annual recurring Google Calendar event with a 1-DAY ADVANCE REMINDER!
 * 2. Instant 1-click Google Calendar Add link (with yearly repeat)
 * 3. iCalendar (.ics) export with built-in 1-day advance alarms (TRIGGER:-P1D)
 */

class GoogleSyncService {
    constructor() {
        this.targetEmail = "nisalmuhandiram2004@gmail.com";
    }

    /**
     * Send student profile & photo to Nisal's Google Apps Script Webhook
     */
    async syncStudentToGoogle(student, photoBase64 = null) {
        const webhookUrl = window.APP_CONFIG.getGoogleWebhookUrl();
        if (!webhookUrl) {
            console.log("Google Apps Script Webhook URL is not configured yet. (Optional automatic sync)");
            return { synced: false, reason: "no_webhook" };
        }

        try {
            // If photoBase64 not passed, try to convert profile photo
            if (!photoBase64 && student.profile_photo_url && window.wordExportService) {
                photoBase64 = await window.wordExportService.urlToBase64(student.profile_photo_url, student.full_name);
            }

            const payload = {
                fullName: student.full_name,
                preferredName: student.preferred_name || student.full_name.split(' ')[0],
                birthdayDate: student.birthday_date,
                studentId: student.student_id || ('ID-' + Math.floor(1000 + Math.random() * 9000)),
                targetEmail: this.targetEmail,
                photoBase64: photoBase64 || null,
                timestamp: new Date().toISOString()
            };

            // Post to Google Apps Script Webhook (uses no-cors mode to bypass browser CORS)
            await fetch(webhookUrl, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify(payload)
            });

            console.log("Sync signal sent to Google Apps Script for", student.full_name);
            return { synced: true };
        } catch (err) {
            console.warn("Google Webhook sync failed:", err);
            return { synced: false, error: err.message };
        }
    }

    /**
     * Generate 1-click Google Calendar URL with annual repeat & pre-filled details
     */
    getGoogleCalendarUrl(student) {
        if (!student || !student.birthdayDate && !student.birthday_date) return "#";

        const bdayStr = student.birthday_date || student.birthdayDate;
        const parts = bdayStr.split('-');
        
        let month = parts.length === 3 ? parts[1] : parts[0];
        let day = parts.length === 3 ? parts[2] : parts[1];
        
        month = month.padStart(2, '0');
        day = day.padStart(2, '0');

        const currentYear = new Date().getFullYear();
        const startDates = `${currentYear}${month}${day}`;
        
        // Next day for all-day event
        const nextDayDate = new Date(currentYear, parseInt(month, 10) - 1, parseInt(day, 10) + 1);
        const endYear = nextDayDate.getFullYear();
        const endMonth = String(nextDayDate.getMonth() + 1).padStart(2, '0');
        const endDay = String(nextDayDate.getDate()).padStart(2, '0');
        const endDates = `${endYear}${endMonth}${endDay}`;

        const fullName = student.full_name || "Student";
        const prefName = student.preferred_name || fullName.split(' ')[0];
        
        const title = encodeURIComponent(`🎂 ${fullName} Birthday (${prefName})`);
        const details = encodeURIComponent(
            `Campus Birthday Celebration for ${fullName} (${prefName}).\n\n` +
            `Birthday Date: ${bdayStr}\n` +
            `Target Reminder: 1 day before to ${this.targetEmail}\n` +
            `Created by Nisal.`
        );
        const location = encodeURIComponent("Campus Birthday Hub");
        
        // Add recurrence RRULE:FREQ=YEARLY
        const recur = encodeURIComponent("RRULE:FREQ=YEARLY");

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDates}/${endDates}&recur=${recur}&details=${details}&location=${location}&add=${encodeURIComponent(this.targetEmail)}`;
    }

    /**
     * Open 1-click Google Calendar link in new browser tab
     */
    openGoogleCalendar(studentOrId) {
        let student = studentOrId;
        if (typeof studentOrId === 'string') {
            const students = (window.app && window.app.students) || [];
            student = students.find(s => s.id === studentOrId);
        }

        if (!student) {
            window.showToast("Student not found.", "warning");
            return;
        }

        const url = this.getGoogleCalendarUrl(student);
        window.open(url, '_blank');
        window.showToast(`Opening Google Calendar for ${student.full_name}...`, "info");
    }

    /**
     * Generate standard RFC 5545 iCalendar (.ics) content with 1-DAY ADVANCE NOTIFICATION
     */
    generateIcsContent(studentsList) {
        const lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Campus Birthday Hub//Created by Nisal//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "X-WR-CALNAME:Campus Student Birthdays (Created by Nisal)",
            "X-WR-TIMEZONE:Asia/Colombo"
        ];

        const currentYear = new Date().getFullYear();

        studentsList.forEach((s, idx) => {
            const bdayStr = s.birthday_date;
            if (!bdayStr) return;

            const parts = bdayStr.split('-');
            let month = parts.length === 3 ? parts[1] : parts[0];
            let day = parts.length === 3 ? parts[2] : parts[1];
            month = month.padStart(2, '0');
            day = day.padStart(2, '0');

            const startDates = `${currentYear}${month}${day}`;
            const nextDayDate = new Date(currentYear, parseInt(month, 10) - 1, parseInt(day, 10) + 1);
            const endYear = nextDayDate.getFullYear();
            const endMonth = String(nextDayDate.getMonth() + 1).padStart(2, '0');
            const endDay = String(nextDayDate.getDate()).padStart(2, '0');
            const endDates = `${endYear}${endMonth}${endDay}`;

            const uid = `bday_${idx}_${s.student_id || idx}_${currentYear}@campusbirthdayhub`;
            const fullName = s.full_name || "Student";
            const prefName = s.preferred_name || fullName.split(' ')[0];

            lines.push("BEGIN:VEVENT");
            lines.push(`UID:${uid}`);
            lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`);
            lines.push(`DTSTART;VALUE=DATE:${startDates}`);
            lines.push(`DTEND;VALUE=DATE:${endDates}`);
            lines.push(`SUMMARY:🎂 ${fullName} Birthday (${prefName})`);
            lines.push(`DESCRIPTION:Campus birthday celebration for ${fullName}. Created by Nisal.`);
            lines.push("RRULE:FREQ=YEARLY");

            // 1-DAY ADVANCE REMINDER / ALARM (TRIGGER:-P1D)
            lines.push("BEGIN:VALARM");
            lines.push("TRIGGER:-P1D"); // 1 day before
            lines.push("ACTION:DISPLAY");
            lines.push(`DESCRIPTION:Reminder: ${fullName}'s birthday is tomorrow!`);
            lines.push("END:VALARM");

            // Email reminder alarm for Nisal
            lines.push("BEGIN:VALARM");
            lines.push("TRIGGER:-P1D");
            lines.push("ACTION:EMAIL");
            lines.push(`SUMMARY:Reminder: ${fullName}'s birthday is tomorrow!`);
            lines.push(`DESCRIPTION:Don't forget to prepare birthday social post for ${fullName} (${prefName})!`);
            lines.push(`ATTENDEE:mailto:${this.targetEmail}`);
            lines.push("END:VALARM");

            lines.push("END:VEVENT");
        });

        lines.push("END:VCALENDAR");
        return lines.join("\r\n");
    }

    /**
     * Download .ics file for a single student
     */
    downloadSingleIcs(studentOrId) {
        let student = studentOrId;
        if (typeof studentOrId === 'string') {
            const students = (window.app && window.app.students) || [];
            student = students.find(s => s.id === studentOrId);
        }

        if (!student) {
            window.showToast("Student details not found.", "warning");
            return;
        }

        const icsContent = this.generateIcsContent([student]);
        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const cleanName = (student.preferred_name || student.full_name || "student").replace(/[^a-zA-Z0-9]/g, '_');
        link.href = url;
        link.download = `${cleanName}_Birthday_Reminder.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        window.showToast(`Calendar file downloaded with 1-day reminder for ${student.full_name}!`, "success");
    }

    /**
     * Download .ics file with 1-day reminders for ALL registered students
     */
    downloadAllIcs() {
        const students = (window.app && window.app.students) || [];
        if (!students || students.length === 0) {
            window.showToast("No student records available to export.", "warning");
            return;
        }

        const icsContent = this.generateIcsContent(students);
        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Campus_Birthdays_All_Reminders_${new Date().toISOString().slice(0, 10)}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        window.showToast(`Downloaded Google Calendar (.ics) file with 1-day reminders for ${students.length} students!`, "success");
    }

    /**
     * Complete ready-to-run Google Apps Script code for nisalmuhandiram2004@gmail.com
     */
    getAppsScriptCode() {
        return `/**
 * CAMPUS BIRTHDAY HUB - GOOGLE APPS SCRIPT WEBHOOK
 * Account: nisalmuhandiram2004@gmail.com
 * 
 * Instructions:
 * 1. Visit https://script.google.com and click "New project".
 * 2. Delete all existing code and paste this entire code.
 * 3. Click "Deploy" -> "New deployment".
 * 4. Select type: "Web app".
 * 5. Set:
 *    - Description: "Campus Birthday Hub Sync"
 *    - Execute as: "Me (nisalmuhandiram2004@gmail.com)"
 *    - Who has access: "Anyone"
 * 6. Click "Deploy", authorize permissions, and copy the Web App URL.
 * 7. Paste that Web App URL in your Campus Birthday Hub Settings modal!
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var fullName = data.fullName || "Student";
    var preferredName = data.preferredName || fullName;
    var birthdayDate = data.birthdayDate;
    var studentId = data.studentId || "ID-" + Math.floor(1000 + Math.random() * 9000);
    var photoBase64 = data.photoBase64;
    
    // ==========================================
    // 1. GOOGLE DRIVE: CREATE FOLDER IN STUDENT'S NAME
    // ==========================================
    var mainFolderName = "Campus Birthday Hub - Students";
    var mainFolders = DriveApp.getFoldersByName(mainFolderName);
    var mainFolder = mainFolders.hasNext() ? mainFolders.next() : DriveApp.createFolder(mainFolderName);
    
    // Create dedicated subfolder with student's name
    var folderName = fullName + " (" + preferredName + ")";
    var studentFolder = mainFolder.createFolder(folderName);
    
    // Save student photo if provided
    if (photoBase64) {
      try {
        var cleanBase64 = photoBase64.replace(/^data:image\\/\\w+;base64,/, '');
        var decodedBlob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), "image/jpeg", fullName + "_Photo.jpg");
        studentFolder.createFile(decodedBlob);
      } catch (photoErr) {
        Logger.log("Photo decode error: " + photoErr.toString());
      }
    }
    
    // Save details text document
    var detailsContent = "CAMPUS BIRTHDAY HUB - STUDENT PROFILE\\n" +
      "Created by Nisal\\n" +
      "Target Account: nisalmuhandiram2004@gmail.com\\n\\n" +
      "Full Name: " + fullName + "\\n" +
      "Preferred Name / Nickname: " + preferredName + "\\n" +
      "Birthday Date: " + birthdayDate + "\\n" +
      "Student Reference: " + studentId + "\\n" +
      "Date Submitted: " + new Date().toLocaleString() + "\\n";
    studentFolder.createFile(fullName + "_Details.txt", detailsContent);
    
    // ==========================================
    // 2. GOOGLE CALENDAR: 1-DAY ADVANCE REMINDER
    // ==========================================
    if (birthdayDate) {
      var parts = birthdayDate.split('-');
      var currentYear = new Date().getFullYear();
      var month = parseInt(parts.length === 3 ? parts[1] : parts[0], 10) - 1;
      var day = parseInt(parts.length === 3 ? parts[2] : parts[1], 10);
      
      var eventDate = new Date(currentYear, month, day);
      var calendar = CalendarApp.getDefaultCalendar();
      
      var title = "🎂 " + fullName + " Birthday (" + preferredName + ")";
      var description = "Campus Birthday Hub - Student Birthday Celebration\\n" +
        "Name: " + fullName + "\\n" +
        "Nickname: " + preferredName + "\\n" +
        "Folder: " + studentFolder.getUrl() + "\\n" +
        "Created by Nisal";
      
      // Create yearly repeating event series
      var recurrence = CalendarApp.newRecurrence().addYearlyRule();
      var series = calendar.createAllDayEventSeries(title, eventDate, recurrence, {
        description: description
      });
      
      // Set reminders: 1 day before (1440 minutes = 24 hours)
      series.addEmailReminder(1440);
      series.addPopupReminder(1440);
    }

    // ==========================================
    // 3. GOOGLE FORM: AUTO-RECORD IN NISAL'S FORM
    // Target: https://docs.google.com/forms/d/e/1FAIpQLScbv2NCVvrCBsaW4sZPxl1ciXz8CietUpK3j150RUadPZGTAg/viewform
    // ==========================================
    try {
      var googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLScbv2NCVvrCBsaW4sZPxl1ciXz8CietUpK3j150RUadPZGTAg/viewform";
      var gForm = FormApp.openByUrl(googleFormUrl);
      var formResp = gForm.createResponse();
      var fItems = gForm.getItems();
      
      for (var f = 0; f < fItems.length; f++) {
        var itm = fItems[f];
        var itmTitle = itm.getTitle().toLowerCase();
        
        if (itmTitle.indexOf("full name") !== -1 || (itmTitle.indexOf("name") !== -1 && itmTitle.indexOf("nick") === -1)) {
          formResp.withItemResponse(itm.asTextItem().createResponse(fullName));
        } else if (itmTitle.indexOf("nick") !== -1 || itmTitle.indexOf("preferred") !== -1) {
          formResp.withItemResponse(itm.asTextItem().createResponse(preferredName));
        } else if (itmTitle.indexOf("birth") !== -1 || itmTitle.indexOf("date") !== -1) {
          if (itm.getType() === FormApp.ItemType.DATE) {
            formResp.withItemResponse(itm.asDateItem().createResponse(new Date(currentYear, month, day)));
          } else {
            formResp.withItemResponse(itm.asTextItem().createResponse(birthdayDate));
          }
        }
      }
      formResp.submit();
    } catch (gformErr) {
      Logger.log("Google Form submission log: " + gformErr.toString());
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      folderName: folderName,
      folderUrl: studentFolder.getUrl(),
      message: "Folder created, calendar reminder set, and Google Form updated for " + fullName
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    account: "nisalmuhandiram2004@gmail.com",
    service: "Campus Birthday Hub Sync Service"
  })).setMimeType(ContentService.MimeType.JSON);
}`;
    }
}

window.googleSyncService = new GoogleSyncService();

