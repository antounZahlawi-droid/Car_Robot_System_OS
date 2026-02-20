// =====================
// MUSIC ELEMENTS
// =====================
const music = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const volumeSlider = document.getElementById("volumeSlider");

// =====================
// WINDOWS
// =====================
const btnAbout = document.getElementById("btnAbout");
const btnCarOS = document.getElementById("btnCarOS");
const winAbout = document.getElementById("winAbout");
const winCarOS = document.getElementById("winCarOS");

// =====================
// ERROR SYSTEM
// =====================
const errorSound = document.getElementById("errorSound");
const errorWindow = document.getElementById("errorWindow");
const closeError = document.getElementById("closeError");
const btnErrorTest = document.getElementById("btnErrorTest");

// =====================
// REFRESH BUTTON
// =====================
const refreshCarBtn = document.getElementById("refreshCarBtn");

// =====================
// MUSIC SYSTEM
// =====================
music.volume = 0.5;
music.pause();
updateSliderFill();

musicToggle.addEventListener("change", () => {
    if (musicToggle.checked) {
        music.play().catch(() => {});
    } else {
        music.pause();
    }
});

function updateSliderFill() {
    const value = volumeSlider.value * 100;
    volumeSlider.style.background =
        `linear-gradient(to right, #0a84ff ${value}%, #d1d1d6 ${value}%)`;
}

volumeSlider.addEventListener("input", () => {
    music.volume = volumeSlider.value;
    updateSliderFill();
});

// =====================
// WINDOW SYSTEM
// =====================
function showWindow(win) {
    if (!win) return;
    win.style.display = "block";
    win.style.left = "50%";
    win.style.top = "50%";
    win.style.transform = "translate(-50%, -50%)";
    win.style.zIndex = Date.now();
}

function hideWindow(win) {
    if (!win) return;
    win.style.display = "none";
}

btnAbout.addEventListener("click", () => showWindow(winAbout));
btnCarOS.addEventListener("click", () => showWindow(winCarOS));

document.querySelectorAll(".traffic-btn.close").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target");
        const w = document.getElementById(target);
        if (!w) {
            showError();
            return;
        }
        hideWindow(w);
    });
});

// =====================
// DRAGGING WINDOWS
// =====================
document.querySelectorAll(".window").forEach(win => {
    const bar = win.querySelector(".window-titlebar");
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    bar.addEventListener("mousedown", e => {
        dragging = true;
        const rect = win.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        win.style.zIndex = Date.now();
    });

    document.addEventListener("mousemove", e => {
        if (!dragging) return;
        win.style.left = e.clientX - offsetX + "px";
        win.style.top = e.clientY - offsetY + "px";
        win.style.transform = "none";
    });

    document.addEventListener("mouseup", () => {
        dragging = false;
    });
});

// =====================
// CAR CONTROL BUTTONS
// =====================
document.querySelectorAll(".lr-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const dir = btn.getAttribute("data-dir");
        console.log("Car move:", dir);
        // later: send to robot backend
    });
});

// =====================
// SENSOR SIMULATION
// =====================
setInterval(() => {
    const s1 = document.getElementById("carS1");
    const s2 = document.getElementById("carS2");
    const s3 = document.getElementById("carS3");
    const s4 = document.getElementById("carS4");
    if (!s1 || !s2 || !s3 || !s4) return;

    const v1 = Math.floor(Math.random() * 200);
    const v2 = Math.floor(Math.random() * 200);
    const v3 = Math.floor(Math.random() * 200);
    const v4 = Math.floor(Math.random() * 200);

    s1.textContent = v1;
    s2.textContent = v2;
    s3.textContent = v3;
    s4.textContent = v4;

    // Example: trigger error if any sensor too high
    //if (v1 > 190 || v2 > 190 || v3 > 190 || v4 > 190) {
      //  showError();
    //}
}, 1000);

// =====================
// REFRESH BUTTON SPIN
// =====================
if (refreshCarBtn) {
    refreshCarBtn.addEventListener("click", () => {
        refreshCarBtn.classList.add("spin");
        setTimeout(() => refreshCarBtn.classList.remove("spin"), 600);
        console.log("Refresh clicked");
    });
}

// =====================
// ERROR SYSTEM (MACOS STYLE)
// =====================
function playError() {
    if (!errorSound) return;
    errorSound.currentTime = 0;
    errorSound.play().catch(() => {});
}

function showError() {
    if (!errorWindow) return;
    playError();
    showWindow(errorWindow);
    const box = errorWindow.querySelector(".window-content");
    if (!box) return;
    box.classList.add("shake");
    setTimeout(() => box.classList.remove("shake"), 350);
}

if (btnErrorTest) {
    btnErrorTest.addEventListener("click", showError);
}

if (closeError) {
    closeError.addEventListener("click", () => {
        hideWindow(errorWindow);
    });
}
