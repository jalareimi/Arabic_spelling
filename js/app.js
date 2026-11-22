// Data Management
let words = JSON.parse(localStorage.getItem('spelling_words')) || ['نَجْمٌ', 'قَمَرٌ', 'شَمْسٌ', 'بَحْرٌ', 'كِتَابٌ'];
let adminEmail = localStorage.getItem('admin_email') || '';
let currentScore = parseInt(localStorage.getItem('user_score')) || 0;
let currentWordIndex = 0;

// Initialize Flow
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('star-count').textContent = currentScore;
    if (words.length === 0) {
        words = ['تَعْلِيم'];
        saveWordsToStorage();
    }
    createBackgroundStars();
    
    // Auto-focus input on click/enter
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
});

function createBackgroundStars() {
    const container = document.getElementById('stars-container');
    for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.innerHTML = '⭐';
        star.className = 'star-element';
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDuration = `${3 + Math.random() * 4}s`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(star);
    }
}

function saveWordsToStorage() {
    localStorage.setItem('spelling_words', JSON.stringify(words));
}

// Audio Engine (Speech Synthesis)
function playCurrentWord() {
    const wordToSpeak = words[currentWordIndex];
    if (!wordToSpeak) return;

    if (!('speechSynthesis' in window)) {
        alert('عذراً، متصفحك لا يدعم خاصية النطق.');
        return;
    }

    window.speechSynthesis.cancel(); // Interrupt pending utterances

    const utterance = new SpeechSynthesisUtterance(wordToSpeak);
    utterance.lang = 'ar-SA'; // Standard Arabic
    utterance.rate = 0.75;    // Slower speed for child comprehension
    utterance.pitch = 1.2;    // Slightly higher pitch for friendliness
    
    // Visual cue during speech
    const soundBtn = document.querySelector('.btn-sound');
    soundBtn.style.transform = 'scale(0.95)';
    utterance.onend = () => soundBtn.style.transform = 'scale(1)';
    utterance.onerror = () => soundBtn.style.transform = 'scale(1)';

    window.speechSynthesis.speak(utterance);
}

// Game Logic
function checkAnswer() {
    const inputField = document.getElementById('user-input');
    const feedbackDiv = document.getElementById('feedback-message');
    const userAnswer = inputField.value.trim().normalize("NFKD").replace(/[\u064B-\u0652]/g, ''); // Basic normalization
    const correctAnswer = words[currentWordIndex];
    const cleanCorrect = correctAnswer.normalize("NFKD").replace(/[\u064B-\u0652]/g, '');

    if (!userAnswer) {
        showFeedback('الرجاء كتابة إجابة أولاً! ✏️', 'error');
        return;
    }

    if (userAnswer === cleanCorrect) {
        triggerSuccessCelebration();
    } else {
        showFeedback(`حاول مرة أخرى! الكلمة الصحيحة هي: ${correctAnswer}`, 'error');
    }
}

function showFeedback(text, type) {
    const feedbackDiv = document.getElementById('feedback-message');
    feedbackDiv.textContent = text;
    feedbackDiv.className = `feedback ${type}`;
}

function triggerSuccessCelebration() {
    currentScore += 10;
    localStorage.setItem('user_score', currentScore);
    document.getElementById('star-count').textContent = currentScore;
    
    showFeedback('أحسنت بطل! إجابة صحيحة ⭐⭐⭐', 'correct');
    
    // Play celebratory sound if available via Web Audio API
    playSuccessTone();

    setTimeout(() => {
        nextWord();
    }, 2000);
}

function playSuccessTone() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime + index * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (index + 1) * 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + index * 0.1);
            osc.stop(ctx.currentTime + (index + 1) * 0.1);
        });
    } catch(e) {
        console.log('Audio context not allowed before user interaction');
    }
}

function nextWord() {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    document.getElementById('user-input').value = '';
    document.getElementById('feedback-message').textContent = '';
    document.getElementById('user-input').focus();
    playCurrentWord();
}

// Admin Panel Logic
function toggleAdminLogin() {
    document.getElementById('admin-login-modal').classList.toggle('hidden');
}

function verifyAdmin() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === '1234') {
        document.getElementById('admin-login-modal').classList.add('hidden');
        openAdminPanel();
    } else {
        alert('كلمة المرور غير صحيحة!');
    }
}

function openAdminPanel() {
    const list = document.getElementById('words-inputs-list');
    list.innerHTML = '';
    words.forEach((word) => {
        addWordInput(word);
    });
    document.getElementById('admin-email').value = adminEmail;
    document.getElementById('admin-panel').classList.remove('hidden');
}

function addWordInput(value) {
    const list = document.getElementById('words-inputs-list');
    const row = document.createElement('div');
    row.className = 'word-row';
    row.innerHTML = `
        <input type="text" value="${value}" placeholder="مثال: نَجْمٌ">
        <button onclick="this.parentElement.remove()" class="btn-delete">حذف</button>
    `;
    list.appendChild(row);
}

function saveAdminSettings() {
    const inputs = document.querySelectorAll('#words-inputs-list input');
    const newWords = Array.from(inputs).map(i => i.value.trim()).filter(v => v !== '');
    
    if (newWords.length === 0) {
        alert('يجب إضافة كلمة واحدة على الأقل!');
        return;
    }

    words = newWords;
    adminEmail = document.getElementById('admin-email').value.trim();

    saveWordsToStorage();
    localStorage.setItem('admin_email', adminEmail);

    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('admin-pass').value = '';
    currentWordIndex = 0;
    nextWord();
}
