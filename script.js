/* ==================== ELEMENTS ==================== */
const playBtn = document.getElementById('play-btn');
const usernameInput = document.getElementById('username');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const questionContainer = document.getElementById('question-container');
const questionText = document.getElementById('question-text');
const answersDiv = document.getElementById('answers');
const timerEl = document.getElementById('timer');
const livesEl = document.getElementById('lives');

let questions = [];
let index = 0;
let lives = 3;
let startTime;
let timerInterval;
let username;

/* ==================== AUDIO ==================== */
const tracks = [];
let currentTrack = 0;
for (let i = 1; i <= 8; i++) {
  const audio = new Audio(`music/music${i}.mp3`);
  audio.volume = 0.5;
  audio.addEventListener('ended', () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    playMusic();
  });
  tracks.push(audio);
}

function playMusic() {
  tracks.forEach(t => { t.pause(); t.currentTime = 0; });
  tracks[currentTrack].play().catch(()=>{});
}

/* ==================== LOAD QUESTIONS ==================== */
async function loadQuestions() {
  const files = ['medium','hard','trick','playable'];
  let all = [];
  for (const f of files) {
    const data = await fetch(`questions/${f}.json`).then(r=>r.json());
    all.push(...data);
  }
  return all.sort((a,b)=>a.num-b.num);
}

/* ==================== START QUIZ ==================== */
playBtn.onclick = async () => {
  username = usernameInput.value.trim();
  if (!username) return alert("Please enter a username!");
  
  playMusic();
  startScreen.remove();
  gameScreen.style.display = 'flex';
  
  questions = await loadQuestions();
  startTime = Date.now();
  startTimer();
  updateLives();
  showQuestion();
};

/* ==================== TIMER ==================== */
function startTimer() {
  timerInterval = setInterval(() => {
    timerEl.textContent = ((Date.now() - startTime)/1000).toFixed(1)+'s';
  }, 100);
}

/* ==================== LIVES ==================== */
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

/* ==================== VISUAL FEEDBACK ==================== */
function flash(type) {
  document.body.classList.add(type);
  setTimeout(()=>document.body.classList.remove(type),150);
}

function shake() {
  questionContainer.classList.remove('shake');
  void questionContainer.offsetWidth;
  questionContainer.classList.add('shake');
}

/* ==================== QUESTIONS ==================== */
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

/* ==================== NORMAL ==================== */
function renderNormal(q) {
  answersDiv.style.position='relative';
  answersDiv.style.display='flex';
  answersDiv.style.flexWrap='wrap';
  answersDiv.style.justifyContent='center';
  answersDiv.style.alignItems='center';
  answersDiv.style.gap='10px';
  answersDiv.style.minHeight='150px';
  
  q.options.forEach((opt,i)=>{
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.style.padding='1rem 2rem';
    btn.style.fontFamily='Press Start 2P, monospace';
    btn.style.fontSize='1.2rem';
    btn.style.background='yellow';
    btn.style.color='black';
    btn.style.border='2px solid white';
    btn.onclick = ()=>{
      if (i === q.answer) flash('correct'), next();
      else loseLife();
    };
    answersDiv.appendChild(btn);
  });
}

