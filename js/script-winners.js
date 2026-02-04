const BIN_ID = "698280e6d0ea881f409e978f";
const ACCESS_KEY = "$2a$10$YENQL1visC/5iaLFbd2rcu3wuHMmYBB5uvPlu.SWdFXD.LBIMIQy6";


async function saveWinner(name, time){
  try{
    const resp=await fetch(BIN_URL,{
      method:"PUT",
      headers:{
        "Content-Type":"application/json",
        "X-Master-Key":BIN_KEY
      },
      body:JSON.stringify({name,time})
    });
  }catch(e){console.log("Save error",e);}
}

async function renderLeaderboard(){
  try{
    const resp=await fetch(BIN_URL,{headers:{"X-Master-Key":BIN_KEY}});
    const data=await resp.json();
    const list=document.getElementById("leaderboard-list");
    list.innerHTML="";
    data.record.forEach(r=>{
      const li=document.createElement("li");
      li.textContent=`${r.name} - ${formatTime(r.time)}`;
      list.appendChild(li);
    });
  }catch(e){console.log("Leaderboard error",e);}
}