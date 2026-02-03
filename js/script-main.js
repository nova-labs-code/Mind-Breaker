let lives = 3;
let questionIndex = 0;
let questions = [];
let startTime = Date.now(); // invisible timer

const questionBox = document.getElementById('question');
const optionsBox = document.getElementById('options');
const livesBox = document.getElementById('lives');
const scoreBox = document.getElementById('score');

function updateLives(){ livesBox.innerText = "❤️".repeat(lives); }

async function loadQuestions(){
  const medium = await fetch('questions/medium.json').then(r=>r.json());
  const trick = await fetch('questions/trick.json').then(r=>r.json());
  const playable = await fetch('questions/playable.json').then(r=>r.json());
  const hard = await fetch('questions/hard.json').then(r=>r.json());

  questions = [...medium, ...trick, ...playable, ...hard];
  questions.sort((a,b)=>a.num - b.num);

  showQuestion();
}

function getElapsedTime(){ return Math.floor((Date.now()-startTime)/1000); }

function showQuestion(){
  if(lives <= 0){
    questionBox.innerText = "💀 Game Over!";
    optionsBox.innerHTML="";
    document.getElementById('mini-game').style.display="none";
    return;
  }

  if(questionIndex>=questions.length){
    questionBox.innerText = "🎉 You finished all questions!";
    optionsBox.innerHTML="";
    document.getElementById('mini-game').style.display="none";
    return;
  }

  const q = questions[questionIndex];
  scoreBox.innerText = `Question ${questionIndex+1} / 120`;
  updateLives();

  if(q.type === "mini"){
    runMiniGame(q, nextQuestion, loseLife);
  } else {
    document.getElementById('mini-game').style.display = "none";
    questionBox.innerText = q.q;
    optionsBox.innerHTML = "";

    q.options.forEach((opt,i)=>{
      const btn = document.createElement('button');
      btn.innerText = opt;
      btn.onclick = ()=>{
        if(i===q.answer){
          if(questionIndex === questions.length-1){
            // stop timer
            nextQuestion();
          } else {
            nextQuestion();
          }
        } else {
          loseLife(btn);
        }
      }
      optionsBox.appendChild(btn);
    });
  }
}

function loseLife(btn){
  lives--;
  updateLives();
  if(btn) btn.classList.add("fail");
  setTimeout(()=>{
    if(btn) btn.classList.remove("fail");
    showQuestion();
  },500);
}

function nextQuestion(){
  questionIndex++;
  showQuestion();
}

// initialize
updateLives();
loadQuestions();