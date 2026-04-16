// ── Starfield Canvas ──────────────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], shootingStars = [];
  let lastTime = 0;
  let nextShoot = 10000 + Math.random() * 12000;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    // Density proportional to screen area, capped for performance
    const count = Math.min(Math.floor(W * H / 2800), 420);
    for (let i = 0; i < count; i++) {
      const tier = Math.random();
      let r, baseAlpha;
      if      (tier < 0.62) { r = rand(0.3, 0.8);  baseAlpha = rand(0.32, 0.62); } // dim
      else if (tier < 0.88) { r = rand(0.9, 1.5);  baseAlpha = rand(0.58, 0.85); } // medium
      else                  { r = rand(1.7, 2.9);  baseAlpha = rand(0.82, 1.00); } // bright

      // 35% of stars placed along a Milky-Way-like diagonal band
      let x, y;
      if (Math.random() < 0.35) {
        const t = Math.random();
        x = W * (0.68 - t * 0.52) + rand(-W * 0.16, W * 0.16);
        y = H * (0.04 + t * 0.88) + rand(-H * 0.07, H * 0.07);
      } else {
        x = Math.random() * W;
        y = Math.random() * H;
      }

      // Realistic star color distribution
      const cr = Math.random();
      let color;
      if      (cr < 0.48) color = [255, 255, 255];   // white
      else if (cr < 0.68) color = [195, 224, 255];   // blue-white (O/B type)
      else if (cr < 0.80) color = [255, 248, 210];   // warm yellow (G type)
      else if (cr < 0.90) color = [208, 255, 232];   // green-tinted (theme accent)
      else                color = [255, 215, 190];   // orange-red (K/M type)

      stars.push({
        x, y, r, baseAlpha, color,
        twinkleSpeed: rand(0.25, 2.8),
        twinklePhase: rand(0, Math.PI * 2),
        bright: r > 1.7,
      });
    }
  }

  function drawStar(star, t) {
    const twinkle = 0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinklePhase);
    const alpha   = star.baseAlpha * (0.52 + 0.48 * twinkle);
    const [r, g, b] = star.color;

    ctx.save();

    if (star.bright) {
      // Soft radial halo
      const haloR = star.r * 7;
      const halo = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, haloR);
      halo.addColorStop(0,   `rgba(${r},${g},${b},${(alpha * 0.55).toFixed(3)})`);
      halo.addColorStop(0.4, `rgba(${r},${g},${b},${(alpha * 0.12).toFixed(3)})`);
      halo.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(star.x, star.y, haloR, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // 4-point diffraction spikes — length pulses with twinkle
      const spikeLen = star.r * 9 * (0.65 + 0.35 * twinkle);
      ctx.lineWidth = 0.8;
      ctx.lineCap = 'round';

      for (let angle = 0; angle < Math.PI; angle += Math.PI / 2) {
        const spike = ctx.createLinearGradient(
          star.x - Math.cos(angle) * spikeLen, star.y - Math.sin(angle) * spikeLen,
          star.x + Math.cos(angle) * spikeLen, star.y + Math.sin(angle) * spikeLen
        );
        spike.addColorStop(0,   `rgba(${r},${g},${b},0)`);
        spike.addColorStop(0.5, `rgba(${r},${g},${b},${(alpha * 0.42).toFixed(3)})`);
        spike.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.strokeStyle = spike;
        ctx.beginPath();
        ctx.moveTo(star.x - Math.cos(angle) * spikeLen, star.y - Math.sin(angle) * spikeLen);
        ctx.lineTo(star.x + Math.cos(angle) * spikeLen, star.y + Math.sin(angle) * spikeLen);
        ctx.stroke();
      }
    }

    // Core dot
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
    ctx.fill();

    ctx.restore();
  }

  function drawMilkyWay() {
    // Soft diagonal luminous band
    const grd = ctx.createLinearGradient(W * 0.78, 0, W * 0.18, H);
    grd.addColorStop(0,   'rgba(100,190,145,0)');
    grd.addColorStop(0.25,'rgba(70, 165,125,0.038)');
    grd.addColorStop(0.5, 'rgba(90, 185,145,0.058)');
    grd.addColorStop(0.75,'rgba(70, 165,125,0.038)');
    grd.addColorStop(1,   'rgba(100,190,145,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  function spawnShootingStar() {
    const sx = rand(W * 0.05, W * 0.92);
    const sy = rand(0, H * 0.28);
    const angle = rand(0.18, 0.52); // radians downward from horizontal
    const spd   = rand(380, 680);
    shootingStars.push({
      x: sx, y: sy,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      len: rand(110, 240),
      life: 1.0,
      decay: rand(0.55, 1.05),
    });
  }

  function frame(ts) {
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    const t = ts / 1000;

    ctx.clearRect(0, 0, W, H);
    drawMilkyWay();

    for (const s of stars) drawStar(s, t);

    // Spawn shooting stars on timer
    nextShoot -= dt * 1000;
    if (nextShoot <= 0) {
      spawnShootingStar();
      nextShoot = rand(9000, 24000);
    }

    // Draw shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x    += ss.vx * dt;
      ss.y    += ss.vy * dt;
      ss.life -= ss.decay * dt;

      if (ss.life <= 0 || ss.x > W + 200 || ss.y > H + 200) {
        shootingStars.splice(i, 1);
        continue;
      }

      const mag = Math.hypot(ss.vx, ss.vy);
      const tailLen = ss.len * ss.life;
      const tx = ss.x - (ss.vx / mag) * tailLen;
      const ty = ss.y - (ss.vy / mag) * tailLen;

      // Tail gradient
      const tail = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
      tail.addColorStop(0,   'rgba(255,255,255,0)');
      tail.addColorStop(0.55,`rgba(215,252,238,${(ss.life * 0.50).toFixed(3)})`);
      tail.addColorStop(1,   `rgba(255,255,255,${(ss.life * 0.92).toFixed(3)})`);

      ctx.save();
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = tail;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(ss.x, ss.y);
      ctx.stroke();

      // Head glow
      const head = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 9);
      head.addColorStop(0, `rgba(255,255,255,${(ss.life * 0.88).toFixed(3)})`);
      head.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = head;
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

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
