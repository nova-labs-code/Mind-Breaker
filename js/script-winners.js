const BIN_ID = "698280e6d0ea881f409e978f";
const ACCESS_KEY = "$2a$10$YENQL1visC/5iaLFbd2rcu3wuHMmYBB5uvPlu.SWdFXD.LBIMIQy6";

async function loadWinners() {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: { "X-Access-Key": ACCESS_KEY }
  });
  const data = await res.json();
  const winners = data.record.winners || [];

  const list = document.getElementById("winner-list");
  if(!list) return;
  list.innerHTML = "";

  winners.sort((a,b)=>a.time - b.time); // fastest first

  winners.slice(0,100).forEach(w => {
    const li = document.createElement("li");
    const minutes = Math.floor(w.time/60);
    const seconds = w.time%60;
    li.textContent = `${w.name} — ${minutes}m ${seconds}s — ${new Date(w.date).toLocaleString()}`;
    list.appendChild(li);
  });
}

async function saveWinner(inputName){
  if(!inputName) return;

  const elapsedTime = getElapsedTime();

  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: { "X-Access-Key": ACCESS_KEY }
  });
  const data = await res.json();
  const winners = data.record.winners || [];

  // Count existing usernames
  let count = 1;
  winners.forEach(w => {
    if(w.name.startsWith(inputName)) count++;
  });

  const finalName = `${inputName} #${count}`;

  winners.push({
    name: finalName,
    time: elapsedTime,
    date: new Date().toISOString()
  });

  await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method:"PUT",
    headers:{
      "Content-Type":"application/json",
      "X-Access-Key":ACCESS_KEY,
      "X-Bin-Versioning":"false"
    },
    body: JSON.stringify({ winners })
  });

  loadWinners();
}

document.getElementById("submit-winner").onclick = ()=>{
  const name = document.getElementById("player-name").value.trim();
  if(name) saveWinner(name);
}

window.addEventListener("load", loadWinners);