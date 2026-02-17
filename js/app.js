// ===== Course Progress Manager =====

const COURSES = {
    media: { totalModules: 7, moduleIds: [1,2,3,4,5,6,7], storageKey: 'ai_course_progress_media', name: 'יצירת מדיה מקצועית עם בינה מלאכותית', certModules: 'יסודות AI, יצירת תמונות, יצירת וידאו, אודיו ומוזיקה, AI לטקסט, אוטומציות ופרויקט מסכם' },
    tech: { totalModules: 5, moduleIds: [8,9,10,11,12], storageKey: 'ai_course_progress_tech', name: 'שימוש מתקדם בבינה מלאכותית', certModules: 'Claude, כתיבת קוד, סוכנים ובוטים, Google Studio ופרויקטים' }
};
let activeCourse = 'media';
const THEME_KEY = 'ai_course_theme';
const STREAK_KEY = 'ai_course_streak';
const ACHIEVEMENTS_KEY = 'ai_course_achievements';
const ALL_MODULE_IDS = [1,2,3,4,5,6,7,8,9,10,11,12];

// ===== Achievement Definitions =====
const ACHIEVEMENTS = [
    { id: 'first_step', emoji: '👣', name: 'צעד ראשון', desc: 'השלמת מודול ראשון', check: (stats) => stats.totalCompleted >= 1 },
    { id: 'on_a_roll', emoji: '🚀', name: 'על גלגל', desc: 'השלמת 3 מודולים', check: (stats) => stats.totalCompleted >= 3 },
    { id: 'half_way', emoji: '⭐', name: 'באמצע הדרך', desc: '50% מהקורס הושלם', check: (stats) => stats.percent >= 50 },
    { id: 'almost', emoji: '💪', name: 'כמעט שם', desc: '75% מהקורס הושלם', check: (stats) => stats.percent >= 75 },
    { id: 'master', emoji: '🎓', name: 'בוגר הקורס', desc: 'השלמת את כל הקורס!', check: (stats) => stats.percent >= 100 },
    { id: 'streak_3', emoji: '🔥', name: '3 ימים רצופים', desc: 'נכנסת 3 ימים ברציפות', check: (stats) => stats.streak >= 3 },
    { id: 'streak_7', emoji: '💎', name: 'שבוע רצוף!', desc: 'נכנסת 7 ימים ברציפות', check: (stats) => stats.streak >= 7 },
    { id: 'explorer', emoji: '🔍', name: 'חוקר', desc: 'פתחת את כל המודולים', check: (stats) => stats.modulesOpened >= stats.courseTotal },
    { id: 'dual_learner', emoji: '🌟', name: 'לומד כפול', desc: 'התחלת שני קורסים', check: (stats) => stats.startedBothCourses },
    { id: 'first_practice', emoji: '🧪', name: 'מתרגל', desc: 'השלמת תרגול מודרך ראשון', check: (stats) => stats.practicesCompleted >= 1 },
    { id: 'practice_5', emoji: '⚡', name: 'מתרגל על', desc: 'השלמת 5 תרגולים', check: (stats) => stats.practicesCompleted >= 5 },
    { id: 'practice_all', emoji: '🏅', name: 'אלוף התרגולים', desc: 'השלמת את כל 10 התרגולים!', check: (stats) => stats.practicesCompleted >= 10 },
];

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

    document.querySelectorAll('.module-card, .practice-card, .certificate-card, .a11y-card, .hero-content, .stat, .feature-item, .instructor-card').forEach(el => {
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
    });
}

// ===== Share Buttons =====
function shareWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('קורס AI למדיה מקצועית 🎓');
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

