const playBtn = document.getElementById('play-btn');
const startScreen = document.getElementById('start-screen');
const usernameInput = document.getElementById('username');
const gameScreen = document.getElementById('game-screen');
const questionText = document.getElementById('question-text');
const answersDiv = document.getElementById('answers');
const leaderboard = document.getElementById('leaderboard');
const leaderboardList = document.getElementById('leaderboard-list');
const loadingDiv = document.getElementById('loading');
const timerDiv = document.getElementById('timer');

let questions = [];
let currentIndex = 0;
let startTime;
let timerInterval;

// --- Music Playlist ---
const musicFiles = [
  'music/music1.mp3',
  'music/music2.mp3',
  'music/music3.mp3',
  'music/music4.mp3',
  'music/music5.mp3',
  'music/music6.mp3',
  'music/music7.mp3',
  'music/music8.mp3'
];
let currentTrack = 0;
let music = new Audio(musicFiles[currentTrack]);

music.addEventListener('ended', ()=>{
  currentTrack = (currentTrack+1)%musicFiles.length;
  music.src = musicFiles[currentTrack];
  music.play();
});

// --- Load JSON Questions ---
async function loadQuestions() {
  try {
    loadingDiv.style.display = 'block';
    const paths = ['questions/medium.json','questions/hard.json','questions/trick.json','questions/playable.json'];
    const allQuestions = [];
    for(const path of paths){
      const res = await fetch(path);
      if(!res.ok) throw new Error(`${path} not found`);
      const qs = await res.json();
      allQuestions.push(...qs);
    }
    questions = allQuestions.sort((a,b)=>a.num-b.num);
    loadingDiv.style.display = 'none';
  } catch(err){
    console.error(err);
    questionText.innerText = 'Failed to load questions. Check console.';
  }
}

// --- Start Quiz ---
playBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  if(!username) return alert('Enter username');

  startScreen.remove();
  gameScreen.style.display = 'block';
  await loadQuestions();

  music.play(); 
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 100);
  showQuestion(username);
});

// --- Timer ---
function updateTimer(){
  const elapsed = ((Date.now() - startTime)/1000).toFixed(2);
  timerDiv.innerText = `Time: ${elapsed}s`;
}

// --- Show Question ---
function showQuestion(username){
  if(currentIndex >= questions.length) return endQuiz(username);

  const q = questions[currentIndex];
  questionText.innerText = q.q;
  answersDiv.innerHTML = '';

  if(q.type==='normal'){
    q.options.forEach((opt,i)=>{
      const btn = document.createElement('button');
      btn.innerText = opt;
      btn.addEventListener('click', ()=>checkAnswer(i,username));
      answersDiv.appendChild(btn);
    });
  } else if(q.type==='mini'){
    createMiniGame(q,username);
  }

  questionText.style.animation = 'none';
  void questionText.offsetWidth;
  questionText.style.animation = 'pound 0.5s';
}

// --- Check Normal Answer ---
function checkAnswer(selected, username){
  const q = questions[currentIndex];
  if(selected !== q.answer){
    location.reload();
    return;
  }
  currentIndex++;
  showQuestion(username);
}

// --- Mini-games ---
function createMiniGame(q, username){
  answersDiv.innerHTML = '';
  if(q.mini==='hold'){
    const btn = document.createElement('button');
    btn.className='hold-btn';
    btn.innerText='Hold me';
    answersDiv.appendChild(btn);

    btn.addEventListener('mousedown', ()=>{
      const start = Date.now();
      const mouseUp = ()=>{
        const held = Date.now()-start;
        if(held >= q.duration){
          currentIndex++;
          showQuestion(username);
        } else location.reload();
        btn.removeEventListener('mouseup', mouseUp);
      };
      btn.addEventListener('mouseup', mouseUp);
    });

  } else if(q.mini==='wait'){
    const btn = document.createElement('button');
    btn.className='hold-btn';
    btn.innerText='Click at the right time';
    answersDiv.appendChild(btn);

    btn.addEventListener('click', ()=>{
      setTimeout(()=>{
        currentIndex++;
        showQuestion(username);
      }, q.duration);
    });

  } else if(q.mini==='avoid'){
    for(let i=0;i<q.buttons;i++){
      const b = document.createElement('button');
      b.innerText=`Button ${i+1}`;
      b.addEventListener('click',()=>{
        if(i===q.safe){
          currentIndex++;
          showQuestion(username);
        } else location.reload();
      });
      answersDiv.appendChild(b);
    }

  } else if(q.mini==='reverse'){
    const btn = document.createElement('button');
    btn.className='hold-btn';
    btn.innerText="Click 'Wrong'";
    answersDiv.appendChild(btn);

    btn.addEventListener('click', ()=>{
      currentIndex++;
      showQuestion(username);
    });
  }
}

// --- End Quiz / Leaderboard ---
function endQuiz(username){
  clearInterval(timerInterval);
  const elapsed = ((Date.now()-startTime)/1000).toFixed(2);
  gameScreen.style.display='none';
  leaderboard.style.display='flex';

  const li = document.createElement('li');
  li.innerText = `${username} - ${elapsed}s`;
  leaderboardList.appendChild(li);
}