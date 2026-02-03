function runMiniGame(q, nextQuestion, loseLife){
  const miniGame = document.getElementById('mini-game');
  const miniButton = document.getElementById('mini-button');

  miniGame.style.display = "block";
  miniButton.style.left = "5px";

  let pressStart;

  miniButton.onpointerdown = ()=>{ pressStart=Date.now(); };
  miniButton.onpointerup = ()=>{
    let held = Date.now() - pressStart;
    if(held >= q.duration) nextQuestion();
    else loseLife();
  };
}