// ===== Course Switching =====
function switchCourse(courseId) {
    activeCourse = courseId;

    // Update tabs
    document.querySelectorAll('.course-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });
    document.getElementById(`tab-${courseId}`).classList.add('active');
    document.getElementById(`tab-${courseId}`).setAttribute('aria-selected', 'true');

    // Show/hide course content
    document.querySelectorAll('.course-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`course-${courseId}`).classList.add('active');

    // Close all open modules
    ALL_MODULE_IDS.forEach(id => {
        const content = document.getElementById(`content-${id}`);
        const expand = document.getElementById(`expand-${id}`);
        if (content) content.classList.remove('open');
        if (expand) expand.classList.remove('rotated');
    });

    updateUI();
}

// Load progress from localStorage
function loadProgress() {
    const course = COURSES[activeCourse];
    const saved = localStorage.getItem(course.storageKey);
    return saved ? JSON.parse(saved) : {};
}

// Save progress to localStorage
function saveProgress(progress) {
    const course = COURSES[activeCourse];
    localStorage.setItem(course.storageKey, JSON.stringify(progress));
}

// Determine which course a module belongs to
function getCourseForModule(moduleId) {
    for (const [key, course] of Object.entries(COURSES)) {
        if (course.moduleIds.includes(moduleId)) return key;
    }
    return 'media';
}

// ===== Toast Notification System =====
function showToast(emoji, title, message, type = '') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-emoji">${emoji}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ===== Streak System =====
function updateStreak() {
    const data = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
    const today = new Date().toDateString();

    if (data.lastVisit === today) {
        return data.count || 1;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (data.lastVisit === yesterday.toDateString()) {
        data.count = (data.count || 1) + 1;
        data.lastVisit = today;
        if (data.count === 3 || data.count === 7) {
            setTimeout(() => showToast('🔥', `${data.count} ימים רצופים!`, 'אתה על גלגל — תמשיך ככה!', 'streak'), 1500);
        }
    } else {
        data.count = 1;
        data.lastVisit = today;
    }

    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    return data.count;
}

function getStreak() {
    const data = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
    return data.count || 0;
}

// ===== Achievements System =====
function getUnlockedAchievements() {
    return JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '[]');
}

function saveAchievement(id) {
    const unlocked = getUnlockedAchievements();
    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
    }
}

function getStats() {
    const course = COURSES[activeCourse];
    const progress = loadProgress();
    let completed = 0;
    course.moduleIds.forEach(id => { if (progress[id]) completed++; });
    const percent = Math.round((completed / course.totalModules) * 100);

    // Count total completed across both courses
    let totalCompleted = 0;
    let startedBothCourses = false;
    let mediaStarted = false, techStarted = false;
    for (const [key, c] of Object.entries(COURSES)) {
        const p = JSON.parse(localStorage.getItem(c.storageKey) || '{}');
        let courseHasCompleted = false;
        c.moduleIds.forEach(id => {
            if (p[id]) { totalCompleted++; courseHasCompleted = true; }
        });
        if (key === 'media' && courseHasCompleted) mediaStarted = true;
        if (key === 'tech' && courseHasCompleted) techStarted = true;
    }
    startedBothCourses = mediaStarted && techStarted;

    // Count opened modules (tracked)
    const opened = JSON.parse(localStorage.getItem('ai_course_modules_opened') || '[]');

    // Count completed practices
    const practiceProgress = JSON.parse(localStorage.getItem(PRACTICE_KEY) || '{}');
    let practicesCompleted = 0;
    for (let i = 1; i <= 10; i++) {
        const steps = practiceProgress[`p${i}`] || [];
        const card = document.querySelector(`[data-practice="${i}"]`);
        const totalSteps = card ? card.querySelectorAll('.step').length : 4;
        if (steps.length >= totalSteps) practicesCompleted++;
    }

    return {
        completed,
        totalCompleted,
        percent,
        streak: getStreak(),
        courseTotal: course.totalModules,
        modulesOpened: opened.length,
        startedBothCourses,
        practicesCompleted
    };
}

function checkAchievements() {
    const stats = getStats();
    const unlocked = getUnlockedAchievements();

    ACHIEVEMENTS.forEach(a => {
        if (!unlocked.includes(a.id) && a.check(stats)) {
            saveAchievement(a.id);
            setTimeout(() => showToast(a.emoji, `הישג חדש: ${a.name}`, a.desc, 'achievement'), 800);
        }
    });

    updateAchievementsPanel();
}

function updateAchievementsPanel() {
    const unlocked = getUnlockedAchievements();
    const countEl = document.getElementById('achievementsCount');
    const listEl = document.getElementById('achievementsList');
    if (!countEl || !listEl) return;

    countEl.textContent = unlocked.length;
    listEl.innerHTML = ACHIEVEMENTS.map(a => {
        const isUnlocked = unlocked.includes(a.id);
        return `<div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
            <span class="achievement-emoji">${a.emoji}</span>
            <div class="achievement-info">
                <div class="achievement-name">${a.name}</div>
                <div class="achievement-desc">${isUnlocked ? a.desc : '???'}</div>
            </div>
        </div>`;
    }).join('');
}

function trackModuleOpen(moduleId) {
    const opened = JSON.parse(localStorage.getItem('ai_course_modules_opened') || '[]');
    if (!opened.includes(moduleId)) {
        opened.push(moduleId);
        localStorage.setItem('ai_course_modules_opened', JSON.stringify(opened));
    }
}

// ===== Reset Progress =====
function resetProgress() {
    if (!confirm('האם אתה בטוח? כל ההתקדמות וההישגים יימחקו.')) return;

    for (const c of Object.values(COURSES)) {
        localStorage.removeItem(c.storageKey);
    }
    localStorage.removeItem(ACHIEVEMENTS_KEY);
    localStorage.removeItem(STREAK_KEY);
    localStorage.removeItem('ai_course_modules_opened');

    showToast('🔄', 'אופס! מתחילים מחדש', 'כל ההתקדמות אופסה', '');
    updateUI();
    checkAchievements();
}

// Toggle module completion with celebration
function toggleComplete(moduleId) {
    const prevCourse = activeCourse;
    activeCourse = getCourseForModule(moduleId);
    const progress = loadProgress();
    const wasComplete = progress[moduleId];
    progress[moduleId] = !progress[moduleId];
    saveProgress(progress);
    activeCourse = prevCourse;
    updateUI();

    if (!wasComplete && progress[moduleId]) {
        const btn = document.getElementById(`btn-${moduleId}`);
        if (btn) {
            btn.classList.add('celebrate');
            setTimeout(() => btn.classList.remove('celebrate'), 600);
        }

        // Find module name
        const card = document.querySelector(`[data-module="${moduleId}"] h3`);
        const moduleName = card ? card.textContent : `מודול ${moduleId}`;
        showToast('✅', 'מודול הושלם!', moduleName, 'milestone');

        checkAchievements();
    }
}

// Toggle module expand/collapse
function toggleModule(moduleId) {
    const content = document.getElementById(`content-${moduleId}`);
    const expand = document.getElementById(`expand-${moduleId}`);
    const header = content.previousElementSibling;

    // Close all other modules in the same course
    const course = COURSES[getCourseForModule(moduleId)];
    course.moduleIds.forEach(id => {
        if (id !== moduleId) {
            const otherContent = document.getElementById(`content-${id}`);
            const otherExpand = document.getElementById(`expand-${id}`);
            if (otherContent) {
                otherContent.classList.remove('open');
                const otherHeader = otherContent.previousElementSibling;
                if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
            }
            if (otherExpand) otherExpand.classList.remove('rotated');
        }
    });

    const isOpen = content.classList.toggle('open');
    expand.classList.toggle('rotated');
    if (header) header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (isOpen) {
        trackModuleOpen(moduleId);
        checkAchievements();
    }
}

// Update all UI elements based on progress
function updateUI() {
    const course = COURSES[activeCourse];
    const progress = loadProgress();
    let completed = 0;

    course.moduleIds.forEach(i => {
        const card = document.querySelector(`[data-module="${i}"]`);
        const check = document.getElementById(`check-${i}`);
        const btn = document.getElementById(`btn-${i}`);
        if (!card || !check || !btn) return;

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
    });

    // Also update the other course's module states
    for (const [key, c] of Object.entries(COURSES)) {
        if (key === activeCourse) continue;
        const otherProgress = JSON.parse(localStorage.getItem(c.storageKey) || '{}');
        c.moduleIds.forEach(i => {
            const card = document.querySelector(`[data-module="${i}"]`);
            const check = document.getElementById(`check-${i}`);
            const btn = document.getElementById(`btn-${i}`);
            if (!card || !check || !btn) return;
            if (otherProgress[i]) {
                card.classList.add('completed');
                check.textContent = '✓';
                btn.classList.add('done');
            } else {
                card.classList.remove('completed');
                check.textContent = '○';
                btn.classList.remove('done');
            }
        });
    }

    // Update progress bar (for active course)
    const percent = Math.round((completed / course.totalModules) * 100);
    document.getElementById('progressBar').style.width = `${percent}%`;
    document.getElementById('totalProgress').textContent = `${percent}%`;
    document.getElementById('completedModules').textContent = completed;

    const progressInfo = document.querySelector('.progress-info');
    if (progressInfo) progressInfo.innerHTML = `<span id="completedModules">${completed}</span> מתוך ${course.totalModules} מודולים הושלמו`;

    const progressWrapper = document.querySelector('.progress-bar-wrapper');
    if (progressWrapper) progressWrapper.setAttribute('aria-valuenow', percent);

    // Update milestones
    document.querySelectorAll('.milestone').forEach(m => {
        const at = parseInt(m.dataset.at);
        m.classList.toggle('reached', percent >= at);
    });

    // Update streak display
    const streak = getStreak();
    const streakBadge = document.getElementById('streakBadge');
    const streakCount = document.getElementById('streakCount');
    if (streakBadge && streakCount) {
        if (streak >= 2) {
            streakBadge.style.display = '';
            streakCount.textContent = streak;
        } else {
            streakBadge.style.display = 'none';
        }
    }

    // Update certificate button
    const certBtn = document.getElementById('certBtn');
    const certNote = document.getElementById('certNote');
    if (certBtn && certNote) {
        if (completed === course.totalModules) {
            certBtn.disabled = false;
            certNote.textContent = 'כל הכבוד! אתה מוכן לקבל תעודה';
            certNote.style.color = '#00B894';
        } else {
            certBtn.disabled = true;
            certNote.textContent = `יש להשלים עוד ${course.totalModules - completed} מודולים לפני הפקת התעודה`;
            certNote.style.color = '';
        }
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

    const course = COURSES[activeCourse];
    const date = new Date().toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const certHTML = `
    <!DOCTYPE html>
    <html lang="he" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>תעודת סיום - ${name}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700;900&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Heebo', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a2e; padding: 20px; }
            .certificate { width: 800px; background: white; border-radius: 20px; padding: 60px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
            .certificate::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #6C5CE7, #00D2D3); }
            .cert-border { border: 3px solid #E8E8F0; border-radius: 16px; padding: 50px 40px; }
            .cert-icon { font-size: 4rem; margin-bottom: 10px; }
            .cert-title { font-size: 2.2rem; font-weight: 900; color: #2D3436; margin-bottom: 8px; }
            .cert-subtitle { font-size: 1rem; color: #888; margin-bottom: 40px; }
            .cert-label { font-size: 0.9rem; color: #888; margin-bottom: 8px; }
            .cert-name { font-size: 2.5rem; font-weight: 800; color: #6C5CE7; margin-bottom: 30px; padding: 10px 0; border-bottom: 3px solid #E8E8F0; }
            .cert-course { font-size: 1.1rem; color: #555; line-height: 1.8; margin-bottom: 40px; }
            .cert-course strong { color: #2D3436; }
            .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
            .cert-date, .cert-instructor { text-align: center; }
            .cert-date span, .cert-instructor span { display: block; font-size: 0.85rem; color: #888; margin-bottom: 4px; }
            .cert-date strong, .cert-instructor strong { font-size: 1rem; color: #2D3436; }
            .print-btn { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #6C5CE7; color: white; border: none; padding: 12px 40px; border-radius: 50px; font-size: 1rem; font-weight: 600; cursor: pointer; font-family: 'Heebo', sans-serif; }
            .print-btn:hover { background: #5A4BD1; }
            @media print { body { background: white; padding: 0; } .certificate { box-shadow: none; } .print-btn { display: none; } }
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
                    <strong>${course.name}</strong><br>
                    הכולל ${course.totalModules} מודולים: ${course.certModules}.
                </div>
                <div class="cert-footer">
                    <div class="cert-date"><span>תאריך</span><strong>${date}</strong></div>
                    <div class="cert-instructor"><span>מנחה הקורס</span><strong>שמשון ג'ייקוב</strong></div>
                </div>
            </div>
        </div>
        <button class="print-btn" onclick="window.print()">🖨️ הדפס תעודה</button>
    </body>
    </html>`;

    launchConfetti();
    setTimeout(() => {
        const certWindow = window.open('', '_blank');
        certWindow.document.write(certHTML);
        certWindow.document.close();
    }, 500);
}

// ===== Practice Tutorials System =====
const PRACTICE_KEY = 'ai_course_practice_progress';

function togglePractice(id) {
    const content = document.getElementById(`content-p${id}`);
    const expand = document.getElementById(`expand-p${id}`);
    if (!content) return;

    document.querySelectorAll('.practice-content.open').forEach(el => {
        if (el.id !== `content-p${id}`) {
            el.classList.remove('open');
            const otherId = el.id.replace('content-p', '');
            const otherExpand = document.getElementById(`expand-p${otherId}`);
            if (otherExpand) otherExpand.classList.remove('rotated');
        }
    });

    content.classList.toggle('open');
    if (expand) expand.classList.toggle('rotated');
}

function getPracticeProgress() {
    return JSON.parse(localStorage.getItem(PRACTICE_KEY) || '{}');
}

function toggleStep(practiceId, stepIdx) {
    const progress = getPracticeProgress();
    const key = `p${practiceId}`;
    if (!progress[key]) progress[key] = [];

    if (progress[key].includes(stepIdx)) {
        progress[key] = progress[key].filter(s => s !== stepIdx);
    } else {
        progress[key].push(stepIdx);
    }
    localStorage.setItem(PRACTICE_KEY, JSON.stringify(progress));
    updatePracticeUI(practiceId);

    // Check if all steps completed
    const card = document.querySelector(`[data-practice="${practiceId}"]`);
    const totalSteps = card ? card.querySelectorAll('.step').length : 4;
    if (progress[key].length === totalSteps) {
        showToast('🎉', 'תרגול הושלם!', card.querySelector('h3')?.textContent || `תרגול ${practiceId}`, 'milestone');
        checkAchievements();
    }
}

function updatePracticeUI(practiceId) {
    const progress = getPracticeProgress();
    const key = `p${practiceId}`;
    const completed = progress[key] || [];
    const card = document.querySelector(`[data-practice="${practiceId}"]`);
    if (!card) return;

    const steps = card.querySelectorAll('.step');
    const totalSteps = steps.length;

    steps.forEach((step, idx) => {
        const checkbox = step.querySelector('.step-check');
        if (checkbox) {
            checkbox.classList.toggle('checked', completed.includes(idx));
        }
        step.classList.toggle('step-done', completed.includes(idx));
    });

    const bar = card.querySelector('.practice-progress-fill');
    const text = card.querySelector('.practice-progress-text');
    if (bar && text) {
        const pct = Math.round((completed.length / totalSteps) * 100);
        bar.style.width = pct + '%';
        text.textContent = `${completed.length}/${totalSteps}`;
    }

    // Mark card as completed
    card.classList.toggle('practice-completed', completed.length === totalSteps);
}

function copyPrompt(btn) {
    const code = btn.previousElementSibling || btn.closest('.step-content').querySelector('code');
    if (!code) return;
    const text = code.textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✓ הועתק!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '📋 העתק'; btn.classList.remove('copied'); }, 1500);
    });
}

