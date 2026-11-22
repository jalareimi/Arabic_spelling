// البيانات الأساسية
let words = JSON.parse(localStorage.getItem('spelling_words')) || ['نَجْمٌ', 'قَمَرٌ', 'شَمْسٌ', 'بَحْرٌ', 'كِتَابٌ'];
let adminEmail = localStorage.getItem('admin_email') || '';
let currentIndex = 0;
let stars = 0;
let attemptNumber = 1; // المحاولة الحالية للكلمة (1 أو 2)
let wordFinished = false; // هل انتهت الكلمة الحالية (إما بإجابة صحيحة أو استنفاد المحاولتين)
let autoAdvanceTimer = null;

// تهيئة التطبيق عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    // التأكد التام من إخفاء لوحة المعلم وصندوق الدخول عند فتح الصفحة
    document.getElementById('teacher-modal').classList.add('hidden');
    document.getElementById('login-box').classList.add('hidden');

    if (words.length === 0) {
        words = ['قَلَمٌ', 'مَدْرَسَةٌ'];
    }

    updateUI();

    // تفعيل زر الإدخال Enter للتحقق من الإجابة
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !wordFinished) {
            checkAnswer();
        }
    });
});

// تحديث واجهة المستخدم والعدادات
function updateUI() {
    document.getElementById('star-count').textContent = stars;
    document.getElementById('word-counter').textContent = `الكلمة ${currentIndex + 1} من ${words.length}`;
    document.getElementById('attempt-badge').textContent = `المحاولة ${attemptNumber} من 2`;

    const nextBtn = document.getElementById('next-btn');
    if (currentIndex === words.length - 1) {
        nextBtn.textContent = 'إنهاء التحدي 🏁';
    } else {
        nextBtn.textContent = 'الكلمة التالية ⬅️';
    }
}

// نطق أي عبارة أو كلمة باللغة العربية
function speakArabic(text, rate = 0.85, pitch = 1.15, onEndCallback = null) {
    if (!text) {
        if (onEndCallback) onEndCallback();
        return;
    }

    if (!('speechSynthesis' in window)) {
        if (onEndCallback) onEndCallback();
        return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (onEndCallback) {
        utterance.onend = onEndCallback;
        utterance.onerror = onEndCallback;
    }

    window.speechSynthesis.speak(utterance);
}

// نطق الكلمة الحالية
function playCurrentWord() {
    const word = words[currentIndex];
    if (!word) return;

    const btn = document.getElementById('listen-btn');
    btn.style.transform = 'scale(0.9)';

    speakArabic(word, 0.72, 1.1, () => {
        btn.style.transform = 'scale(1)';
    });
}

// إزالة التشكيل للمقارنة المرنة
function removeTashkeel(text) {
    return text.normalize("NFKD").replace(/[\u064B-\u0652]/g, '').trim();
}

// التحقق من إجابة الطالب (محاولتان فقط لكل كلمة)
function checkAnswer() {
    if (wordFinished) return;

    const inputEl = document.getElementById('user-input');
    const feedbackEl = document.getElementById('feedback-box');
    const userText = removeTashkeel(inputEl.value);
    const correctText = removeTashkeel(words[currentIndex]);

    if (!userText) {
        feedbackEl.textContent = 'اكتب الكلمة أولاً يا بطل! ✏️';
        feedbackEl.className = 'feedback-box feedback-warning';
        speakArabic('اكتب الكلمة أولاً يا بطل', 0.9, 1.2);
        return;
    }

    // إجابة صحيحة
    if (userText === correctText) {
        wordFinished = true;
        inputEl.disabled = true;
        document.getElementById('check-btn').disabled = true;

        stars += 1;
        document.getElementById('star-count').textContent = stars;
        feedbackEl.textContent = 'أحسنت يا بطل! إجابة صحيحة وحصلت على نجمة ⭐ هيا للكلمة التالية!';
        feedbackEl.className = 'feedback-box feedback-success';

        playEncouragingSound();
        speakArabic('أحسنت! إجابة ممتازة، هيا ننتقل للكلمة التالية', 0.9, 1.25);

        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = setTimeout(() => {
            advanceToNextWord(false);
        }, 2600);
        return;
    }

    // إجابة خاطئة في المحاولة الأولى -> يسمح بالمحاولة الثانية
    if (attemptNumber === 1) {
        attemptNumber = 2;
        updateUI();
        inputEl.value = '';
        inputEl.focus();

        feedbackEl.textContent = 'حاول مرة ثانية يا بطل، ركّز وراح تجيبها! 💪';
        feedbackEl.className = 'feedback-box feedback-warning';

        playTryAgainSound();
        speakArabic('حاول مرة ثانية', 0.9, 1.15, () => {
            // إعادة نطق الكلمة لمساعدة الطفل في المحاولة الثانية
            setTimeout(() => playCurrentWord(), 300);
        });
        return;
    }

    // إجابة خاطئة في المحاولة الثانية -> تشجيع والانتقال التلقائي للكلمة التالية
    if (attemptNumber >= 2) {
        wordFinished = true;
        inputEl.disabled = true;
        document.getElementById('check-btn').disabled = true;

        feedbackEl.textContent = `للأسف ما زبطت هالمرة، الكلمة هي (${words[currentIndex]})، المرة الجاية أفضل بإذن الله! 🌟`;
        feedbackEl.className = 'feedback-box feedback-error';

        playEncouragingSound();
        speakArabic('للأسف ما زبطت هالمرة، إن شاء الله بتجيبها المرة الجاية', 0.9, 1.15);

        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = setTimeout(() => {
            advanceToNextWord(false);
        }, 3400);
    }
}

// زر الكلمة التالية اليدوي
function nextWord() {
    clearTimeout(autoAdvanceTimer);
    advanceToNextWord(true);
}

// الانتقال للكلمة التالية مرة واحدة فقط بدون تكرار لا نهائي
function advanceToNextWord(speakWordAfterMove) {
    if (currentIndex >= words.length - 1) {
        showEndScreen();
        return;
    }

    currentIndex++;
    attemptNumber = 1;
    wordFinished = false;

    const inputEl = document.getElementById('user-input');
    inputEl.value = '';
    inputEl.disabled = false;
    inputEl.focus();

    document.getElementById('check-btn').disabled = false;
    document.getElementById('feedback-box').textContent = '';

    updateUI();

    if (speakWordAfterMove) {
        playCurrentWord();
    }
}

// عرض شاشة النهاية
function showEndScreen() {
    clearTimeout(autoAdvanceTimer);
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('word-counter').classList.add('hidden');
    document.getElementById('attempt-badge').classList.add('hidden');
    document.getElementById('final-stars').textContent = `${stars} من ${words.length}`;
    document.getElementById('end-screen').classList.remove('hidden');
    speakArabic(`أحسنت يا بطل! أنهيت التحدي وجمعت ${stars} نجوم`, 0.9, 1.25);
}

// إعادة اللعبة من البداية
function restartGame() {
    clearTimeout(autoAdvanceTimer);
    currentIndex = 0;
    stars = 0;
    attemptNumber = 1;
    wordFinished = false;

    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');
    document.getElementById('word-counter').classList.remove('hidden');
    document.getElementById('attempt-badge').classList.remove('hidden');

    const inputEl = document.getElementById('user-input');
    inputEl.value = '';
    inputEl.disabled = false;
    document.getElementById('check-btn').disabled = false;
    document.getElementById('feedback-box').textContent = '';

    updateUI();
}

// نغمة تشجيعية لطيفة
function playEncouragingSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.11);
            gain.gain.setValueAtTime(0.22, ctx.currentTime + i * 0.11);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (i + 1) * 0.11);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.11);
            osc.stop(ctx.currentTime + (i + 1) * 0.11);
        });
    } catch (e) {}
}

