document.addEventListener('DOMContentLoaded', () => {
  let questions = [];
  let current = 0;
  let lives = 3;
  let startTime;
  let username;
  let leaderboard = [];
  let timerInterval;
  let bgAudio;
  let audioIndex = 1;
  const totalTracks = 8;

  const startBtn = document.getElementById('start-btn');
  const questionText = document.getElementById('question-text');
  const answersDiv = document.getElementById('answers');
  const livesDiv = document.getElementById('lives');
  const timerDiv = document.getElementById('timer');
  const startScreen = document.getElementById('start-screen');
  const gameScreen = document.getElementById('game-screen');
  const leaderboardDiv = document.getElementById('leaderboard');
  const leaderboardList = document.getElementById('leaderboard-list');

  // Load all question JSONs
  async function loadQuestions() {
    try {
      const medium = await fetch('questions/medium.json').then(r => r.json());
      const hard = await fetch('questions/hard.json').then(r => r.json());
      const trick = await fetch('questions/trick.json').then(r => r.json());
      const playable = await fetch('questions/playable.json').then(r => r.json());
      questions = [...medium, ...trick, ...playable, ...hard];
      questions.sort((a, b) => a.num - b.num);

      // Enable start button after loading
      startBtn.disabled = false;
      startBtn.textContent = "Start Quiz";
    } catch (err) {
      console.error("Error loading questions:", err);
      startBtn.textContent = "Failed to Load Questions";
    }
  }

  function startQuiz() {
    username = document.getElementById('username').value.trim();
    if (!username) { alert('Enter a username'); return; }

    let count = leaderboard.filter(l => l.name.startsWith(username)).length;
    username = count ? `${username}#${count+1}` : username;

    startScreen.hidden = true;
    gameScreen.hidden = false;

    startTime = Date.now();
    updateLives();
    startTimer();
    showQuestion();
    playBackgroundAudio();
  }

  function updateLives() { livesDiv.textContent = '❤️'.repeat(lives); }

  function startTimer() {
    timerInterval = setInterval(() => {
      const elapsed = ((Date.now() - startTime)/1000).toFixed(2);
      timerDiv.textContent = `Time: ${elapsed}s`;
    }, 100);
  }

  function stopTimer() { clearInterval(timerInterval); }

  function showQuestion() {
    if (current >= questions.length) return endQuiz();
    const q = questions[current];

    questionText.hidden = false;
    questionText.style.opacity = 0; // fade in
    questionText.textContent = q.q || "No question";
    setTimeout(() => { questionText.style.opacity = 1; }, 50);

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
        alert('Game Over!');
        location.reload();
      }
    }
  }

  function endQuiz() {
    stopTimer();
    const totalTime = ((Date.now() - startTime)/1000).toFixed(2);
    leaderboard.push({name: username, time: totalTime});
    leaderboard.sort((a,b) => a.time - b.time);

    gameScreen.hidden = true;
    leaderboardList.innerHTML = '';
    leaderboard.slice(0,100).forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.name} - ${entry.time}s`;
      leaderboardList.appendChild(li);
    });
    leaderboardDiv.hidden = false;
  }

  function playBackgroundAudio() {
    if (bgAudio && !bgAudio.paused) return;
    bgAudio = new Audio(`music/music${audioIndex}.mp3`);
    bgAudio.volume = 0.5;
    bgAudio.play().catch(e => console.log('Audio blocked:', e));
    bgAudio.onended = () => {
      audioIndex++;
      if (audioIndex > totalTracks) audioIndex = 1;
      bgAudio.src = `music/music${audioIndex}.mp3`;
      bgAudio.play().catch(e => console.log('Audio blocked:', e));
    };
  }

  startBtn.onclick = startQuiz;
  loadQuestions();
  updateLives();
});