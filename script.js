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

let questions = [];
let currentIndex = 0;
let lives = 3;
let startTime;
let timerInterval;
let username;

// Sequential music files
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
let musicIndex = 0;
let bgMusic = new Audio();
bgMusic.loop = false;
bgMusic.volume = 0.3;

// ==================== SHUFFLE UTILITY ====================
function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
}

// ==================== LOAD QUESTIONS ====================
async function loadQuestions(){
    try{
        const data = await fetch('questions.json').then(r=>r.json());
        if(!Array.isArray(data)) return [];
        data.sort((a,b)=>a.num-b.num);
        return data;
    }catch(e){
        console.warn("Failed to load questions.json", e);
        return [];
    }
}

// ==================== START QUIZ ====================
playBtn.onclick = async () => {
    username = usernameInput.value.trim();
    if(!username) return alert("Enter username!");

    startScreen.style.transition='opacity 0.5s';
    startScreen.style.opacity=0;
    setTimeout(()=>startScreen.remove(),500);
    gameScreen.style.display='flex';

    questions = await loadQuestions();
    if(!questions.length) return alert("No questions loaded!");

    startTime = Date.now();
    startTimer();
    updateLives();
    showQuestion();

    musicIndex = 0;
    bgMusic.src = musicFiles[musicIndex];
    bgMusic.play().catch(e=>console.warn("Music failed to play:", e));

    bgMusic.onended = () => {
        musicIndex = (musicIndex + 1) % musicFiles.length;
        bgMusic.src = musicFiles[musicIndex];
        bgMusic.play().catch(e=>console.warn("Music failed to play:", e));
    };
};

// ==================== TIMER ====================
function startTimer(){
    timerInterval = setInterval(()=>{
        timerEl.textContent = ((Date.now()-startTime)/1000).toFixed(1)+'s';
    },100);
}

// ==================== LIVES ====================
function updateLives(){ livesEl.textContent='❤ '.repeat(lives); }
function loseLife(){ flash('wrong'); shake(); lives--; updateLives(); if(lives<=0) location.reload(); }

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
    if(currentIndex >= questions.length){ finishQuiz(); return; }

    answersDiv.innerHTML='';
    const q = questions[currentIndex];

    questionNumberCorner.textContent=`${currentIndex+1} / ${questions.length}`;
    questionText.textContent=q.q;
    questionText.style.animation='none'; void questionText.offsetWidth;
    questionText.style.animation='pound 0.4s';

    // Shuffle options and track correct answer
    const shuffledOptions = shuffle([...q.options]);
    const correctIndex = shuffledOptions.indexOf(q.options[q.answer]);

    shuffledOptions.forEach((opt,i)=>{
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.onclick = () => {
            if(i === correctIndex){
                flash('correct');
                nextQuestion();
            } else {
                loseLife();
            }
        };
        answersDiv.appendChild(btn);
    });
}

function nextQuestion(){ currentIndex++; showQuestion(); }

// ==================== FINISH QUIZ ====================
function finishQuiz(){
    clearInterval(timerInterval);
    const timeTaken=((Date.now()-startTime)/1000).toFixed(2);
    saveScore(username,timeTaken);
    showLeaderboard();
}

// ==================== LEADERBOARD ====================
function saveScore(user,time){
    const lb=JSON.parse(localStorage.getItem('leaderboard')||'[]');
    let name=user;
    const dup=lb.filter(e=>e.username.startsWith(user)).length;
    if(dup>0) name=user+'#'+(dup+1);
    lb.push({username:name,time:parseFloat(time)});
    lb.sort((a,b)=>a.time-b.time);
    if(lb.length>1000) lb.length=1000;
    localStorage.setItem('leaderboard',JSON.stringify(lb));
}

function showLeaderboard(){
    gameScreen.innerHTML='<h2>LEADERBOARD</h2>';
    const lb=JSON.parse(localStorage.getItem('leaderboard')||'[]');
    const ol=document.createElement('ol');
    ol.style.color='yellow';
    ol.style.fontSize='1rem';
    ol.style.maxHeight='80vh';
    ol.style.overflowY='auto';
    ol.style.padding='0 1rem';
    lb.forEach(entry=>{
        const li=document.createElement('li');
        li.textContent=`${entry.username} — ${entry.time}s`;
        ol.appendChild(li);
    });
    gameScreen.appendChild(ol);
}