// نغمة تنبيه خفيفة عند المحاولة الثانية
function playTryAgainSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [392.0, 349.23];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
            gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (i + 1) * 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + (i + 1) * 0.15);
        });
    } catch (e) {}
}

// --- إدارة لوحة تحكم المعلم ---

function toggleLoginBox() {
    const loginBox = document.getElementById('login-box');
    loginBox.classList.toggle('hidden');
    document.getElementById('admin-password').value = '';
}

function loginAdmin() {
    const pass = document.getElementById('admin-password').value;
    if (pass === '1234') {
        document.getElementById('login-box').classList.add('hidden');
        document.getElementById('admin-password').value = '';
        openTeacherPanel();
    } else {
        alert('رمز الدخول غير صحيح!');
    }
}

function openTeacherPanel() {
    const container = document.getElementById('words-container');
    container.innerHTML = '';
    words.forEach(w => addWordField(w));
    document.getElementById('teacher-email').value = adminEmail;
    document.getElementById('teacher-modal').classList.remove('hidden');
}

function closeTeacherPanel() {
    document.getElementById('teacher-modal').classList.add('hidden');
}

function addWordField(value) {
    const container = document.getElementById('words-container');
    const row = document.createElement('div');
    row.className = 'word-item-row';
    row.innerHTML = `
        <input type="text" value="${value}" placeholder="أدخل الكلمة بالتشكيل">
        <button onclick="this.parentElement.remove()" class="btn-remove">حذف</button>
    `;
    container.appendChild(row);
}

function saveSettings() {
    const inputs = document.querySelectorAll('#words-container input');
    const updatedWords = Array.from(inputs)
        .map(input => input.value.trim())
        .filter(val => val !== '');

    if (updatedWords.length === 0) {
        alert('الرجاء إضافة كلمة واحدة على الأقل.');
        return;
    }

    words = updatedWords;
    adminEmail = document.getElementById('teacher-email').value.trim();

    localStorage.setItem('spelling_words', JSON.stringify(words));
    localStorage.setItem('admin_email', adminEmail);

    closeTeacherPanel();
    restartGame();
}
