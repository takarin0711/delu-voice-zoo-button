let currentAudio = null;

const SELECTORS = [
  "#channel-header-links",
  "ytd-channel-header-renderer #buttons",
  "yt-flexible-actions-view-model",
  "#channel-header #subscribe-button",
  "ytd-channel-header-renderer",
];

const SOUNDS = [
  { label: "🦆 アヒル",       file: "voice/01_duck.mp3" },
  { label: "🐑 ヒツジ",       file: "voice/02_sheep.mp3" },
  { label: "🐐 ヤギ",         file: "voice/03_goat.mp3" },
  { label: "🦊 キツネ",       file: "voice/04_fox.mp3" },
  { label: "🐧 ペンギン",     file: "voice/05_penguin.mp3" },
  { label: "🦭 セイウチ",     file: "voice/06_walrus.mp3" },
  { label: "🐻‍❄️ ホッキョクグマ",  file: "voice/07_polar_bear.mp3" },
  { label: "🦌 トナカイ",     file: "voice/08_reindeer.mp3" },
  { label: "🦜 オウム",       file: "voice/09_parrot.mp3" },
  { label: "🦩 フラミンゴ",   file: "voice/10_flamingo.mp3" },
  { label: "🦉 フクロウ",     file: "voice/11_owl.mp3" },
  { label: "🦅 ワシ",         file: "voice/12_eagle.mp3" },
  { label: "🦁 ライオン",     file: "voice/13_lion.mp3" },
  { label: "🦏 サイ",         file: "voice/14_rhinoceros.mp3" },
  { label: "🐘 ゾウ",         file: "voice/15_elephant.mp3" },
  { label: "🦛 カバ",         file: "voice/16_hippopotamus.mp3" },
  { label: "🐻 クマ",         file: "voice/17_bear.mp3" },
  { label: "🐯 トラ",         file: "voice/18_tiger.mp3" },
  { label: "🦍 ゴリラ",       file: "voice/19_gorilla.mp3" },
  { label: "🐼 パンダ",       file: "voice/20_panda.mp3" },
  { label: "🦥 ナマケモノ",   file: "voice/21_sloth.mp3" },
  { label: "🐸 カエル",       file: "voice/22_frog.mp3" },
  { label: "🐶 イヌ",         file: "voice/23_dog.mp3" },
  { label: "🐱 ネコ",         file: "voice/24_cat.mp3" },
  { label: "🐰 ウサギ",       file: "voice/25_rabbit.mp3" },
  { label: "🐢 カメ",         file: "voice/26_turtle.mp3" },
  { label: "🐴 ウマ",         file: "voice/27_horse.mp3" },
  { label: "🐮 ウシ",         file: "voice/28_cow.mp3" },
  { label: "🐹 ハムスター",   file: "voice/29_hamster.mp3" },
  { label: "🐌 カタツムリ",   file: "voice/30_snail.mp3" },
];

function waitForElement(selectors, callback, timeout = 15000) {
  const find = () => {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        console.log("[delu-voice] found element with selector:", sel, el);
        return el;
      }
    }
    return null;
  };

  const el = find();
  if (el) { callback(el); return; }

  const observer = new MutationObserver(() => {
    const el = find();
    if (el) { observer.disconnect(); callback(el); }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => {
    observer.disconnect();
    console.log("[delu-voice] timeout — none of these selectors found:", selectors);
    console.log("[delu-voice] ytd-channel-header-renderer:", document.querySelector("ytd-channel-header-renderer"));
    console.log("[delu-voice] #subscribe-button:", document.querySelector("#subscribe-button"));
  }, timeout);
}

function playSound(file) {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    const audio = new Audio(chrome.runtime.getURL(file));
    currentAudio = audio;
    audio.play();
  } catch (e) {
    // Extension was reloaded — remove stale UI so the user knows to refresh
    removeButton();
    console.warn("[delu-voice] Extension context invalidated. Please reload the page.");
  }
}

function injectButton(anchor) {
  if (document.getElementById("delu-voice-container")) return;

  const container = document.createElement("div");
  container.id = "delu-voice-container";

  const trigger = document.createElement("button");
  trigger.id = "delu-voice-btn";
  trigger.innerHTML = "🎵 Voice <span id='delu-voice-arrow'>▼</span>";

  const panel = document.createElement("div");
  panel.id = "delu-voice-panel";

  SOUNDS.forEach(({ label, file }) => {
    const item = document.createElement("button");
    item.className = "delu-voice-item";
    item.textContent = label;
    item.addEventListener("click", () => {
      playSound(file);
    });
    panel.appendChild(item);
  });

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.contains("open");
    isOpen ? closePanel() : openPanel();
  });

  container.appendChild(trigger);
  container.appendChild(panel);
  anchor.appendChild(container);
  console.log("[delu-voice] dropdown injected into", anchor);

  function openPanel() {
    panel.classList.add("open");
    document.getElementById("delu-voice-arrow").textContent = "▲";
    document.addEventListener("click", onOutsideClick);
  }

  function closePanel() {
    panel.classList.remove("open");
    const arrow = document.getElementById("delu-voice-arrow");
    if (arrow) arrow.textContent = "▼";
    document.removeEventListener("click", onOutsideClick);
  }

  function onOutsideClick(e) {
    if (!container.contains(e.target)) closePanel();
  }
}

function isDelutayaPage() {
  return location.pathname.startsWith("/@delutaya");
}

function removeButton() {
  const container = document.getElementById("delu-voice-container");
  if (container) container.remove();
}

function onNavigate() {
  if (isDelutayaPage()) {
    waitForElement(SELECTORS, injectButton);
  } else {
    removeButton();
  }
}

console.log("[delu-voice] content script loaded, waiting for header...");

// Initial load
if (isDelutayaPage()) {
  waitForElement(SELECTORS, injectButton);
}

// YouTube SPA navigation
window.addEventListener("yt-navigate-finish", onNavigate);
