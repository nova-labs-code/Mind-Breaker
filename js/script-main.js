let questions=[], index=0, lives=3, startTime, timerInterval, username;
let musicStarted=false, bgAudio;
const bgTrack=`music/music${Math.floor(Math.random()*8)+1}.mp3`;

document.getElementById("start-btn").onclick=async()=>{
  username=document.getElementById("username").value.trim();
  if(!username) return;
  document.getElementById("start-screen").hidden=true;
  document.getElementById("game-screen").hidden=false;
  await loadAllQuestions();
  startTimer();
  showQuestion();
};

async function loadAllQuestions(){
  const normal=await fetch("questions/normal.json").then(r=>r.json());
  const trick=await fetch("questions/trick.json").then(r=>r.json());
  const mini=await fetch("questions/mini.json").then(r=>r.json());
  const hard=await fetch("questions/hard.json").then(r=>r.json());
  questions=[...normal,...trick,...mini,...hard].sort((a,b)=>a.num-b.num);
}

function startMusicOnce(){
  if(musicStarted) return;
  bgAudio=new Audio(bgTrack);
  bgAudio.loop=true;
  bgAudio.volume=0.6;
  bgAudio.play();
  musicStarted=true;
}

function showQuestion(){
  if(index>=questions.length) return finishGame();
  const q=questions[index];
  const text=document.getElementById("question-text");
  const answers=document.getElementById("answers");
  const playBtn=document.getElementById("play-btn");
  text.hidden=true;
  clearElement(answers);
  playBtn.onclick=()=>{
    startMusicOnce();
    text.textContent=q.text||q.q;
    text.hidden=false;
    if(q.type==="mini") runMiniGame(q,nextQuestion,wrongAnswer);
    else q.options.forEach((opt,i)=>{
      const b=document.createElement("button");
      b.textContent=opt;
      b.onclick=()=> i===q.answer?nextQuestion():wrongAnswer();
      answers.appendChild(b);
    });
  };
}

function nextQuestion(){index++;showQuestion();}
function wrongAnswer(){lives--;updateLives();if(lives<=0) resetGame();}
function updateLives(){document.getElementById("lives").textContent="❤️".repeat(lives);}
function resetGame(){index=0;lives=3;updateLives();startTime=Date.now();showQuestion();}
function startTimer(){startTime=Date.now();timerInterval=setInterval(()=>{
  const s=Math.floor((Date.now()-startTime)/1000);
  document.getElementById("timer").textContent=formatTime(s);
},1000);}
function finishGame(){clearInterval(timerInterval);const time=Math.floor((Date.now()-startTime)/1000);saveWinner(username,time);document.getElementById("game-screen").hidden=true;document.getElementById("leaderboard").hidden=false;renderLeaderboard();}