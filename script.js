document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     BOOT PROTECTION
  ============================================================ */
  if (!sessionStorage.getItem("booted") || !sessionStorage.getItem("loggedIn")) {
    if (!location.href.includes("boot.html") && !location.href.includes("login.html")) {
      window.location.href = "boot.html";
      return;
    }
  }

  /* ============================================================
     ROBOT HTTP CONTROL (REAL ARDUINO)
  ============================================================ */

  const ROBOT_BASE = "http://localhost:3000/robot";

  let currentSpeed = 255;
  let sensor1Value = -1;   // FRONT
  let sensor2Value = -1;   // REAR
  let avgDistance = -1;

  function updateSensorsFromData(data) {
    const s1El = document.getElementById("carS1");
    const s2El = document.getElementById("carS2");
    const warn = document.getElementById("papyrusWarning");

    sensor1Value = data.s1;
    sensor2Value = data.s2;

    if (sensor1Value !== -1 && sensor2Value !== -1) {
      avgDistance = Math.round((sensor1Value + sensor2Value) / 2);
    } else {
      avgDistance = -1;
    }

    if (s1El) s1El.textContent = (sensor1Value === -1 ? "-- cm" : sensor1Value + " cm");
    if (s2El) s2El.textContent = (sensor2Value === -1 ? "-- cm" : sensor2Value + " cm");

    if (warn) {
      if (avgDistance === -1) {
        warn.textContent = "Mmm… no walls.";
        warn.style.color = "#0ff";
      } else if (avgDistance < 15) {
        warn.textContent = "D'OH! WALL!";
        warn.style.color = "#ff4444";
      } else {
        warn.textContent = "All clear!";
        warn.style.color = "#0f0";
      }
    }
  }

  function sendRobot(cmd) {
    const map = {
      "cforward": "cf",
      "cbackward": "cb",
      "cleft": "cl",
      "cright": "cr",
      "cstop": "cs"
    };

    const finalCmd = map[cmd] || cmd;

    const url = `${ROBOT_BASE}/?q=${encodeURIComponent(finalCmd)}&spd=${currentSpeed}`;

    fetch(url)
      .then(r => r.json())
      .then(data => updateSensorsFromData(data))
      .catch(() => {
        const warn = document.getElementById("papyrusWarning");
        if (warn) {
          warn.textContent = "Robot not responding.";
          warn.style.color = "#ff4444";
        }
      });
  }

  // Poll sensors every 200ms
  setInterval(() => {
    fetch(`${ROBOT_BASE}/`)
      .then(r => r.json())
      .then(data => updateSensorsFromData(data))
      .catch(() => {});
  }, 200);

  /* ============================================================
     WINDOW SYSTEM
  ============================================================ */
  function makeWindowDraggable(win) {
    const titlebar = win.querySelector(".window-titlebar");
    if (!titlebar) return;

    let offsetX = 0, offsetY = 0, dragging = false;

    titlebar.addEventListener("mousedown", (e) => {
      dragging = true;
      win.style.zIndex = Date.now();
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      win.style.left = `${e.clientX - offsetX}px`;
      win.style.top = `${e.clientY - offsetY}px`;
      win.style.transform = "none";
    });

    document.addEventListener("mouseup", () => dragging = false);
  }

  function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    win.style.display = "block";
    win.style.zIndex = Date.now();

    if (!win.dataset.positioned) {
      win.style.left = "50%";
      win.style.top = "50%";
      win.style.transform = "translate(-50%, -50%)";
      win.dataset.positioned = "1";
    }
  }

  function initWindows() {
    const wins = document.querySelectorAll(".window");
    wins.forEach(w => {
      w.style.display = "none";
      makeWindowDraggable(w);
    });

    const closeBtns = document.querySelectorAll(".traffic-btn.close");
    closeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        const win = document.getElementById(target);
        if (win) win.style.display = "none";
      });
    });
  }

  initWindows();

  /* ============================================================
     SIDEBAR NAVIGATION
  ============================================================ */
  const btnCarOS = document.getElementById("btnCarOS");
  const btnAbout = document.getElementById("btnAbout");

  if (btnCarOS) btnCarOS.addEventListener("click", () => openWindow("winCarOS"));
  if (btnAbout) btnAbout.addEventListener("click", () => openWindow("winAbout"));

  /* ============================================================
     AUDIO SYSTEM
  ============================================================ */
  const startupSound = document.getElementById("startupSound");
  const bgMusic = document.getElementById("bgMusic");
  const errorSound = document.getElementById("errorSound");
  const sosumiSound = document.getElementById("sosumiSound");
  const completeSound = document.getElementById("completeSound");
  const musicToggle = document.getElementById("musicToggle");
  const volumeSlider = document.getElementById("volumeSlider");

  if (startupSound) startupSound.play().catch(() => {});
  if (bgMusic) bgMusic.volume = 0.5;

  function updateSliderFill(slider) {
    const min = slider.min ? slider.min : 0;
    const max = slider.max ? slider.max : 1;
    const value = ((slider.value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #0a84ff ${value}%, #d1d1d6 ${value}%)`;
  }

  if (volumeSlider && bgMusic) {
    updateSliderFill(volumeSlider);
    volumeSlider.addEventListener("input", (e) => {
      bgMusic.volume = parseFloat(e.target.value);
      updateSliderFill(volumeSlider);
    });
  }

  if (musicToggle && bgMusic) {
    musicToggle.addEventListener("change", (e) => {
      if (e.target.checked) bgMusic.play().catch(() => {});
      else bgMusic.pause();
    });
  }

  /* ============================================================
     SPEED SLIDER
  ============================================================ */
  const speedSlider = document.getElementById("speedSlider");
  const speedValue = document.getElementById("speedValue");

  if (speedSlider && speedValue) {
    currentSpeed = parseInt(speedSlider.value, 10) || 255;
    speedValue.textContent = currentSpeed;

    speedSlider.addEventListener("input", () => {
      currentSpeed = parseInt(speedSlider.value, 10);
      speedValue.textContent = currentSpeed;
      updateSliderFill(speedSlider);
    });
  }

  /* ============================================================
     TOP BAR BUTTONS
  ============================================================ */
  const emergencyBtn = document.getElementById("emergencyBtn");
  const shutdownBtn = document.getElementById("shutdownBtn");

  if (emergencyBtn) {
    emergencyBtn.addEventListener("click", () => {
      sendRobot("cstop");
      if (errorSound) errorSound.play().catch(() => {});
      openWindow("errorWindow");
    });
  }

  if (shutdownBtn) {
    shutdownBtn.addEventListener("click", () => {
      sendRobot("cstop");
      if (sosumiSound) sosumiSound.play().catch(() => {});
    });
  }

  /* ============================================================
     SPIN MODE
  ============================================================ */
  let spinTimeout = null;

  const refreshCarBtn = document.getElementById("refreshCarBtn");
  if (refreshCarBtn) {
    refreshCarBtn.addEventListener("click", () => {
      if (completeSound) completeSound.play().catch(() => {});
      sendRobot("cmode=spin");

      if (spinTimeout) clearTimeout(spinTimeout);

      spinTimeout = setTimeout(() => {
        sendRobot("cmode=normal");
      }, 12000);
    });
  }

  /* ============================================================
     CAR CONTROL BUTTONS
  ============================================================ */
  const carButtons = document.querySelectorAll(".lr-btn");

  carButtons.forEach(btn => {
    const dir = btn.dataset.dir;

    btn.addEventListener("mousedown", () => {
      if (spinTimeout) {
        clearTimeout(spinTimeout);
        spinTimeout = null;
        sendRobot("cmode=normal");
      }

      sendRobot("c" + dir);
      if (completeSound) completeSound.play().catch(() => {});
    });

    btn.addEventListener("mouseup", () => sendRobot("cstop"));
    btn.addEventListener("mouseleave", () => sendRobot("cstop"));
  });

  /* ============================================================
     BMO AI
  ============================================================ */
  const bmo = document.getElementById("bmo");
  const bmoWindow = document.getElementById("bmo-window");
  const bmoInput = document.getElementById("bmo-input");
  const bmoOutput = document.getElementById("bmo-output");

  const API_KEY = "YOUR_API_KEY_HERE";
  const MODEL = "gemini-2.5-flash";

  async function bmoAsk(text) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `You are BMO. User: ${text}` }
                ]
              }
            ]
          })
        }
      );
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "BMO is sleepy…";
    } catch (err) {
      console.error("BMO ERROR:", err);
      return "BMO tripped on a cable!";
    }
  }

  if (bmo && bmoWindow && bmoInput && bmoOutput) {
    bmo.addEventListener("click", () => openWindow("bmo-window"));

    bmoInput.addEventListener("keydown", async (e) => {
      if (e.key !== "Enter") return;
      const text = bmoInput.value.trim();
      if (!text) return;

      bmoOutput.textContent = "BMO is thinking...";
      bmoInput.value = "";

      const reply = await bmoAsk(text);
      bmoOutput.textContent = reply;
    });
  }

  /* ============================================================
     FINAL LOG
  ============================================================ */
  console.log("Catalina D2 HTTP build loaded.");
});
