// ==================== ELEMENTS ====================
const playBtn = document.getElementById('play-btn');
const usernameInput = document.getElementById('username');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const questionContainer = document.getElementById('question-container');
const questionNumberCorner = document.getElementById('question-number-corner');
const questionText = document.getElementById('question-text');
const answersDiv = document.getElementById('answers');
const timerEl = document.getElementById('timer');
const livesEl = document.getElementById('lives');
const usernameDisplay = document.getElementById('username-display');

// ==================== STATE ====================
let questions = [];
let currentIndex = 0;
let lives = 3;
let startTime;
let timerInterval;
let username = localStorage.getItem('username') || null;

// ==================== MUSIC ====================
const musicFiles = [
  'music/music1.mp3','music/music2.mp3','music/music3.mp3',
  'music/music4.mp3','music/music5.mp3','music/music6.mp3',
  'music/music7.mp3','music/music8.mp3'
];
let musicIndex = 0;
const originalMusicVolume = 0.3;
const bgMusic = new Audio();
bgMusic.volume = originalMusicVolume;

// ==================== SOUND EFFECTS ====================
const sfxCorrect = new Audio(
  'https://actions.google.com/sounds/v1/cartoon/clang.ogg'
);
const sfxWrong = new Audio(
  'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'
);
sfxCorrect.volume = 1.0; // max volume
sfxWrong.volume = 1.0;   // max volume

let sfxPlaying = 0;

// Play SFX at max volume, mute background music
function playSFX(sfx){
    sfxPlaying++;
    bgMusic.volume = 0; // mute music

    sfx.currentTime = 0;
    sfx.play();
    sfx.onended = () => {
        sfxPlaying--;
        if(sfxPlaying <= 0){
            bgMusic.volume = originalMusicVolume; // restore music
        }
    };
}

// ==================== JSONBIN ====================
const BIN_ID = '698280e6d0ea881f409e978f';
const API_KEY = '$2a$10$YENQL1visC/5iaLFbd2rcu3wuHMmYBB5uvPlu.SWdFXD.LBIMIQy6';

// ==================== SHUFFLE ====================
function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ==================== LOAD QUESTIONS ====================
async function loadQuestions(){
  try{
    const res = await fetch('questions.json');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }catch(e){
    alert('Failed to load questions');
    return [];
  }
}

// ==================== USERNAME PREFILL ====================
if(username){
  usernameInput.style.display = 'none';
}

// ==================== START ====================
playBtn.onclick = async () => {
  if(!username){
    const val = usernameInput?.value?.trim();
    if(!val) return alert('Enter username');
    username = val;
    localStorage.setItem('username', username);
  }

  if(startScreen) startScreen.remove();
  if(gameScreen) gameScreen.style.display = 'flex';
  if(usernameDisplay) usernameDisplay.textContent = username;

  questions = await loadQuestions();
  if(!questions.length) return alert('No questions');

  startTime = Date.now();
  startTimer();
  updateLives();
  showQuestion();
  addChangeUsernameButton();

  // Play background music
  musicIndex = 0;
  bgMusic.src = musicFiles[musicIndex];
  bgMusic.play().catch(()=>{});
  bgMusic.onended = () => {
    musicIndex = (musicIndex + 1) % musicFiles.length;
    bgMusic.src = musicFiles[musicIndex];
    bgMusic.play().catch(()=>{});
  };
};

// ==================== TIMER ====================
function startTimer(){
  timerInterval = setInterval(()=>{
    timerEl.textContent =
      ((Date.now() - startTime)/1000).toFixed(1) + 's';
  }, 100);
}

// ==================== LIVES ====================
function updateLives(){
  livesEl.textContent = '❤ '.repeat(lives);
}
function loseLife(){
  playSFX(sfxWrong);
  flash('wrong');
  shake();
  lives--;
  updateLives();
  if(lives <= 0) location.reload();
}

// ==================== FEEDBACK ====================
function flash(type){
  document.body.classList.add(type);
  setTimeout(()=>document.body.classList.remove(type),150);
}
function shake(){
  questionContainer.classList.remove('shake');
  void questionContainer.offsetWidth;
  questionContainer.classList.add('shake');
}

// ==================== QUESTIONS ====================
function showQuestion(){
  if(currentIndex >= questions.length){
    finishQuiz();
    return;
  }

  answersDiv.innerHTML = '';
  const q = questions[currentIndex];

  questionNumberCorner.textContent =
    `${currentIndex + 1} / ${questions.length}`;
  questionText.textContent = q.q;

  const options = shuffle([...q.options]);
  const correctIndex = options.indexOf(q.options[0]);

  options.forEach((opt, i)=>{
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => {
      if(i === correctIndex){
        playSFX(sfxCorrect);
        flash('correct');
        currentIndex++;
        showQuestion();
      } else {
        loseLife();
      }
    };
    answersDiv.appendChild(btn);
  });
}

// ==================== FINISH ====================
function finishQuiz(){
  clearInterval(timerInterval);
  const time = ((Date.now() - startTime)/1000).toFixed(2);

  saveLocalScore(username, time);
  saveScoreToJsonBin(username, time);
  showLeaderboard();
}

// ==================== LOCAL LEADERBOARD ====================
function saveLocalScore(user, time){
  const lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  lb.push({ username: user, time: parseFloat(time) });
  lb.sort((a,b)=>a.time-b.time);
  if(lb.length > 1000) lb.length = 1000;
  localStorage.setItem('leaderboard', JSON.stringify(lb));
}

// ==================== JSONBIN SAVE ====================
async function saveScoreToJsonBin(user, time){
  try{
    const getRes = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
      { headers: { 'X-Master-Key': API_KEY } }
    );
    const json = await getRes.json();
    const data = json.record || { leaderboard: [] };

    data.leaderboard.push({ username: user, time: parseFloat(time) });
    data.leaderboard.sort((a,b)=>a.time-b.time);
    if(data.leaderboard.length > 1000)
      data.leaderboard.length = 1000;

    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(data)
    });
  }catch(e){
    console.error('JSONBin error', e);
  }
}

// ==================== SHOW LEADERBOARD ====================
function showLeaderboard(){
  gameScreen.innerHTML = '<h2>LEADERBOARD</h2>';
  const lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  const ol = document.createElement('ol');
  lb.forEach(e=>{
    const li = document.createElement('li');
    li.textContent = `${e.username} — ${e.time}s`;
    ol.appendChild(li);
  });
  gameScreen.appendChild(ol);
}

// ==================== CHANGE USERNAME BUTTON ====================
function addChangeUsernameButton(){
  const existing = document.getElementById('change-username-btn');
  if(existing) existing.remove();

  const btn = document.createElement('button');
  btn.id = 'change-username-btn';
  btn.textContent = 'Change Username';
  Object.assign(btn.style,{
    position:'fixed',
    bottom:'20px',
    left:'20px',
    width:'120px',
    height:'42px',
    fontSize:'0.9rem',
    zIndex:9999
  });
  btn.onclick = ()=>{
    const n = prompt('New username:', username);
    if(n){
      username = n.trim();
      localStorage.setItem('username', username);
      if(usernameDisplay) usernameDisplay.textContent = username;
    }
  };
  document.body.appendChild(btn);
}