/**
 * CAMPUS BIRTHDAY HUB - BIRTHDAY POST DESIGNER STUDIO
 * 
 * Interactive HTML5 Canvas post designer with 1080x1080 & 1080x1350 export,
 * 4 university-themed templates, photo framing, decorative stickers, and post task tracking.
 */

class PostDesigner {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.selectedStudent = null;
        this.loadedStudentImage = null;

        // Designer configuration state
        this.config = {
            format: 'square', // 'square' (1080x1080) or 'portrait' (1080x1350)
            width: 1080,
            height: 1080,
            template: 'navy_gold',
            headline: 'HAPPY BIRTHDAY',
            studentName: '',
            subtitle: 'Created by Nisal',
            wishNote: 'Wishing you another year filled with immense happiness, success, and groundbreaking accomplishments!',
            photoShape: 'circle', // 'circle', 'square', 'rounded'
            photoZoom: 1.0,
            photoOffsetX: 0,
            photoOffsetY: 0,
            photoBorderColor: '#eab308', // gold
            photoBorderWidth: 8,
            primaryColor: '#0a192f',
            accentColor: '#fbbf24',
            showDepartmentBadge: true,
            showDecorations: true,
            activeSticker: 'confetti', // 'confetti', 'balloons', 'crown', 'cake', 'none'
            customBgColor: null
        };