function initPractices() {
    // Add checkboxes, progress bars, copy buttons to all practices
    document.querySelectorAll('.practice-card').forEach(card => {
        const practiceId = card.dataset.practice;

        // Add progress bar to header
        const header = card.querySelector('.practice-header');
        const progressHTML = `<div class="practice-progress"><div class="practice-progress-fill"></div><span class="practice-progress-text">0/4</span></div>`;
        const expandIcon = header.querySelector('.expand-icon');
        expandIcon.insertAdjacentHTML('beforebegin', progressHTML);

        // Add checkboxes to steps
        card.querySelectorAll('.step').forEach((step, idx) => {
            const numEl = step.querySelector('.step-number');
            if (numEl) {
                numEl.outerHTML = `<button class="step-check" onclick="event.stopPropagation(); toggleStep(${practiceId}, ${idx})" aria-label="סמן שלב ${idx + 1}"><span class="step-check-num">${idx + 1}</span></button>`;
            }
        });

        // Add copy buttons to code blocks
        card.querySelectorAll('.step-content code').forEach(code => {
            const btn = document.createElement('button');
            btn.className = 'copy-prompt-btn';
            btn.textContent = '📋 העתק';
            btn.onclick = function() { copyPrompt(this); };
            code.insertAdjacentElement('afterend', btn);
        });

        updatePracticeUI(practiceId);
    });
}

