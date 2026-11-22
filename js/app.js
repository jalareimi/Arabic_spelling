let words = JSON.parse(localStorage.getItem('spelling_words')) || ['نَجْم', 'قَمَر'];
let adminEmail = localStorage.getItem('admin_email') || 'teacher@example.com';

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    document.getElementById('email-input').value = adminEmail;
});

function initGame() {
    const container = document.getElementById('inputs-container');
    container.innerHTML = '';
    words.forEach((word, index) => {
        addWordInput(word);
    });
}

function addWordInput(value) {
    const container = document.getElementById('inputs-container');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'أدخل الكلمة مع التشكيل';
    container.appendChild(input);
    if(container.children.length > words.length && value === '') {
        input.focus();
    }
}

const observer = new MutationObserver(() => {
    const inputs = document.querySelectorAll('#inputs-container input');
    if (inputs.length > 0 && inputs[inputs.length - 1].value !== '') {
        addWordInput('');
    }
});
observer.observe(document.getElementById('inputs-container'), { childList: true });

function playDictation() {
    const inputs = document.querySelectorAll('#inputs-container input');
    let index = 0;
    function speakNext() {
        if (index < inputs.length) {
            const text = inputs[index].value;
            if(text) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'ar-XA';
                utterance.rate = 0.8;
                utterance.onend = () => {
                    index++;
                    speakNext();
                };
                window.speechSynthesis.speak(utterance);
            } else {
                index++;
                speakNext();
            }
        }
    }
    speakNext();
}

function showLogin() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function checkPassword() {
    if(document.getElementById('password-input').value === '1234') {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('admin-screen').classList.remove('hidden');
        renderAdminWords();
    } else {
        alert('كلمة مرور خاطئة');
    }
}

function renderAdminWords() {
    const container = document.getElementById('admin-words-container');
    container.innerHTML = '';
    words.forEach(word => {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = word;
        container.appendChild(input);
    });
}

const adminObserver = new MutationObserver(() => {
    const inputs = document.querySelectorAll('#admin-words-container input');
    if (inputs.length > 0 && inputs[inputs.length - 1].value !== '') {
        const input = document.createElement('input');
        input.type = 'text';
        document.getElementById('admin-words-container').appendChild(input);
    }
});
adminObserver.observe(document.getElementById('admin-words-container'), { childList: true });

function saveAdminSettings() {
    const inputs = document.querySelectorAll('#admin-words-container input');
    words = Array.from(inputs).map(input => input.value).filter(val => val.trim() !== '');
    adminEmail = document.getElementById('email-input').value;
    localStorage.setItem('spelling_words', JSON.stringify(words));
    localStorage.setItem('admin_email', adminEmail);
    alert('تم حفظ الإعدادات بنجاح');
    initGame();
}