        // Cache for tasks
        this.allStudents = [];
        this.filterStatus = 'all';
        this.filterMonth = 'all';
        this.filterBatch = 'all';
    }

    init(canvasElementId) {
        this.canvas = document.getElementById(canvasElementId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.updateDimensions();
        this.render();
    }

    setFormat(format) {
        this.config.format = format;
        this.updateDimensions();
        this.render();
    }

    updateDimensions() {
        if (this.config.format === 'portrait') {
            this.config.width = 1080;
            this.config.height = 1350;
        } else {
            this.config.width = 1080;
            this.config.height = 1080;
        }

        if (this.canvas) {
            this.canvas.width = this.config.width;
            this.canvas.height = this.config.height;
        }
    }

    // Select student to design post for
    selectStudent(student) {
        this.selectedStudent = student;
        if (!student) return;

        this.config.studentName = student.preferred_name || student.full_name;
        this.config.subtitle = (student.preferred_name && student.preferred_name !== student.full_name) ? student.full_name : (student.department || window.APP_CONFIG.DEFAULT_DEPARTMENT);
        
        this.config.wishNote = student.personal_note ? `"${student.personal_note}"` : 'Wishing you another year filled with great memories, success, and happiness!';

        // Reset photo transform
        this.config.photoZoom = 1.0;
        this.config.photoOffsetX = 0;
        this.config.photoOffsetY = 0;

        // Load photo
        if (student.profile_photo_url) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                this.loadedStudentImage = img;
                this.render();
            };
            img.onerror = () => {
                this.loadedStudentImage = null;
                this.render();
            };
            img.src = student.profile_photo_url;
        } else {
            this.loadedStudentImage = null;
            this.render();
        }

        this.render();
    }

    setTemplate(templateName) {
        this.config.template = templateName;
        switch (templateName) {
            case 'navy_gold':
                this.config.primaryColor = '#0b192e';
                this.config.accentColor = '#f59e0b';
                this.config.photoBorderColor = '#d97706';
                break;
            case 'purple_glass':
                this.config.primaryColor = '#2e1065';
                this.config.accentColor = '#c084fc';
                this.config.photoBorderColor = '#a855f7';
                break;
            case 'fiesta_burst':
                this.config.primaryColor = '#1e1b4b';
                this.config.accentColor = '#f43f5e';
                this.config.photoBorderColor = '#fb7185';
                break;
            case 'minimal_luxury':
                this.config.primaryColor = '#18181b';
                this.config.accentColor = '#e4e4e7';
                this.config.photoBorderColor = '#ffffff';
                break;
        }
        this.render();
    }

    // ==========================================
    // MAIN CANVAS RENDERER (High-Res 1080x1080 / 1080x1350)
    // ==========================================
    render() {
        if (!this.canvas || !this.ctx) return;

        const ctx = this.ctx;
        const W = this.config.width;
        const H = this.config.height;

        ctx.clearRect(0, 0, W, H);
        ctx.save();

        // 1. Draw Background
        this.drawBackground(ctx, W, H);

        // 2. Draw Decorative Borders / Frames
        this.drawBordersAndPatterns(ctx, W, H);

        // 3. Draw Department Badge & Header
        if (this.config.showDepartmentBadge) {
            this.drawHeader(ctx, W, H);
        }

        // 4. Draw Student Photo Frame & Image
        this.drawStudentPhoto(ctx, W, H);

        // 5. Draw Decorative Stickers (Hat, Confetti, Crown)
        if (this.config.showDecorations) {
            this.drawStickers(ctx, W, H);
        }

        // 6. Draw Typography: Greeting, Name, Subtitle, Birthday Wish
        this.drawTypography(ctx, W, H);

        // 7. Draw University Department Footer
        this.drawFooter(ctx, W, H);

        ctx.restore();
    }

    // 1. Background Renderer
    drawBackground(ctx, W, H) {
        const template = this.config.template;

        if (template === 'navy_gold') {
            // Royal Navy Radial Gradient
            const grad = ctx.createRadialGradient(W / 2, H * 0.4, 100, W / 2, H / 2, W * 0.85);
            grad.addColorStop(0, '#1e3a8a');
            grad.addColorStop(0.5, '#0f172a');
            grad.addColorStop(1, '#050b14');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // Subtle gold particle dots
            ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
            const dots = [
                [120, 150, 4], [250, 90, 3], [850, 180, 5], [980, 320, 3],
                [80, 750, 3], [160, 920, 4], [920, 840, 5], [860, 1000, 3]
            ];
            dots.forEach(([x, y, r]) => {
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            });

        } else if (template === 'purple_glass') {
            // Soft Purple & Indigo Gradient
            const grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, '#3b0764');
            grad.addColorStop(0.5, '#1e1b4b');
            grad.addColorStop(1, '#0f172a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // Glowing orbs
            const orb1 = ctx.createRadialGradient(200, 250, 10, 200, 250, 350);
            orb1.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
            orb1.addColorStop(1, 'rgba(168, 85, 247, 0)');
            ctx.fillStyle = orb1;
            ctx.fillRect(0, 0, W, H);

            const orb2 = ctx.createRadialGradient(W - 200, H - 300, 10, W - 200, H - 300, 400);
            orb2.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
            orb2.addColorStop(1, 'rgba(236, 72, 153, 0)');
            ctx.fillStyle = orb2;
            ctx.fillRect(0, 0, W, H);

        } else if (template === 'fiesta_burst') {
            // Fiesta Festive Gradient
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, '#111827');
            grad.addColorStop(0.5, '#1f1338');
            grad.addColorStop(1, '#090514');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // Colorful background bursts
            this.drawFiestaBackgroundShapes(ctx, W, H);

        } else {
            // Minimal Luxury Modern
            ctx.fillStyle = '#09090b';
            ctx.fillRect(0, 0, W, H);

            // Subtle texture/corner accents
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(60, 60); ctx.lineTo(W - 60, 60);
            ctx.lineTo(W - 60, H - 60); ctx.lineTo(60, H - 60);
            ctx.closePath();
            ctx.stroke();
        }
    }

    // 2. Borders and Patterns
    drawBordersAndPatterns(ctx, W, H) {
        const template = this.config.template;

        if (template === 'navy_gold') {
            // Double Gold Foil Border
            ctx.save();
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 3;
            ctx.strokeRect(40, 40, W - 80, H - 80);

            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(48, 48, W - 96, H - 96);

            // Corner decorative diamond star ornaments
            const drawCornerStar = (cx, cy) => {
                ctx.save();
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.arc(cx, cy, 6, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx - 16, cy); ctx.lineTo(cx + 16, cy);
                ctx.moveTo(cx, cy - 16); ctx.lineTo(cx, cy + 16);
                ctx.stroke();
                ctx.restore();
            };

            drawCornerStar(44, 44);
            drawCornerStar(W - 44, 44);
            drawCornerStar(44, H - 44);
            drawCornerStar(W - 44, H - 44);
            ctx.restore();

        } else if (template === 'purple_glass') {
            // Frosted card container
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.strokeStyle = 'rgba(192, 132, 252, 0.3)';
            ctx.lineWidth = 2;
            this.roundRect(ctx, 45, 45, W - 90, H - 90, 32);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        } else if (template === 'minimal_luxury') {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.strokeRect(50, 50, W - 100, H - 100);
            ctx.restore();
        }
    }

    // 3. Header / University Department Branding
    drawHeader(ctx, W, H) {
        ctx.save();
        ctx.textAlign = 'center';

        const template = this.config.template;
        const deptText = (this.selectedStudent?.department || window.APP_CONFIG.DEFAULT_DEPARTMENT).toUpperCase();

        if (template === 'navy_gold') {
            ctx.fillStyle = '#f59e0b';
            ctx.font = '700 22px "Outfit", sans-serif';
            ctx.letterSpacing = '5px';
            ctx.fillText('★ UNIVERSITY DEPARTMENT BIRTHDAY CELEBRATION ★', W / 2, 105);

            ctx.fillStyle = '#e2e8f0';
            ctx.font = '500 18px "Inter", sans-serif';
            ctx.letterSpacing = '2px';
            ctx.fillText(deptText, W / 2, 135);

            // Dividing line with star
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(W / 2 - 220, 155);
            ctx.lineTo(W / 2 + 220, 155);
            ctx.stroke();

        } else if (template === 'purple_glass') {
            ctx.fillStyle = '#c084fc';
            ctx.font = '700 20px "Outfit", sans-serif';
            ctx.letterSpacing = '4px';
            ctx.fillText('✨ SPECIAL BIRTHDAY EDITION ✨', W / 2, 105);

            ctx.fillStyle = '#f3e8ff';
            ctx.font = '500 18px "Inter", sans-serif';
            ctx.letterSpacing = '2px';
            ctx.fillText(deptText, W / 2, 135);

        } else if (template === 'fiesta_burst') {
            ctx.fillStyle = '#fb7185';
            ctx.font = '800 24px "Outfit", sans-serif';
            ctx.letterSpacing = '3px';
            ctx.fillText('🎉 CAMPUS BIRTHDAY SPOTLIGHT 🎈', W / 2, 105);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '500 18px "Inter", sans-serif';
            ctx.fillText(deptText, W / 2, 135);
        } else {
            ctx.fillStyle = '#9ca3af';
            ctx.font = '600 18px "Inter", sans-serif';
            ctx.letterSpacing = '6px';
            ctx.fillText(deptText, W / 2, 110);
        }

        ctx.restore();
    }

    // 4. Student Photo Rendering (Circle / Square / Frame with zoom and offset)
    drawStudentPhoto(ctx, W, H) {
        ctx.save();

        const isPortrait = this.config.format === 'portrait';
        const photoY = isPortrait ? H * 0.36 : H * 0.38;
        const photoX = W / 2;
        const radius = isPortrait ? 210 : 190;

        // Photo Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 15;

        // Photo Clip Path
        ctx.save();
        ctx.beginPath();

        if (this.config.photoShape === 'circle') {
            ctx.arc(photoX, photoY, radius, 0, Math.PI * 2);
        } else if (this.config.photoShape === 'rounded') {
            this.roundRect(ctx, photoX - radius, photoY - radius, radius * 2, radius * 2, 40);
        } else {
            ctx.rect(photoX - radius, photoY - radius, radius * 2, radius * 2);
        }

        ctx.closePath();
        ctx.clip();

        // Fill background behind photo in case transparent
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(photoX - radius, photoY - radius, radius * 2, radius * 2);

        // Draw Image or Fallback Avatar
        if (this.loadedStudentImage) {
            const img = this.loadedStudentImage;
            const zoom = this.config.photoZoom || 1.0;
            const offX = this.config.photoOffsetX || 0;
            const offY = this.config.photoOffsetY || 0;

            // Aspect fit/cover math
            const targetSize = radius * 2 * zoom;
            let drawW, drawH;
            if (img.width > img.height) {
                drawH = targetSize;
                drawW = (img.width / img.height) * targetSize;
            } else {
                drawW = targetSize;
                drawH = (img.height / img.width) * targetSize;
            }

            const drawX = photoX - drawW / 2 + offX;
            const drawY = photoY - drawH / 2 + offY;

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
        } else {
            // Placeholder Initials Avatar
            ctx.fillStyle = '#334155';
            ctx.fillRect(photoX - radius, photoY - radius, radius * 2, radius * 2);

            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 90px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const initials = (this.config.studentName || 'ST')
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
            ctx.fillText(initials, photoX, photoY);
        }

        ctx.restore(); // Restore clip

        // Draw Outer Border Frame
        ctx.shadowColor = 'transparent';
        ctx.lineWidth = this.config.photoBorderWidth || 8;
        ctx.strokeStyle = this.config.photoBorderColor || '#eab308';

        ctx.beginPath();
        if (this.config.photoShape === 'circle') {
            ctx.arc(photoX, photoY, radius + 2, 0, Math.PI * 2);
        } else if (this.config.photoShape === 'rounded') {
            this.roundRect(ctx, photoX - radius - 2, photoY - radius - 2, (radius + 2) * 2, (radius + 2) * 2, 42);
        } else {
            ctx.rect(photoX - radius - 2, photoY - radius - 2, (radius + 2) * 2, (radius + 2) * 2);
        }
        ctx.stroke();

        // Extra outer accent ring for navy_gold template
        if (this.config.template === 'navy_gold' && this.config.photoShape === 'circle') {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(photoX, photoY, radius + 14, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    // 5. Decorative Stickers (Confetti, Hat, Crown, Balloons, Cake)
    drawStickers(ctx, W, H) {
        ctx.save();
        const isPortrait = this.config.format === 'portrait';
        const photoY = isPortrait ? H * 0.36 : H * 0.38;
        const radius = isPortrait ? 210 : 190;

        const sticker = this.config.activeSticker;

        if (sticker === 'crown') {
            // Gold Royal Crown above photo
            const crownX = W / 2;
            const crownY = photoY - radius - 15;
            this.drawCrown(ctx, crownX, crownY, 70);
        } else if (sticker === 'hat') {
            // Party Hat tilted on top-left of head
            const hatX = W / 2 - 80;
            const hatY = photoY - radius + 10;
            this.drawPartyHat(ctx, hatX, hatY, 65);
        } else if (sticker === 'balloons') {
            // Balloons cluster on sides
            this.drawBalloonCluster(ctx, 120, photoY - 50, '#f43f5e', '#ec4899');
            this.drawBalloonCluster(ctx, W - 120, photoY - 50, '#8b5cf6', '#3b82f6');
        } else if (sticker === 'cake') {
            // Birthday cake icon
            this.drawBirthdayCake(ctx, W / 2, photoY + radius + 35, 30);
        }

        // Floating Confetti Pieces
        if (sticker === 'confetti' || this.config.template === 'fiesta_burst') {
            this.drawConfettiBursts(ctx, W, H);
        }

        ctx.restore();
    }

    // 6. Typography: Headline, Name, Subtitle, Birthday Wish
    drawTypography(ctx, W, H) {
        ctx.save();
        ctx.textAlign = 'center';

        const isPortrait = this.config.format === 'portrait';
        const photoY = isPortrait ? H * 0.36 : H * 0.38;
        const radius = isPortrait ? 210 : 190;
        const contentStartY = photoY + radius + (isPortrait ? 85 : 70);

        const template = this.config.template;

        // Headline (e.g. "HAPPY BIRTHDAY")
        if (template === 'navy_gold') {
            ctx.font = '900 48px "Playfair Display", serif';
            ctx.letterSpacing = '6px';
            const grad = ctx.createLinearGradient(W / 2 - 250, 0, W / 2 + 250, 0);
            grad.addColorStop(0, '#fef08a');
            grad.addColorStop(0.5, '#f59e0b');
            grad.addColorStop(1, '#fef08a');
            ctx.fillStyle = grad;
            ctx.fillText(this.config.headline, W / 2, contentStartY);

        } else if (template === 'purple_glass') {
            ctx.font = '800 46px "Outfit", sans-serif';
            ctx.letterSpacing = '5px';
            const grad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
            grad.addColorStop(0, '#f472b6');
            grad.addColorStop(0.5, '#c084fc');
            grad.addColorStop(1, '#60a5fa');
            ctx.fillStyle = grad;
            ctx.fillText(this.config.headline, W / 2, contentStartY);

        } else if (template === 'fiesta_burst') {
            ctx.font = '900 50px "Outfit", sans-serif';
            ctx.letterSpacing = '4px';
            ctx.fillStyle = '#fbbf24';
            ctx.fillText(`✨ ${this.config.headline} ✨`, W / 2, contentStartY);

        } else {
            // Minimal Luxury
            ctx.font = '300 44px "Playfair Display", serif';
            ctx.letterSpacing = '8px';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(this.config.headline, W / 2, contentStartY);
        }

        // Student Name
        const nameY = contentStartY + (isPortrait ? 65 : 55);
        ctx.font = 'bold 54px "Outfit", sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.config.studentName || 'Student Name', W / 2, nameY);

        // Subtitle (Degree Programme / Batch)
        const subY = nameY + (isPortrait ? 48 : 42);
        ctx.font = '500 24px "Inter", sans-serif';
        ctx.fillStyle = template === 'navy_gold' ? '#cbd5e1' : '#e2e8f0';
        ctx.fillText(this.config.subtitle, W / 2, subY);

        // Birthday Wish Note (Wrapped)
        const noteY = subY + (isPortrait ? 55 : 45);
        ctx.font = 'italic 400 22px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        this.wrapText(ctx, this.config.wishNote, W / 2, noteY, 820, 32);

        ctx.restore();
    }

    // 7. Footer
    drawFooter(ctx, W, H) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '500 16px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.letterSpacing = '2px';

        const bdayInfo = this.selectedStudent?.birthday_date ? ` • ${this.selectedStudent.birthday_date}` : '';
        ctx.fillText(`DEPARTMENT BIRTHDAY HUB${bdayInfo}`, W / 2, H - 45);
        ctx.restore();
    }

    // Helper: Round Rect
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // Helper: Wrap Text
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        if (!text) return;
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }

    // Decorative Icon: Crown
    drawCrown(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(-size, 0);
        ctx.lineTo(-size, -size * 0.7);
        ctx.lineTo(-size * 0.5, -size * 0.3);
        ctx.lineTo(0, -size * 0.9);
        ctx.lineTo(size * 0.5, -size * 0.3);
        ctx.lineTo(size, -size * 0.7);
        ctx.lineTo(size, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Jewels
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -size * 0.9, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(-size, -size * 0.7, 5, 0, Math.PI * 2);
        ctx.arc(size, -size * 0.7, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Decorative Icon: Party Hat
    drawPartyHat(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.25);

        // Hat body
        ctx.fillStyle = '#ec4899';
        ctx.strokeStyle = '#be185d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.5);
        ctx.lineTo(-size * 0.7, 0);
        ctx.lineTo(size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Hat stripes
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-size * 0.35, -size * 0.75);
        ctx.lineTo(size * 0.35, -size * 0.75);
        ctx.stroke();

        // Pom pom on top
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, -size * 1.5, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Decorative Icon: Balloon Cluster
    drawBalloonCluster(ctx, x, y, col1, col2) {
        ctx.save();
        ctx.translate(x, y);

        const drawSingleBalloon = (bx, by, color) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(bx, by, 38, 48, 0, 0, Math.PI * 2);
            ctx.fill();

            // Highlight shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.ellipse(bx - 12, by - 16, 8, 14, -0.3, 0, Math.PI * 2);
            ctx.fill();

            // String
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(bx, by + 48);
            ctx.quadraticCurveTo(bx + 15, by + 100, bx, by + 160);
            ctx.stroke();
        };

        drawSingleBalloon(-15, -20, col1);
        drawSingleBalloon(20, 10, col2);
        ctx.restore();
    }

    // Decorative Icon: Birthday Cake
    drawBirthdayCake(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        // Base
        ctx.fillStyle = '#f43f5e';
        this.roundRect(ctx, -size * 1.5, 0, size * 3, size * 1.2, 8);
        ctx.fill();
        // Frosting
        ctx.fillStyle = '#ffffff';
        this.roundRect(ctx, -size * 1.5, -4, size * 3, 10, 5);
        ctx.fill();
        // Candle
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-4, -size * 0.8, 8, size * 0.8);
        // Flame
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, -size * 0.95, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Confetti pieces
    drawConfettiBursts(ctx, W, H) {
        ctx.save();
        const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
        const confettiCoords = [
            [80, 220, 15, 6, 0.4], [180, 160, 12, 5, -0.8], [280, 240, 18, 7, 0.2],
            [W - 80, 200, 14, 6, -0.5], [W - 190, 150, 16, 5, 0.7], [W - 270, 230, 12, 6, -0.3],
            [100, H - 250, 16, 6, 0.6], [W - 110, H - 260, 15, 6, -0.4],
            [140, H * 0.6, 12, 4, 1.2], [W - 140, H * 0.6, 14, 5, -1.1]
        ];

        confettiCoords.forEach(([x, y, w, h, rot], idx) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.fillStyle = colors[idx % colors.length];
            ctx.fillRect(-w / 2, -h / 2, w, h);
            ctx.restore();
        });
        ctx.restore();
    }

    drawFiestaBackgroundShapes(ctx, W, H) {
        ctx.save();
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.15)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(100, 100, 180, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(W - 80, 140, 150, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // ==========================================
    // EXPORT FUNCTIONS (High Quality PNG & Photo Download)
    // ==========================================
    async downloadOriginalPhoto() {
        if (!this.selectedStudent || !this.selectedStudent.profile_photo_url) {
            window.showToast("No student photo is currently selected.", "warning");
            return;
        }

        const photoUrl = this.selectedStudent.profile_photo_url;
        const studentName = (this.selectedStudent.preferred_name || this.selectedStudent.full_name || 'student')
            .replace(/[^a-zA-Z0-9_\-]/g, '_');
        const filename = `${studentName}_photo.jpg`;

        try {
            // Priority 1: Export directly from rendered image in memory (bypasses CORS download restrictions)
            if (this.loadedStudentImage) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = this.loadedStudentImage.naturalWidth || this.loadedStudentImage.width || 400;
                tempCanvas.height = this.loadedStudentImage.naturalHeight || this.loadedStudentImage.height || 400;
                const tCtx = tempCanvas.getContext('2d');
                tCtx.drawImage(this.loadedStudentImage, 0, 0);
                const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);

                const link = document.createElement('a');
                link.download = filename;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.showToast(`Downloaded photo for ${this.selectedStudent.full_name}!`, "success");
                return;
            }

            // Priority 2: Fetch as blob
            const resp = await fetch(photoUrl);
            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            window.showToast(`Downloaded photo for ${this.selectedStudent.full_name}!`, "success");
        } catch (err) {
            console.warn("Photo direct download fallback:", err);
            const link = document.createElement('a');
            link.download = filename;
            link.href = photoUrl;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.showToast("Downloading photo...", "info");
        }
    }

    exportPNG() {
        if (!this.canvas) return;
        const nameClean = (this.config.studentName || 'student').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const filename = `campus-birthday-${nameClean}-${this.config.format}.png`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = this.canvas.toDataURL('image/png', 1.0);
        link.click();

        return filename;
    }

    async copyToClipboard() {
        if (!this.canvas) return false;
        try {
            return new Promise((resolve) => {
                this.canvas.toBlob(async (blob) => {
                    if (!blob) {
                        resolve(false);
                        return;
                    }
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]);
                        resolve(true);
                    } catch (err) {
                        console.error("Clipboard write error:", err);
                        resolve(false);
                    }
                }, 'image/png');
            });
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}

window.postDesigner = new PostDesigner();

