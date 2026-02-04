const playBtn = document.getElementById('play-btn');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const questionText = document.getElementById('question-text');
const answersDiv = document.getElementById('answers');
const timerEl = document.getElementById('timer');
const livesEl = document.getElementById('lives');
const container = document.getElementById('question-container');

let questions = [];
let index = 0;
let lives = 3;
let startTime;
let timerInterval;

/* ================= AUDIO (FIXED) ================= */
const tracks = [];
let currentTrack = 0;

for (let i = 1; i <= 8; i++) {
  const a = new Audio(`music/music${i}.mp3`);
  a.volume = 0.5;
  a.addEventListener('ended', () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    playMusic();
  });
  tracks.push(a);
}

function playMusic() {
  tracks.forEach(t => {
    t.pause();
    t.currentTime = 0;
  });
  tracks[currentTrack].play().catch(()=>{});
}

/* ================= LOAD QUESTIONS ================= */
async function loadQuestions() {
  const files = ['medium','hard','trick','playable'];
  let all = [];

  for (const f of files) {
    const res = await fetch(`questions/${f}.json`);
    const data = await res.json();
    all.push(...data);
  }

  return all.sort((a,b)=>a.num-b.num);
}

/* ================= GAME START ================= */
playBtn.onclick = async () => {
  playMusic();               // ✅ audio now starts correctly
  startScreen.remove();
  gameScreen.style.display = 'block';

  questions = await loadQuestions();
  startTime = Date.now();
  startTimer();
  updateLives();
  showQuestion();
};

/* ================= TIMER ================= */
function startTimer() {
  timerInterval = setInterval(() => {
    timerEl.textContent =
      ((Date.now() - startTime) / 1000).toFixed(1) + 's';
  }, 100);
}

/* ================= LIVES ================= */
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

/* ================= VISUAL FEEDBACK ================= */
function flash(type) {
  document.body.classList.add(type);
  setTimeout(() => document.body.classList.remove(type), 150);
}

function shake() {
  container.classList.remove('shake');
  void container.offsetWidth;
  container.classList.add('shake');
}

/* ================= QUESTIONS ================= */
function showQuestion() {
  answersDiv.innerHTML = '';

  const q = questions[index];
  questionText.textContent = q.q;

  questionText.style.animation = 'none';
  void questionText.offsetWidth;
  questionText.style.animation = 'pound 0.4s';

  if (q.type === 'normal') renderNormal(q);
  if (q.type === 'mini') renderMini(q);
}

/* ================= NORMAL ================= */
function renderNormal(q) {
  q.options.forEach((opt,i)=>{
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => {
      if (i === q.answer) {
        flash('correct');
        next();
      } else {
        loseLife();
      }
    };
    answersDiv.appendChild(btn);
  });
}

/* ================= MINI GAMES (FIXED) ================= */
function renderMini(q) {

  // HOLD BUTTON
  if (q.mini === 'hold') {
    const btn = document.createElement('button');
    btn.textContent = 'HOLD';
    let timer;

    btn.onmousedown = () => {
      timer = setTimeout(() => {
        flash('correct');
        next();
      }, q.duration);
    };

    btn.onmouseup = btn.onmouseleave = () => {
      clearTimeout(timer);
    };

    answersDiv.appendChild(btn);
  }

  // WAIT THEN CLICK
  if (q.mini === 'wait') {
    const btn = document.createElement('button');
    btn.textContent = 'CLICK';
    const start = Date.now();

    btn.onclick = () => {
      Math.abs(Date.now() - start - q.duration) < 200
        ? (flash('correct'), next())
        : loseLife();
    };

    answersDiv.appendChild(btn);
  }

  // REVERSE
  if (q.mini === 'reverse') {
    ['Correct','Wrong'].forEach(text => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.onclick = () =>
        text === 'Wrong'
          ? (flash('correct'), next())
          : loseLife();
      answersDiv.appendChild(btn);
    });
  }
}

/* ================= NEXT ================= */
function next() {
  index++;
  showQuestion();
}