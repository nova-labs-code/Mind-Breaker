// JSONBin setup
const BIN_ID = "698280e6d0ea881f409e978f";
const ACCESS_KEY = "$2a$10$YENQL1visC/5iaLFbd2rcu3wuHMmYBB5uvPlu.SWdFXD.LBIMIQy6"; // your toggleable access key

// Get elapsed time (in seconds)
let startTime = Date.now();
function getElapsedTime() {
  return Math.floor((Date.now() - startTime) / 1000);
}

// Load leaderboard
async function loadWinners() {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: { "X-Access-Key": ACCESS_KEY }
  });
  const data = await res.json();
  const winners = data.record.winners || [];

  const list = document.getElementById("winner-list");
  if(!list) return;
  list.innerHTML = "";

  // Sort by fastest time
  winners.sort((a,b)=>a.time - b.time);

  winners.forEach(w => {
    const li = document.createElement("li");
    const minutes = Math.floor(w.time / 60);
    const seconds = w.time % 60;
    li.textContent = `${w.name} — ${minutes}m ${seconds}s — ${new Date(w.date).toLocaleString()}`;
    list.appendChild(li);
  });
}

// Save a new winner
async function saveWinner(inputName){
  if(!inputName) return;

  const elapsedTime = getElapsedTime();

  // 1. Fetch current winners
  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: { "X-Access-Key": ACCESS_KEY }
  });
  const data = await res.json();
  const winners = data.record.winners || [];

  // 2. Count how many times this username exists
  let count = 1;
  winners.forEach(w => {
    if(w.name.startsWith(inputName)) count++;
  });

  const finalName = count === 1 ? `${inputName} #1` : `${inputName} #${count}`;

  // 3. Add new winner
  winners.push({
    name: finalName,
    time: elapsedTime,
    date: new Date().toISOString()
  });

  // 4. Update JSONBin
  await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": ACCESS_KEY,
      "X-Bin-Versioning": "false"
    },
    body: JSON.stringify({ winners })
  });

  // 5. Refresh leaderboard
  loadWinners();
}

// Connect form
document.getElementById("submit-winner").onclick = ()=>{
  const name = document.getElementById("player-name").value.trim();
  if(name) saveWinner(name);
}

// Load leaderboard on page load
window.addEventListener("load", loadWinners);