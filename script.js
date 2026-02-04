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

/* ---------- AUDIO ---------- */
const tracks = [];
for (let i = 1; i <= 8; i++) {
  const a = new Audio(`music/music${i}.mp3`);
  a.loop = true;
  a.volume = 0.5;
  tracks.push(a);
}

/* ---------- LOAD QUESTIONS ---------- */
async function loadQuestions() {
  const files = ['medium','hard','trick','playable'];
  let all = [];

  for (const f of files) {
    const data = await fetch(`questions/${f}.json`).then(r => r.json());
    all.push(...data);
  }

  return all.sort((a,b)=>a.num-b.num);
}

/* ---------- GAME START ---------- */
playBtn.onclick = async () => {
  // REQUIRED for audio
  tracks.forEach(a => a.play().catch(()=>{}));

  startScreen.remove();
  gameScreen.style.display = 'block';

  questions = await loadQuestions();
  startTime = Date.now();
  startTimer();
  updateLives();
  showQuestion();
};

/* ---------- TIMER ---------- */
function startTimer() {
  timerInterval = setInterval(() => {
    timerEl.textContent =
      ((Date.now() - startTime) / 1000).toFixed(1) + 's';
  }, 100);
}

/* ---------- LIVES ---------- */
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

/* ---------- VISUAL FEEDBACK ---------- */
function flash(type) {
  document.body.classList.add(type);
  setTimeout(() => document.body.classList.remove(type), 150);
}

function shake() {
  container.classList.remove('shake');
  void container.offsetWidth;
  container.classList.add('shake');
}

/* ---------- QUESTIONS ---------- */
function showQuestion() {
  answersDiv.innerHTML = '';
  const q = questions[index];

  questionText.textContent = q.q;
  questionText.style.animation = 'none';
  void questionText.offsetWidth;
  questionText.style.animation = 'pound 0.4s';

  if (q.type === 'normal') {
    q.options.forEach((opt,i)=>{
      const b = document.createElement('button');
      b.textContent = opt;
      b.onclick = () => {
        if (i === q.answer) {
          flash('correct');
          next();
        } else {
          loseLife();
        }
      };
      answersDiv.appendChild(b);
    });
  }

  if (q.type === 'mini') runMini(q);
}

/* ---------- MINI GAMES ---------- */
function runMini(q) {
  if (q.mini === 'hold') {
    const b = document.createElement('button');
    b.textContent = 'HOLD';
    let t;
    b.onmousedown = () => t = setTimeout(()=>{ flash('correct'); next(); }, q.duration);
    b.onmouseup = () => clearTimeout(t);
    answersDiv.appendChild(b);
  }

  if (q.mini === 'wait') {
    const b = document.createElement('button');
    b.textContent = 'CLICK';
    const appear = Date.now();
    b.onclick = () => {
      Math.abs(Date.now()-appear-q.duration) < 200
        ? (flash('correct'), next())
        : loseLife();
    };
    answersDiv.appendChild(b);
  }

  if (q.mini === 'reverse') {
    ['Correct','Wrong'].forEach(txt=>{
      const b = document.createElement('button');
      b.textContent = txt;
      b.onclick = () =>
        txt === 'Wrong'
          ? (flash('correct'), next())
          : loseLife();
      answersDiv.appendChild(b);
    });
  }
}

/* ---------- NEXT ---------- */
function next() {
  index++;
  showQuestion();
}