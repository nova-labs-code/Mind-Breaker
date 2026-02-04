// helpers.js
function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2,"0")}:${String(seconds % 60).padStart(2,"0")}`;
}

function clearElement(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function uniqueUsername(name, existing) {
  let count = 1;
  let final = name;
  while (existing.includes(final)) {
    count++;
    final = `${name} #${count}`;
  }
  return final;
}