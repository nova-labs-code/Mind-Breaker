// --- Elements ---
const playBtn = document.getElementById('play-btn');
const startScreen = document.getElementById('start-screen');
const usernameInput = document.getElementById('username');
const gameScreen = document.getElementById('game-screen');
const questionContainer = document.getElementById('question-container');
const questionText = document.getElementById('question-text');
const answersDiv = document.getElementById('answers');
const leaderboard = document.getElementById('leaderboard');
const leaderboardList = document.getElementById('leaderboard-list');

// --- Game Variables ---
let questions = [];
let currentIndex = 0;
let startTime;
let music = new Audio('music/music1.mp3');
music.loop = true;

// --- Fetch Questions ---
async function loadQuestions() {
  const resNormal = await fetch('questions/medium.json');
  const normalQs = await resNormal.json();

  const resMini = await fetch('questions/playable.json');
  const miniQs = await resMini.json();

  // Mix normally but fixed order
  questions = [...normalQs, ...miniQs].sort((a,b) => a.num - b.num);
}

// --- Start Quiz ---
playBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  if (!username) return alert('Enter a username');

  // Remove start screen completely
  startScreen.remove();

  // Show game screen
  gameScreen.style.display = 'block';

  // Load questions
  await loadQuestions();

  // Start music
  music.play();

  // Start timer
  startTime = Date.now();

  // Show first question
  showQuestion(username);
});

// --- Show Question ---
function showQuestion(username) {
  if (currentIndex >= questions.length) return endQuiz(username);

  const q = questions[currentIndex];
  questionText.innerText = q.q;

  // Clear previous answers
  answersDiv.innerHTML = '';

  if (q.type === 'normal') {
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.innerText = opt;
      btn.addEventListener('click', () => checkAnswer(i, username));
      answersDiv.appendChild(btn);
    });
  } else if (q.type === 'mini') {
    createMiniGame(q, username);
  }

  // Trigger pound animation
  questionText.style.animation = 'none';
  void questionText.offsetWidth;
  questionText.style.animation = 'pound 0.5s';
}

// --- Check Normal Answer ---
function checkAnswer(selected, username) {
  const q = questions[currentIndex];
  if (selected !== q.answer) {
    alert('Wrong! Reloading...');
    location.reload();
    return;
  }
  currentIndex++;
  showQuestion(username);
}

// --- Mini-games ---
function createMiniGame(q, username) {
  const btn = document.createElement('button');
  btn.className = 'hold-btn';
  btn.innerText = 'Start Mini';
  answersDiv.appendChild(btn);

  if (q.mini === 'hold') {
    btn.addEventListener('mousedown', () => {
      const start = Date.now();
      const endTime = q.duration;
      const mouseUp = () => {
        const held = Date.now() - start;
        if (held >= endTime) {
          currentIndex++;
          showQuestion(username);
        } else {
          alert('Failed! Reloading...');
          location.reload();
        }
        btn.removeEventListener('mouseup', mouseUp);
      };
      btn.addEventListener('mouseup', mouseUp);
    });
  } else if (q.mini === 'wait') {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        currentIndex++;
        showQuestion(username);
      }, q.duration);
    });
  } else if (q.mini === 'avoid') {
    btn.innerText = 'Click the safe button';
    for (let i = 0; i < q.buttons; i++) {
      const b = document.createElement('button');
      b.innerText = `Button ${i+1}`;
      b.addEventListener('click', () => {
        if (i === q.safe) {
          currentIndex++;
          showQuestion(username);
        } else {
          alert('Wrong! Reloading...');
          location.reload();
        }
      });
      answersDiv.appendChild(b);
    }
    btn.remove();
  } else if (q.mini === 'reverse') {
    btn.innerText = "Click 'Wrong' instead";
    btn.addEventListener('click', () => {
      currentIndex++;
      showQuestion(username);
    });
  }
}

// --- End Quiz / Leaderboard ---
function endQuiz(username) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  gameScreen.style.display = 'none';
  leaderboard.style.display = 'flex';

  const li = document.createElement('li');
  li.innerText = `${username} - ${elapsed}s`;
  leaderboardList.appendChild(li);
}