const playBtn = document.getElementById("play-btn");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");

const questionText = document.getElementById("question-text");
const answers = document.getElementById("answers");
const livesEl = document.getElementById("lives");
const timerEl = document.getElementById("timer");

let questions = [];
let index = 0;
let lives = 3;
let startTime;
let timerInterval;

/* AUDIO LOOP 1–8 */
const tracks = Array.from({ length: 8 }, (_, i) => `music/music${i + 1}.mp3`);
let trackIndex = 0;
const audio = new Audio(tracks[0]);
audio.addEventListener("ended", () => {
  trackIndex = (trackIndex + 1) % tracks.length;
  audio.src = tracks[trackIndex];
  audio.play();
});

/* LOAD QUESTIONS */
async function loadQuestions() {
  const files = [
    "questions/medium.json",
    "questions/hard.json",
    "questions/trick.json",
    "questions/playable.json"
  ];

  for (const file of files) {
    const res = await fetch(file);
    if (!res.ok) throw new Error(file);
    const data = await res.json();
    questions.push(...data);
  }

  questions.sort((a, b) => a.num - b.num);
}

/* START */
playBtn.onclick = async () => {
  startScreen.remove();
  gameScreen.hidden = false;

  await loadQuestions();

  audio.play();
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 100);

  updateLives();
  showQuestion();
};

/* TIMER */
function updateTimer() {
  timerEl.textContent =
    ((Date.now() - startTime) / 1000).toFixed(2) + "s";
}

/* LIVES */
function updateLives() {
  livesEl.textContent = "❤️".repeat(lives);
}

function fail() {
  lives--;
  updateLives();
  if (lives <= 0) location.reload();
  else showQuestion();
}

/* QUESTIONS */
function showQuestion() {
  answers.innerHTML = "";
  const q = questions[index];

  questionText.textContent = q.q;
  questionText.style.animation = "none";
  void questionText.offsetWidth;
  questionText.style.animation = "pound 0.4s";

  if (q.type === "normal") {
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => (i === q.answer ? next() : fail());
      answers.appendChild(btn);
    });
  }

  if (q.type === "mini") runMini(q);
}

/* MINI GAMES */
function runMini(q) {
  if (q.mini === "hold") {
    const btn = document.createElement("button");
    btn.textContent = "Hold";
    answers.appendChild(btn);

    let start;
    btn.onmousedown = () => (start = Date.now());
    btn.onmouseup = () =>
      Date.now() - start >= q.duration ? next() : fail();
  }

  if (q.mini === "wait") {
    const btn = document.createElement("button");
    btn.textContent = "Click";
    answers.appendChild(btn);

    const shown = Date.now();
    btn.onclick = () =>
      Math.abs(Date.now() - shown - q.duration) < 200
        ? next()
        : fail();
  }

  if (q.mini === "avoid") {
    for (let i = 0; i < q.buttons; i++) {
      const b = document.createElement("button");
      b.textContent = "Button";
      b.onclick = () => (i === q.safe ? next() : fail());
      answers.appendChild(b);
    }
  }

  if (q.mini === "reverse") {
    const btn = document.createElement("button");
    btn.textContent = "Wrong";
    btn.onclick = next;
    answers.appendChild(btn);
  }
}

/* NEXT */
function next() {
  index++;
  if (index >= questions.length) location.reload();
  else showQuestion();
}