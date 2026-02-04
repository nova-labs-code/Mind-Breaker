let questions = [];
let current = 0;
let lives = 3;
let startTime;
let username;
let leaderboard = [];
let timerInterval;
let bgAudio;
let audioIndex = 1;
const totalTracks = 8; // music1 through music8

// Load all JSON question files
async function loadQuestions() {
  const medium = await fetch('questions/medium.json').then(r => r.json());
  const hard = await fetch('questions/hard.json').then(r => r.json());
  const trick = await fetch('questions/trick.json').then(r => r.json());
  const playable = await fetch('questions/playable.json').then(r => r.json());

  questions = [...medium, ...trick, ...playable, ...hard];
  questions.sort((a,b) => a.num - b.num); // keep fixed order
}

// Start the quiz
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

// Lives display
function updateLives() {
  document.getElementById('lives').textContent = '❤️'.repeat(lives);
}

// Timer display
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

// Show current question
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

  // Normal, trick, hard questions
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(i);
    answersDiv.appendChild(btn);
  });
}

// Check answer for normal questions
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

// End quiz and show leaderboard
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

// Background audio looping through music1 → music8
function playBackgroundAudio() {
  if (bgAudio) return; // already playing

  bgAudio = new Audio(`music/music${audioIndex}.mp3`);
  bgAudio.volume = 0.5;
  bgAudio.play();

  bgAudio.onended = () => {
    audioIndex++;
    if (audioIndex > totalTracks) audioIndex = 1;
    bgAudio.src = `music/music${audioIndex}.mp3`;
    bgAudio.play();
  };
}

// Start button
document.getElementById('start-btn').onclick = startQuiz;

// Play audio button
document.getElementById('play-audio-btn').onclick = playBackgroundAudio;

// Credits button
document.getElementById('credits-btn').onclick = () => alert('EWS - Founder');

// Initialize
loadQuestions();
updateLives();