// SOUNDS is defined in sounds.js, loaded before this script via index.html

let currentAudio = null;

function playSound(file, btn) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  const audio = new Audio(file);
  currentAudio = audio;

  document.querySelectorAll(".voice-btn.playing").forEach(el => el.classList.remove("playing"));
  btn.classList.add("playing");

  audio.addEventListener("ended", () => btn.classList.remove("playing"));
  audio.play();
}

const grid = document.getElementById("button-grid");

SOUNDS.forEach(({ label, file }) => {
  const btn = document.createElement("button");
  btn.className = "voice-btn";
  btn.textContent = label;
  btn.addEventListener("click", () => playSound(file, btn));
  grid.appendChild(btn);
});
