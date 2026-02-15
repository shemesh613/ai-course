// ===== Course Progress Manager =====

const TOTAL_MODULES = 7;
const STORAGE_KEY = 'ai_course_progress';
const THEME_KEY = 'ai_course_theme';

// ===== Confetti Animation =====
function launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#6C5CE7', '#00D2D3', '#00B894', '#FDCB6E', '#FD79A8', '#E17055', '#A29BFE'];
    const pieces = [];
    for (let i = 0; i < 150; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            rot: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10
        });
    }

    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        pieces.forEach(p => {
            if (p.y < canvas.height + 20) active = true;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.rot += p.rotSpeed;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, 1 - frame / 180);
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        frame++;
        if (active && frame < 200) {
            requestAnimationFrame(animate);
        } else {
            canvas.remove();
        }
    }
    animate();
}

// ===== Dark/Light Mode =====
function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light') {
        document.body.classList.add('light-mode');
    }
    updateThemeIcon();
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const isLight = document.body.classList.contains('light-mode');
    btn.textContent = isLight ? '🌙' : '☀️';
    btn.setAttribute('aria-label', isLight ? 'מצב כהה' : 'מצב בהיר');
}

// ===== Back to Top =====
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== Scroll Reveal Animation =====
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.module-card, .certificate-card, .a11y-card, .hero-content, .stat, .feature-item').forEach(el => {
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
    });
}

// ===== Share Buttons =====
function shareWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('קורס AI למדיה מקצועית - חינם! 🎓');
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
}

function shareFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = document.querySelector('.share-btn.copy');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = '✓ הועתק!';
            btn.classList.add('copied');
            setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
        }
    });
}

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
}

// Save progress to localStorage
function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// Toggle module completion with celebration
function toggleComplete(moduleId) {
    const progress = loadProgress();
    const wasComplete = progress[moduleId];
    progress[moduleId] = !progress[moduleId];
    saveProgress(progress);
    updateUI();

    // Celebrate on completion
    if (!wasComplete && progress[moduleId]) {
        const btn = document.getElementById(`btn-${moduleId}`);
        if (btn) {
            btn.classList.add('celebrate');
            setTimeout(() => btn.classList.remove('celebrate'), 600);
        }
    }
}

