function runMiniGame(q) {
  const questionText = document.getElementById('question-text');
  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  switch(q.mini) {
    case 'hold':
      const holdBtn = document.createElement('button');
      holdBtn.textContent = 'Hold';
      let holdTimer;
      holdBtn.onmousedown = () => holdTimer = setTimeout(()=>{current++; showQuestion();}, q.duration);
      holdBtn.onmouseup = () => clearTimeout(holdTimer);
      answersDiv.appendChild(holdBtn);
      break;

    case 'wait':
      const waitBtn = document.createElement('button');
      waitBtn.textContent = 'Click at right time';
      const startClick = Date.now();
      waitBtn.onclick = () => {
        if (Date.now() - startClick < q.duration) { lives--; updateLives(); if(lives<=0) location.reload(); }
        else { current++; showQuestion(); }
      };
      answersDiv.appendChild(waitBtn);
      break;

    case 'avoid':
      for (let i=0;i<q.buttons;i++){
        const b = document.createElement('button');
        b.textContent = `Btn ${i+1}`;
        b.onclick = () => {
          if(i===q.safe){ current++; showQuestion(); }
          else { lives--; updateLives(); if(lives<=0) location.reload(); }
        };
        answersDiv.appendChild(b);
      }
      break;

    case 'hold-move':
      const moveBtn = document.createElement('button');
      moveBtn.textContent = 'Hold me';
      moveBtn.style.position = 'absolute';
      moveBtn.style.top = Math.random()*200+'px';
      moveBtn.style.left = Math.random()*300+'px';
      let holdTimer2;
      moveBtn.onmousedown = () => holdTimer2 = setTimeout(()=>{current++; showQuestion();}, q.duration);
      moveBtn.onmouseup = () => clearTimeout(holdTimer2);
      answersDiv.appendChild(moveBtn);
      break;

    case 'avoid-move':
      for (let i=0;i<q.buttons;i++){
        const b = document.createElement('button');
        b.textContent = `Btn ${i+1}`;
        b.style.position = 'absolute';
        b.style.top = Math.random()*200+'px';
        b.style.left = Math.random()*300+'px';
        b.onclick = () => { if(i===q.safe){current++;showQuestion();} else {lives--;updateLives();if(lives<=0) location.reload();}};
        answersDiv.appendChild(b);
      }
      break;

    case 'reverse':
      const revBtn = document.createElement('button');
      revBtn.textContent = 'Click me';
      revBtn.onclick = () => { current++; showQuestion(); };
      answersDiv.appendChild(revBtn);
      break;

    case 'reverse-wait':
      const rwBtn = document.createElement('button');
      rwBtn.textContent = 'Click after delay';
      const startRw = Date.now();
      rwBtn.onclick = () => {
        if(Date.now()-startRw < q.duration){ lives--; updateLives(); if(lives<=0) location.reload(); }
        else { current++; showQuestion(); }
      };
      answersDiv.appendChild(rwBtn);
      break;
  }
}