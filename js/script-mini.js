function runMiniGame(question, onSuccess, onFail) {
  const box = document.getElementById("answers");
  clearElement(box);

  // HOLD
  if (question.mini === "hold") {
    const btn = document.createElement("button");
    btn.textContent = "Hold";
    let start;
    btn.onmousedown = () => start = Date.now();
    btn.onmouseup = () => {
      if (Date.now() - start >= question.duration) onSuccess();
      else onFail();
    };
    box.appendChild(btn);
  }

  // WAIT & CLICK
  if (question.mini === "wait") {
    const btn = document.createElement("button");
    btn.textContent = "Click after waiting";
    const start = Date.now();
    btn.onclick = () => {
      if (Math.abs(Date.now() - start - question.duration) < 300) onSuccess();
      else onFail();
    };
    box.appendChild(btn);
  }

  // AVOID BUTTONS
  if (question.mini === "avoid") {
    for (let i = 0; i < question.buttons; i++) {
      const b = document.createElement("button");
      b.textContent = "?";
      b.onclick = () => i === question.safe ? onSuccess() : onFail();
      box.appendChild(b);
    }
  }

  // REVERSE CLICK
  if (question.mini === "reverse") {
    ["Correct","Wrong"].forEach((txt,i)=>{
      const b=document.createElement("button");
      b.textContent=txt;
      b.onclick=()=> i===1 ? onSuccess() : onFail();
      box.appendChild(b);
    });
  }

  // HOLD + MOVE
  if (question.mini === "hold-move") {
    const btn = document.createElement("button");
    btn.textContent = "Hold";
    btn.style.position="absolute";
    btn.style.top="50px"; btn.style.left="50px";
    document.body.appendChild(btn);

    let start;
    const interval = setInterval(() => {
      btn.style.top = Math.random()*window.innerHeight + "px";
      btn.style.left = Math.random()*window.innerWidth + "px";
    },100);

    btn.onmousedown = () => start = Date.now();
    btn.onmouseup = () => {
      clearInterval(interval);
      btn.remove();
      if (Date.now()-start >= question.duration) onSuccess();
      else onFail();
    };
  }

  // AVOID + MOVE
  if (question.mini === "avoid-move") {
    for (let i=0;i<question.buttons;i++){
      const b=document.createElement("button");
      b.textContent="?";
      b.style.position="absolute";
      b.style.top=Math.random()*window.innerHeight+"px";
      b.style.left=Math.random()*window.innerWidth+"px";
      document.body.appendChild(b);
      if(i===question.safe) b.onclick=()=>{clearAvoidMove(); onSuccess();}
      else b.onclick=()=>{clearAvoidMove(); onFail();}
    }
    function clearAvoidMove(){
      const btns=document.querySelectorAll("#answers button, body>button");
      btns.forEach(b=>b.remove());
    }
  }

  // REVERSE + WAIT
  if (question.mini === "reverse-wait") {
    const btn=document.createElement("button");
    btn.textContent="Click the 'Wrong' button after "+question.duration/1000+"s";
    btn.onclick=()=>{
      const elapsed=Date.now()-startTime;
      if(Math.abs(elapsed-question.duration)<300) onSuccess();
      else onFail();
    };
    box.appendChild(btn);
  }
}