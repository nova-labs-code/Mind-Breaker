let questions = [];
let current = 0;
let lives = 3;
let startTime;
let username;
let leaderboard = [];
let timerInterval;
let bgAudio;

async function loadQuestions() {
  const medium = await fetch('questions/medium.json').then(r => r.json());
  const hard = await fetch('questions/hard.json').then(r => r.json());
  const trick = await fetch('questions/trick.json').then(r => r.json());
  const playable = await fetch('questions/playable.json').then(r => r.json());

  questions = [...medium, ...trick, ...playable, ...hard];
  questions.sort((a, b) => a.num - b.num);
}

function startQuiz() {
  username = document.getElementById('username').value.trim();
  if (!username) { alert('Enter a username'); return; }

  // Make unique username
  let count = leaderboard.filter(l => l.name.startsWith(username)).length;
  username = count ? `${username}#${count+1}` : username;

  document.getElementById('start-screen').hidden = true;
  document.getElementById('game-screen').hidden = false;

  startTime = Date.now();
  updateLives();
  startTimer();
  showQuestion();
  playBackgroundAudio();
}

function updateLives() {
  document.getElementById('lives').textContent = '❤️'.repeat(lives);
}

function startTimer() {
  const timerElem = document.getElementById('timer');
  timerInterval = setInterval(() => {
    const elapsed = ((Date.now() - startTime)/1000).toFixed(2);
    timerElem.textContent = `Time: ${elapsed}s`;
  }, 100);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function showQuestion() {
  if (current >= questions.length) return endQuiz();

  const q = questions[current];
  const questionText = document.getElementById('question-text');
  const answersDiv = document.getElementById('answers');
  questionText.hidden = false;
  answersDiv.innerHTML = '';

  if (q.type === 'playable') {
    runMiniGame(q);
    return;
  }

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(i);
    answersDiv.appendChild(btn);
  });
}

function checkAnswer(selected) {
  const q = questions[current];
  if (selected === q.answer) {
    current++;
    showQuestion();
  } else {
    lives--;
    updateLives();
    if (lives <= 0) {
      alert('Game Over! Try again.');
      location.reload();
    }
  }
}

function endQuiz() {
  stopTimer();
  const totalTime = ((Date.now() - startTime)/1000).toFixed(2);
  leaderboard.push({name: username, time: totalTime});
  leaderboard.sort((a,b)=>a.time-b.time);

  document.getElementById('game-screen').hidden = true;
  const lb = document.getElementById('leaderboard');
  const lbList = document.getElementById('leaderboard-list');
  lbList.innerHTML = '';
  leaderboard.slice(0,100).forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} - ${entry.time}s`;
    lbList.appendChild(li);
  });
  lb.hidden = false;
}

function playBackgroundAudio() {
  if (bgAudio) return; // already playing
  bgAudio = new Audio('music/music1.mp3'); // replace with your first track
  bgAudio.loop = true;
  bgAudio.volume = 0.5;
  bgAudio.play();
}

// Start button
document.getElementById('start-btn').onclick = startQuiz;

// Play audio button
document.getElementById('play-audio-btn').onclick = playBackgroundAudio;

// Credits button
document.getElementById('credits-btn').onclick = () => alert('EWS - Founder');

// Initialize
loadQuestions();