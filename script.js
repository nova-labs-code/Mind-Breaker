/* ==================== ELEMENTS ==================== */
const playBtn = document.getElementById('play-btn');
const usernameInput = document.getElementById('username');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const questionContainer = document.getElementById('question-container');
const questionNumberEl = document.getElementById('question-number');
const questionText = document.getElementById('question-text');
const answersDiv = document.getElementById('answers');
const timerEl = document.getElementById('timer');
const livesEl = document.getElementById('lives');

let questions = [];
let currentIndex = 0;
let lives = 3;
let startTime;
let timerInterval;
let username;

/* ==================== LOAD QUESTIONS ==================== */
async function loadQuestions() {
    const files = ['medium','hard','trick','mind-tricks'];
    let all = [];
    for (const f of files) {
        try {
            const data = await fetch(`questions/${f}.json`).then(r=>r.json());
            if (Array.isArray(data)) all.push(...data);
        } catch(e) {
            console.warn(`Failed to load ${f}.json`, e);
        }
    }
    // Sort by 'num' to preserve intended order
    all.sort((a,b) => a.num - b.num);
    return all;
}

/* ==================== START QUIZ ==================== */
playBtn.onclick = async () => {
    username = usernameInput.value.trim();
    if (!username) return alert("Enter a username!");

    // Fade out and remove start screen
    startScreen.style.transition = 'opacity 0.5s';
    startScreen.style.opacity = 0;
    setTimeout(() => startScreen.remove(), 500);

    gameScreen.style.display = 'flex';

    questions = await loadQuestions();
    if (!questions.length) return alert("No questions loaded!");

    startTime = Date.now();
    startTimer();
    updateLives();
    showQuestion();
};

/* ==================== TIMER ==================== */
function startTimer() {
    timerInterval = setInterval(() => {
        timerEl.textContent = ((Date.now() - startTime)/1000).toFixed(1) + 's';
    }, 100);
}

/* ==================== LIVES ==================== */
function updateLives() {
    livesEl.textContent = '❤ '.repeat(lives);
}

function loseLife() {
    flash('wrong');
    shake();
    lives--;
    updateLives();
    if (lives <= 0) location.reload();
}

/* ==================== FEEDBACK ==================== */
function flash(type) {
    document.body.classList.add(type);
    setTimeout(() => document.body.classList.remove(type), 150);
}

function shake() {
    questionContainer.classList.remove('shake');
    void questionContainer.offsetWidth; // trigger reflow
    questionContainer.classList.add('shake');
}

/* ==================== SHOW QUESTION ==================== */
function showQuestion() {
    if (currentIndex >= questions.length) {
        finishQuiz();
        return;
    }

    answersDiv.innerHTML = '';
    const q = questions[currentIndex];

    // Question number / total
    questionNumberEl.textContent = `Question ${currentIndex + 1} / ${questions.length}`;

    // Question text
    questionText.textContent = q.q;
    questionText.style.animation = 'none';
    void questionText.offsetWidth; // reset animation
    questionText.style.animation = 'pound 0.4s';

    // Answer buttons
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.onclick = () => {
            if (i === q.answer) {
                flash('correct');
                nextQuestion();
            } else {
                loseLife();
            }
        };
        answersDiv.appendChild(btn);
    });
}

/* ==================== NEXT QUESTION ==================== */
function nextQuestion() {
    currentIndex++;
    showQuestion();
}

/* ==================== FINISH QUIZ ==================== */
function finishQuiz() {
    clearInterval(timerInterval);
    const timeTaken = ((Date.now() - startTime)/1000).toFixed(2);
    saveScore(username, timeTaken);
    showLeaderboard();
}

/* ==================== LEADERBOARD ==================== */
function saveScore(user, time) {
    const lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    let name = user;
    const dup = lb.filter(e => e.username.startsWith(user)).length;
    if (dup > 0) name = user + '#' + (dup + 1);
    lb.push({username: name, time: parseFloat(time)});
    lb.sort((a,b)=>a.time - b.time);
    if (lb.length > 1000) lb.length = 1000;
    localStorage.setItem('leaderboard', JSON.stringify(lb));
}

function showLeaderboard() {
    gameScreen.innerHTML = '<h2>LEADERBOARD</h2>';
    const lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const ol = document.createElement('ol');
    ol.style.color = 'yellow';
    ol.style.fontSize = '1rem';
    ol.style.maxHeight = '80vh';
    ol.style.overflowY = 'auto';
    ol.style.padding = '0 1rem';
    lb.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.username} — ${entry.time}s`;
        ol.appendChild(li);
    });
    gameScreen.appendChild(ol);
}