// Toggle module expand/collapse
function toggleModule(moduleId) {
    const content = document.getElementById(`content-${moduleId}`);
    const expand = document.getElementById(`expand-${moduleId}`);
    const header = content.previousElementSibling;

    // Close all other modules
    for (let i = 1; i <= TOTAL_MODULES; i++) {
        if (i !== moduleId) {
            const otherContent = document.getElementById(`content-${i}`);
            const otherExpand = document.getElementById(`expand-${i}`);
            if (otherContent) {
                otherContent.classList.remove('open');
                const otherHeader = otherContent.previousElementSibling;
                if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
            }
            if (otherExpand) otherExpand.classList.remove('rotated');
        }
    }

    // Toggle current module
    const isOpen = content.classList.toggle('open');
    expand.classList.toggle('rotated');
    if (header) header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// Update all UI elements based on progress
function updateUI() {
    const progress = loadProgress();
    let completed = 0;

    for (let i = 1; i <= TOTAL_MODULES; i++) {
        const card = document.querySelector(`[data-module="${i}"]`);
        const check = document.getElementById(`check-${i}`);
        const btn = document.getElementById(`btn-${i}`);

        if (progress[i]) {
            completed++;
            card.classList.add('completed');
            check.textContent = '✓';
            btn.classList.add('done');
        } else {
            card.classList.remove('completed');
            check.textContent = '○';
            btn.classList.remove('done');
        }
    }

    // Update progress bar
    const percent = Math.round((completed / TOTAL_MODULES) * 100);
    document.getElementById('progressBar').style.width = `${percent}%`;
    document.getElementById('totalProgress').textContent = `${percent}%`;
    document.getElementById('completedModules').textContent = completed;

    // Update ARIA on progress bar
    const progressWrapper = document.querySelector('.progress-bar-wrapper');
    if (progressWrapper) progressWrapper.setAttribute('aria-valuenow', percent);

    // Update certificate button
    const certBtn = document.getElementById('certBtn');
    const certNote = document.getElementById('certNote');
    if (completed === TOTAL_MODULES) {
        certBtn.disabled = false;
        certNote.textContent = 'כל הכבוד! אתה מוכן לקבל תעודה';
        certNote.style.color = '#00B894';
    } else {
        certBtn.disabled = true;
        certNote.textContent = `יש להשלים עוד ${TOTAL_MODULES - completed} מודולים לפני הפקת התעודה`;
        certNote.style.color = '';
    }
}

// Generate Certificate
function generateCertificate() {
    const name = document.getElementById('studentName').value.trim();
    if (!name) {
        document.getElementById('studentName').style.borderColor = '#e74c3c';
        document.getElementById('studentName').placeholder = 'נא להכניס שם!';
        return;
    }

    const date = new Date().toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create certificate HTML
    const certHTML = `
    <!DOCTYPE html>
    <html lang="he" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>תעודת סיום - ${name}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700;900&display=swap');

            * { margin: 0; padding: 0; box-sizing: border-box; }

            body {
                font-family: 'Heebo', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #1a1a2e;
                padding: 20px;
            }

            .certificate {
                width: 800px;
                background: white;
                border-radius: 20px;
                padding: 60px;
                text-align: center;
                position: relative;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }

            .certificate::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 8px;
                background: linear-gradient(90deg, #6C5CE7, #00D2D3);
            }

            .cert-border {
                border: 3px solid #E8E8F0;
                border-radius: 16px;
                padding: 50px 40px;
            }

            .cert-icon { font-size: 4rem; margin-bottom: 10px; }

            .cert-title {
                font-size: 2.2rem;
                font-weight: 900;
                color: #2D3436;
                margin-bottom: 8px;
            }

            .cert-subtitle {
                font-size: 1rem;
                color: #888;
                margin-bottom: 40px;
            }

            .cert-label {
                font-size: 0.9rem;
                color: #888;
                margin-bottom: 8px;
            }

            .cert-name {
                font-size: 2.5rem;
                font-weight: 800;
                color: #6C5CE7;
                margin-bottom: 30px;
                padding: 10px 0;
                border-bottom: 3px solid #E8E8F0;
            }

            .cert-course {
                font-size: 1.1rem;
                color: #555;
                line-height: 1.8;
                margin-bottom: 40px;
            }

            .cert-course strong {
                color: #2D3436;
            }

            .cert-footer {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 40px;
            }

            .cert-date, .cert-instructor {
                text-align: center;
            }

            .cert-date span, .cert-instructor span {
                display: block;
                font-size: 0.85rem;
                color: #888;
                margin-bottom: 4px;
            }

            .cert-date strong, .cert-instructor strong {
                font-size: 1rem;
                color: #2D3436;
            }

            .print-btn {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: #6C5CE7;
                color: white;
                border: none;
                padding: 12px 40px;
                border-radius: 50px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                font-family: 'Heebo', sans-serif;
            }

            .print-btn:hover { background: #5A4BD1; }

            @media print {
                body { background: white; padding: 0; }
                .certificate { box-shadow: none; }
                .print-btn { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="cert-border">
                <div class="cert-icon">🎓</div>
                <h1 class="cert-title">תעודת סיום</h1>
                <p class="cert-subtitle">Certificate of Completion</p>

                <p class="cert-label">מוענקת בזאת ל:</p>
                <div class="cert-name">${name}</div>

                <div class="cert-course">
                    על השלמת הקורס<br>
                    <strong>יצירת מדיה מקצועית עם בינה מלאכותית</strong><br>
                    הכולל 7 מודולים: יסודות AI, יצירת תמונות, יצירת וידאו,<br>
                    אודיו ומוזיקה, AI לטקסט, אוטומציות ופרויקט מסכם.
                </div>

                <div class="cert-footer">
                    <div class="cert-date">
                        <span>תאריך</span>
                        <strong>${date}</strong>
                    </div>
                    <div class="cert-instructor">
                        <span>מנחה הקורס</span>
                        <strong>שמשון ג'ייקוב</strong>
                    </div>
                </div>
            </div>
        </div>

        <button class="print-btn" onclick="window.print()">🖨️ הדפס תעודה</button>
    </body>
    </html>`;

    // Launch confetti!
    launchConfetti();

    // Open certificate in new window after brief delay
    setTimeout(() => {
        const certWindow = window.open('', '_blank');
        certWindow.document.write(certHTML);
        certWindow.document.close();
    }, 500);
}

// Video source mapping for modules with multiple videos
const videoSources = {
    2: [
        '../course/פרק 2 - השוואה בין כלי טקסט ביצירת תמונות',
        '../course/פרק 3- המודל המטורף של גוגל ננו בננה וסודות נוספים..!.mp4',
        '../course/לאונרדו סימן שאלה.mp4'
    ],
    4: [
        '../course/סונו חלק 1.mp4',
        '../course/סונו חלק 2 .mp4'
    ]
};

// Switch video in a module with multiple videos
function switchVideo(moduleId, videoIndex, btn) {
    const player = document.getElementById(`video-player-${moduleId}`);
    if (!player) return;

    const sources = videoSources[moduleId];
    if (!sources || !sources[videoIndex]) return;

    player.src = sources[videoIndex];
    player.load();

    // Update active tab
    const selector = document.getElementById(`video-selector-${moduleId}`);
    selector.querySelectorAll('.video-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateUI();
    initBackToTop();
    initScrollReveal();

    // Remove loading screen
    const loader = document.getElementById('pageLoader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 500);
        }, 300);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