// ===== Referral System =====
function shareReferral() {
    const url = window.location.href.split('?')[0];
    const code = 'FRIEND20';
    const msg = encodeURIComponent(`🎓 גילית את הקורס הכי שווה ללמוד AI!\n\nעם הקוד שלי תקבלו 20% הנחה: ${code}\n\n👉 ${url}?ref=${code}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}

function checkReferral() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
        localStorage.setItem('ai_course_referral', ref);
        const priceEl = document.querySelector('.price-number');
        const subtitleEl = document.querySelector('.pricing-subtitle');
        const badgeEl = document.querySelector('.pricing-badge');
        if (priceEl) {
            priceEl.innerHTML = '<del style="font-size:0.5em;color:var(--text-muted)">197</del> 157';
        }
        if (subtitleEl) subtitleEl.textContent = 'הגעת עם קוד חבר! 20% הנחה מיוחדת';
        if (badgeEl) badgeEl.textContent = '🎉 הנחת חבר מביא חבר';
    }
}

// Video source mapping for modules with multiple videos
const videoSources = {
    2: [
        'course/פרק 2 - השוואה בין כלי טקסט ביצירת תמונות',
        'course/פרק 3- המודל המטורף של גוגל ננו בננה וסודות נוספים..!.mp4'
    ],
    4: [
        'course/סונו חלק 1.mp4',
        'course/סונו חלק 2 .mp4'
    ]
};

// Subtitle mapping for multi-video modules
const subtitleSources = {
    2: ['subtitles/module-2-1.vtt', 'subtitles/module-2-2.vtt'],
    4: ['subtitles/module-4-1.vtt', 'subtitles/module-4-2.vtt']
};

// Switch video in a module with multiple videos
function switchVideo(moduleId, videoIndex, btn) {
    const player = document.getElementById(`video-player-${moduleId}`);
    if (!player) return;

    const sources = videoSources[moduleId];
    if (!sources || !sources[videoIndex]) return;

    player.src = sources[videoIndex];

    const subs = subtitleSources[moduleId];
    if (subs && subs[videoIndex]) {
        const track = player.querySelector('track');
        if (track) {
            track.src = subs[videoIndex];
        }
    }

    player.load();

    const selector = document.getElementById(`video-selector-${moduleId}`);
    selector.querySelectorAll('.video-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateStreak();
    updateUI();
    initBackToTop();
    initScrollReveal();
    initPractices();
    checkReferral();
    updateAchievementsPanel();
    checkAchievements();

    // Achievements panel toggle
    const toggle = document.getElementById('achievementsToggle');
    const dropdown = document.getElementById('achievementsDropdown');
    if (toggle && dropdown) {
        toggle.addEventListener('click', () => {
            dropdown.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.achievements-panel')) {
                dropdown.classList.remove('open');
            }
        });
    }

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
