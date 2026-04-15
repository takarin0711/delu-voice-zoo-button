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

const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a"
];
let konamiIndex = 0;
document.addEventListener("keydown", (e) => {
  if (e.key === KONAMI[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === KONAMI.length) {
      konamiIndex = 0;
      document.querySelectorAll(".header-icon").forEach(img => {
        img.classList.remove("spinning");
        void img.offsetWidth; // reflow to restart animation
        img.classList.add("spinning");
        img.addEventListener("animationend", () => img.classList.remove("spinning"), { once: true });
      });
    }
  } else {
    konamiIndex = e.key === KONAMI[0] ? 1 : 0;
  }
});

const grid = document.getElementById("button-grid");

SOUNDS.forEach(({ label, file }) => {
  const btn = document.createElement("button");
  btn.className = "voice-btn";
  btn.textContent = label;
  btn.addEventListener("animationend", (e) => {
    if (e.animationName === "card-enter") btn.classList.add("card-entered");
  }, { once: true });
  btn.addEventListener("click", () => playSound(file, btn));
  grid.appendChild(btn);
});
