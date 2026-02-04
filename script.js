document.addEventListener('DOMContentLoaded', () => {

  // ======================
  // VARIABLES
  // ======================
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

  // DOM ELEMENTS
  const playBtn = document.getElementById('play-btn');
  const questionText = document.getElementById('question-text');
  const answersDiv = document.getElementById('answers');
  const livesDiv = document.getElementById('lives');
  const timerDiv = document.getElementById('timer');
  const startScreen = document.getElementById('start-screen');
  const gameScreen = document.getElementById('game-screen');
  const leaderboardDiv = document.getElementById('leaderboard');
  const leaderboardList = document.getElementById('leaderboard-list');

  // ======================
  // LOAD QUESTIONS
  // ======================
  async function loadQuestions() {
    try {
      const medium = await fetch('questions/medium.json').then(r => r.json());
      const hard = await fetch('questions/hard.json').then(r => r.json());
      const trick = await fetch('questions/trick.json').then(r => r.json());
      const playable = await fetch('questions/playable.json').then(r => r.json());
      questions = [...medium, ...trick, ...playable, ...hard];
      questions.sort((a,b) => a.num - b.num); // fixed order
      playBtn.disabled = false;
      playBtn.textContent = "Play!";
    } catch (err) {
      console.error("Error loading questions:", err);
      playBtn.textContent = "Failed to load";
    }
  }

  // ======================
  // START GAME
  // ======================
  function startGame() {
    username = document.getElementById('username').value.trim();
    if (!username) { alert("Enter a username!"); return; }

    // Ensure unique username
    let count = leaderboard.filter(l => l.name.startsWith(username)).length;
    username = count ? `${username}#${count+1}` : username;

    startScreen.hidden = true;
    gameScreen.hidden = false;

    lives = 3;
    current = 0;
    startTime = Date.now();
    updateLives();
    startTimer();

    playBackgroundAudio();
    showQuestion();
  }

  // ======================
  // TIMER & LIVES
  // ======================
  function updateLives() {
    livesDiv.textContent = '❤️'.repeat(lives);
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      const elapsed = ((Date.now() - startTime)/1000).toFixed(2);
      timerDiv.textContent = `Time: ${elapsed}s`;
    }, 100);
  }

  function stopTimer() { clearInterval(timerInterval); }

  // ======================
  // SHOW QUESTION
  // ======================
  function showQuestion() {
    if (current >= questions.length) return endQuiz();
    const q = questions[current];

    // Fade-in effect
    questionText.style.opacity = 0;
    setTimeout(() => { questionText.textContent = q.q; questionText.style.opacity = 1; }, 50);

    answersDiv.innerHTML = '';

    if (q.type === 'mini') { 
      runMiniGame(q); 
      return; 
    }

    // Normal options
    q.options.forEach((opt,i) => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.onclick = () => checkAnswer(i);
      answersDiv.appendChild(btn);
    });
  }

  // ======================
  // CHECK ANSWER
  // ======================
  function checkAnswer(selected) {
    const q = questions[current];
    if (selected === q.answer) {
      current++;
      showQuestion();
    } else {
      lives--;
      updateLives();
      if (lives <= 0) { alert("Game Over!"); location.reload(); }
    }
  }

  // ======================
  // END QUIZ & LEADERBOARD
  // ======================
  function endQuiz() {
    stopTimer();
    const totalTime = ((Date.now() - startTime)/1000).toFixed(2);
    leaderboard.push({name: username, time: totalTime});
    leaderboard.sort((a,b) => a.time - b.time);

    gameScreen.hidden = true;
    leaderboardDiv.hidden = false;

    leaderboardList.innerHTML = '';
    leaderboard.slice(0,100).forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.name} - ${entry.time}s`;
      leaderboardList.appendChild(li);
    });
  }

  // ======================
  // BACKGROUND MUSIC LOOP
  // ======================
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

  // ======================
  // MINI-GAME HANDLER
  // ======================
  function runMiniGame(q) {
    answersDiv.innerHTML = '';
    let btn = document.createElement('button');
    btn.textContent = "Start Mini-Game";
    btn.classList.add('hold-btn');
    answersDiv.appendChild(btn);

    if (q.mini === 'hold') {
      let holding = false;
      btn.onmousedown = () => { holding = true; setTimeout(() => {
        if (holding) { current++; showQuestion(); }
      }, q.duration); };
      btn.onmouseup = () => { holding = false; lives--; updateLives(); if(lives<=0){alert("Game Over"); location.reload();} };
    }
    else if (q.mini === 'wait') {
      btn.onclick = () => {
        const elapsed = performance.now() - startTime;
        if (elapsed >= q.duration-200 && elapsed <= q.duration+200) { current++; showQuestion(); }
        else { lives--; updateLives(); if(lives<=0){alert("Game Over"); location.reload();} }
      };
    }
    else if (q.mini === 'avoid') {
      // Example: Click safe button among multiple buttons
      for (let i=1;i<=q.buttons;i++){
        let b = document.createElement('button');
        b.textContent = `Button ${i}`;
        b.onclick = () => {
          if (i===q.safe){ current++; showQuestion(); }
          else { lives--; updateLives(); if(lives<=0){alert("Game Over"); location.reload();} }
        };
        answersDiv.appendChild(b);
      }
    }
    else {
      // fallback
      btn.onclick = () => { current++; showQuestion(); };
    }
  }

  // ======================
  // INIT
  // ======================
  playBtn.addEventListener('click', startGame);
  loadQuestions();
  updateLives();

});
