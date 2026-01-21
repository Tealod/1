// script.js — umumiy quiz logikasi (har bir booster uchun ishlatilishi mumkin)

document.addEventListener('DOMContentLoaded', () => {
    // Student nomini ko'rsatish
    const studentName = localStorage.getItem('studentName') || 'Guest';
    const studentInfoEl = document.getElementById('student-info');
    if (studentInfoEl) {
        studentInfoEl.textContent = `Student: ${studentName}`;
    }

    // ── Timer (35 minutes = 2100 seconds) ────────────────────────────────
    let timeLeft = 2100;  // 35 daqiqa (agar 60 min bo'lishi kerak bo'lsa → 3600 qo'ying)
    const timeDisplay = document.getElementById('time');

    if (!timeDisplay) {
        console.warn("Timer element (#time) topilmadi");
    }

    const timerInterval = setInterval(() => {
        timeLeft--;

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Rang o'zgarishi
        if (timeLeft <= 300) {
            timeDisplay.style.color = timeLeft <= 60 ? '#c0392b' : '#e67e22'; // qizil / sariq
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! The test is being submitted automatically.");
            finishTest();
        }
    }, 1000);

    // ── Finish tugmasi ────────────────────────────────────────────────────
    const finishBtn = document.getElementById('finishBtn');
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to finish the test?")) {
                clearInterval(timerInterval);
                finishTest();
            }
        });
    }

    // ── Testni yakunlash funksiyasi ──────────────────────────────────────
    function finishTest() {
        let score = 0;
        const cards = document.querySelectorAll('.question-card');

        cards.forEach(card => {
            const correctAnswer = card.dataset.answer?.trim() || '';
            const questionType  = card.dataset.type || 'text';

            let userAnswer = '';

            if (questionType === 'radio') {
                const selected = card.querySelector('input[type="radio"]:checked');
                userAnswer = selected ? selected.value.trim() : '';
            } else {
                const input = card.querySelector('.user-input');
                userAnswer = input ? input.value.trim() : '';
            }

            // Normalizatsiya (bo'shliqlar, katta/kichik harflar)
            const normCorrect = correctAnswer.toLowerCase().replace(/\s+/g, '');
            const normUser    = userAnswer.toLowerCase().replace(/\s+/g, '');

            let isCorrect = (normUser === normCorrect) && userAnswer !== '';

            // Floating-point raqamlar uchun kichik tolerantlik
            if (!isCorrect && !isNaN(parseFloat(userAnswer)) && !isNaN(parseFloat(correctAnswer))) {
                const userNum  = parseFloat(userAnswer);
                const correctNum = parseFloat(correctAnswer);
                if (Math.abs(userNum - correctNum) < 0.015) {
                    isCorrect = true;
                }
            }

            // Natijani vizual ko'rsatish
            card.classList.remove('correct', 'incorrect');

            if (isCorrect) {
                card.classList.add('correct');
                score++;
            } else if (userAnswer !== '') {
                card.classList.add('incorrect');
            }
        });

        // Natijalarni ko'rsatish
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <h2>Test Completed</h2>
                <p>Student: <b>${studentName}</b></p>
                <p>Your score: <b>${score} / ${cards.length}</b></p>
                <p>Percentage: <b>${((score / cards.length) * 100).toFixed(1)}%</b></p>
            `;
            resultsDiv.style.display = 'block';

            // Scroll to results
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
        }

        // Tugmalarni o'chirish / yashirish
        if (finishBtn) finishBtn.disabled = true;
        const timerEl = document.querySelector('.timer');
        if (timerEl) timerEl.style.display = 'none';
    }

    // Sahifa yopilganda yoki yangilanganda timer to'xtatilishi uchun (ixtiyoriy)
    window.addEventListener('beforeunload', () => {
        clearInterval(timerInterval);
    });
});