/* ==================== MINI GAMES ==================== */
function renderMini(q) {
  answersDiv.innerHTML = '';
  answersDiv.style.position='relative';
  answersDiv.style.minHeight='250px';
  answersDiv.style.display='flex';
  answersDiv.style.flexWrap='wrap';
  answersDiv.style.justifyContent='center';
  answersDiv.style.alignItems='center';
  answersDiv.style.gap='10px';
  
  const makeBtn = (text, clickHandler) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.padding = '1rem 2rem';
    btn.style.fontFamily = 'Press Start 2P, monospace';
    btn.style.fontSize = '1.2rem';
    btn.style.background = 'yellow';
    btn.style.color = 'black';
    btn.style.border = '2px solid white';
    btn.style.cursor = 'pointer';
    btn.onclick = clickHandler;
    answersDiv.appendChild(btn);
    return btn;
  }
  
  // Hold mini
  if (q.mini==='hold'){
    const btn = makeBtn('HOLD', ()=>{});
    let timer;
    btn.onmousedown = () => timer = setTimeout(()=>{flash('correct'); next();}, q.duration);
    btn.onmouseup = btn.onmouseleave = ()=>clearTimeout(timer);
  }

  // Wait mini
  if (q.mini==='wait'){
    const btn = makeBtn('CLICK', ()=>{});
    const start = Date.now();
    btn.onclick = ()=>Math.abs(Date.now()-start-q.duration)<200 ? (flash('correct'), next()) : loseLife();
  }

  // Reverse mini
  if (q.mini==='reverse'){
    makeBtn('Correct', ()=>loseLife());
    makeBtn('Wrong', ()=>{flash('correct'); next();});
  }

  // Reverse-wait mini
  if (q.mini==='reverse-wait'){
    const btn = makeBtn('CLICK', ()=>{});
    const start = Date.now();
    btn.onclick = ()=>Math.abs(Date.now()-start-q.duration)<200 ? (flash('correct'), next()) : loseLife();
  }

  // Avoid mini
  if (q.mini==='avoid'){
    for(let i=1;i<=q.buttons;i++){
      makeBtn('Button '+i, ()=> i===q.safe ? (flash('correct'), next()) : loseLife());
    }
  }

  // Hold-move mini
  if (q.mini==='hold-move'){
    const btn = makeBtn('HOLD', ()=>{});
    btn.style.position='absolute';
    const move = ()=>{btn.style.left=Math.random()*(answersDiv.clientWidth-100)+'px'; btn.style.top=Math.random()*(answersDiv.clientHeight-50)+'px';};
    const interval = setInterval(move,100);
    let timer;
    btn.onmousedown = ()=>timer = setTimeout(()=>{clearInterval(interval); flash('correct'); next();}, q.duration);
    btn.onmouseup = btn.onmouseleave = ()=>clearTimeout(timer);
    move();
  }

  // Avoid-move mini
  if (q.mini==='avoid-move'){
    for(let i=1;i<=q.buttons;i++){
      const btn = makeBtn('Button '+i, ()=> i===q.safe ? (flash('correct'), next()) : loseLife());
      btn.style.position='absolute';
      const move = ()=>{btn.style.left=Math.random()*(answersDiv.clientWidth-100)+'px'; btn.style.top=Math.random()*(answersDiv.clientHeight-50)+'px';};
      setInterval(move,150);
      move();
    }
  }
}

/* ==================== NEXT ==================== */
function next() {
  index++;
  if(index>=questions.length) finishQuiz();
  else showQuestion();
}

/* ==================== FINISH / LEADERBOARD ==================== */
function finishQuiz() {
  clearInterval(timerInterval);
  const timeTaken=((Date.now()-startTime)/1000).toFixed(2);
  saveScore(username, timeTaken);
  showLeaderboard();
}

function saveScore(user,time){
  const lb=JSON.parse(localStorage.getItem('leaderboard')||'[]');
  let name=user;
  let dup=lb.filter(e=>e.username.startsWith(user)).length;
  if(dup>0) name=user+'#'+(dup+1);
  lb.push({username:name, time:parseFloat(time)});
  lb.sort((a,b)=>a.time-b.time);
  if(lb.length>1000) lb.length=1000;
  localStorage.setItem('leaderboard', JSON.stringify(lb));
}

function showLeaderboard(){
  gameScreen.innerHTML='<h2>LEADERBOARD</h2>';
  const lb=JSON.parse(localStorage.getItem('leaderboard')||'[]');
  const table=document.createElement('ol');
  table.style.color='yellow';
  table.style.fontSize='1rem';
  table.style.maxHeight='80vh';
  table.style.overflowY='auto';
  table.style.padding='0 1rem';
  lb.forEach(entry=>{
    const li=document.createElement('li');
    li.textContent=`${entry.username} — ${entry.time}s`;
    table.appendChild(li);
  });
  gameScreen.appendChild(table);
}