let questions = [];
let index = 0;
let lives = 3;
let startTime;
let timerInterval;
let musicStarted = false;
let bgAudio;
let username;

// choose ONE track or rotate once at start
const bgMusic = "music/music1.mp3";

document.getElementById("start-btn").onclick = async () => {
  username = document.getElementById("username").value.trim();
  if (!username) return;

  document.getElementById("start-screen").hidden = true;
  document.getElementById("game-screen").hidden = false;

  await loadQuestions();
  startTimer();
  showQuestion();
};

async function loadQuestions() {
  const trick = await fetch("questions/trick.json").then(r => r.json());
  questions = trick.sort((a, b) => a.num - b.num);
}

function showQuestion() {
  if (index >= questions.length) return finishGame();

  const q = questions[index];
  const text = document.getElementById("question-text");
  const options = document.getElementById("options");
  const playBtn = document.getElementById("play-audio");

  text.hidden = true;
  options.innerHTML = "";

  playBtn.onclick = () => {
    startMusicOnce();

    text.textContent = q.q;
    text.hidden = false;

    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => handleAnswer(i === q.answer);
      options.appendChild(btn);
    });
  };
}

function startMusicOnce() {
  if (musicStarted) return;

  bgAudio = new Audio(bgMusic);
  bgAudio.loop = true;
  bgAudio.volume = 0.6;
  bgAudio.play();

  musicStarted = true;
}

function handleAnswer(correct) {
  if (!correct) {
    lives--;
    updateLives();
    if (lives <= 0) resetGame();
  } else {
    index++;
    showQuestion();
  }
}

function updateLives() {
  document.getElementById("lives").textContent = "❤️".repeat(lives);
}

function resetGame() {
  index = 0;
  lives = 3;
  updateLives();
  startTime = Date.now();
  showQuestion();
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const t = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").textContent =
      `${String(Math.floor(t / 60)).padStart(2,"0")}:${String(t % 60).padStart(2,"0")}`;
  }, 1000);
}

function finishGame() {
  clearInterval(timerInterval);
  const time = Math.floor((Date.now() - startTime) / 1000);
  saveWinner(username, time);

  document.getElementById("game-screen").hidden = true;
  document.getElementById("leaderboard").hidden = false;
  renderLeaderboard();
}