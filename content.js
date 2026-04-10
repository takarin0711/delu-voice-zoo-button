// SOUNDS is defined in sounds.js, loaded before this script via manifest.json

let currentAudio = null;

const SELECTORS = [
  "#channel-header-links",
  "ytd-channel-header-renderer #buttons",
  "yt-flexible-actions-view-model",
  "#channel-header #subscribe-button",
  "ytd-channel-header-renderer",
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

  // Expose closePanel so removeButton() can clean up the listener
  container._closePanel = closePanel;

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
  if (container) {
    if (typeof container._closePanel === "function") container._closePanel();
    container.remove();
  }
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
