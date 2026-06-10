// =====================
// SAFE INIT WRAPPER (IMPORTANT FOR CHROME)
// =====================
window.addEventListener("DOMContentLoaded", () => {

// =====================
// ELEMENTS
// =====================
const imageUpload = document.getElementById("imageUpload");
const mapImage = document.getElementById("mapImage");
const viewer = document.getElementById("viewer");

const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");

const saveImageSetup = document.getElementById("saveImageSetup");
const unlockImage = document.getElementById("unlockImage");

const imageStatus = document.getElementById("imageStatus");

// PIN UI
const pinsLayer = document.getElementById("pinsLayer");
const pinForm = document.getElementById("pinForm");
const pinName = document.getElementById("pinName");
const pinStatus = document.getElementById("pinStatus");
const pinDescription = document.getElementById("pinDescription");

const savePinBtn = document.getElementById("savePinBtn");
const deletePinBtn = document.getElementById("deletePinBtn");

// MODE

const normalModeBtn = document.getElementById("normalModeBtn");

// REPORT
const selectModeBtn = document.getElementById("selectModeBtn");
const createReportBtn = document.getElementById("createReportBtn");
const reportForm = document.getElementById("reportForm");
const reportTitle = document.getElementById("reportTitle");
const reportDesc = document.getElementById("reportDesc");
const saveReportBtn = document.getElementById("saveReportBtn");
const reportList = document.getElementById("reportList");
const selectedPreview = document.getElementById("selectedPreview");
const selectBox = document.getElementById("selectBox");
const clearHistory = document.getElementById("clearHistory");
const clearPin = document.getElementById("clearPin");
const cancelReportBtn = document.getElementById("cancelReportBtn");

// date format

// =====================
// STATE
// =====================
let scale = 1;
let posX = 0;
let posY = 0;

let imageLocked = false;

let pins = [];
let selectedPin = null;

let mode = "normal";

let selectedPins = new Set();

let isSelecting = false;
let startSelectX = 0;
let startSelectY = 0;

let dragMoved = false;

let activeReport = null;

// =====================
// LOAD IMAGE
// =====================
imageUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
        mapImage.onload = () => {
            syncView();
            renderPins();
        };

        mapImage.src = event.target.result;
        localStorage.setItem("image", event.target.result);
    };

    reader.readAsDataURL(file);
});


const savedImage = localStorage.getItem("image");
if (savedImage) {
    mapImage.onload = () => {
        syncView();
        renderPins();
    };
    mapImage.src = savedImage;
}

// =====================
// ZOOM
// =====================
zoomIn.onclick = () => {
    if (imageLocked) return;
    scale += 0.1;
    syncView();
};

zoomOut.onclick = () => {
    if (imageLocked) return;
    scale = Math.max(0.2, scale - 0.1);
    syncView();
};

// =====================
// MODES
// =====================


normalModeBtn.onclick = () => {
    mode = "normal";
    imageStatus.textContent = "Add Pin";
};

selectModeBtn.onclick = () => {
    mode = "select";

    imageStatus.textContent = "Select Pin";
};

// =====================
// SAVE / UNLOCK IMAGE
// =====================
saveImageSetup.onclick = () => {
    localStorage.setItem("setup", JSON.stringify({ scale, posX, posY }));
    imageLocked = true;
    imageStatus.textContent = "Locked";
};

unlockImage.onclick = () => {
    imageLocked = false;
    imageStatus.textContent = "Editing";
};

// =====================
// CREATE PIN
// =====================

viewer.addEventListener("click", (e) => {
    if (e.target.classList.contains("pin")) return;
    if (!mapImage.src) return;
    if (imageLocked && mode !== "select") return;
    if (mode !== "normal") return;

    const rect = mapImage.getBoundingClientRect();
    const now = new Date();

        const id =
            now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0") +
            String(now.getHours()).padStart(2, "0") +
            String(now.getMinutes()).padStart(2, "0") +
            String(now.getSeconds()).padStart(2, "0") +
            String(now.getMilliseconds()).padStart(3,"0");

    pins.push({
        
        id: id,
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        name: "",
        status: "",
        description: ""
    });

    savePins();
    renderPins();
});

// =====================
// SELECTION BOX
// =====================
viewer.addEventListener("pointerdown", (e) => {
    if (mode !== "select") return;

    const rect = viewer.getBoundingClientRect();

    isSelecting = true;
    dragMoved = false;

    startSelectX = e.clientX - rect.left;
    startSelectY = e.clientY - rect.top;

    selectBox.style.display = "block";
    selectBox.style.left = startSelectX + "px";
    selectBox.style.top = startSelectY + "px";
    selectBox.style.width = "0px";
    selectBox.style.height = "0px";
});

document.addEventListener("pointermove", (e) => {
    if (!isSelecting) return;

    const rect = viewer.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = x - startSelectX;
    const height = y - startSelectY;

    if (Math.abs(width) > 3 || Math.abs(height) > 3) dragMoved = true;

    selectBox.style.width = Math.abs(width) + "px";
    selectBox.style.height = Math.abs(height) + "px";
    selectBox.style.left = (width < 0 ? x : startSelectX) + "px";
    selectBox.style.top = (height < 0 ? y : startSelectY) + "px";
});

document.addEventListener("pointerup", () => {
    if (!isSelecting) return;

    isSelecting = false;

    if (dragMoved) applySelectionBox();

    selectBox.style.display = "none";
});

// =====================
// SELECTION LOGIC
// =====================
function applySelectionBox() {
    
    const box = selectBox.getBoundingClientRect();

    selectedPins.clear();

    pins.forEach(pin => {
        const el = document.querySelector(`[data-id='${pin.id}']`);
        if (!el) return;

        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;

        if (
            cx >= box.left &&
            cx <= box.right &&
            cy >= box.top &&
            cy <= box.bottom
        ) {
            selectedPins.add(pin.id);
        }
    });

    updatePreview();
    renderPins();
}

// =====================
// RENDER PINS
// =====================
function renderPins() {
    if (!mapImage.src || !mapImage.complete) return;

    pinsLayer.innerHTML = "";

    const rect = mapImage.getBoundingClientRect();

    pins.forEach(pin => {
        const div = document.createElement("div");
        div.className = "pin";
        div.dataset.id = pin.id;

        if (selectedPins.has(pin.id)) div.classList.add("selected");

        div.style.left = (pin.x * rect.width) + "px";
        div.style.top = (pin.y * rect.height) + "px";

        div.onclick = (e) => {
            e.stopPropagation();

            openPin(pin);

            

            if (mode === "select") {
                if (selectedPins.has(pin.id)) selectedPins.delete(pin.id);
                else selectedPins.add(pin.id);

                updatePreview();
                renderPins();
            }
        };

        pinsLayer.appendChild(div);
    });
}

// =====================
// STORAGE
// =====================
function savePins() {

    // Local backup
    localStorage.setItem("pins", JSON.stringify(pins));

    // Save to MySQL through PHP
    fetch("save_pin.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(pins)
    })
    .then(res => res.text())
    .then(data => {
        console.log("Pins saved:", data);
    })
    .catch(err => {
        console.error("Save error:", err);
    });
}

fetch("load_pins.php")
.then(res => res.json())
.then(data => {
    pins = data;
    renderPins();
    
})
.catch(err => {

    console.error("Database unavailable, loading localStorage");

    let savedPins = localStorage.getItem("pins");

    if(savedPins){
        pins = JSON.parse(savedPins);
        renderPins();
    }
});

// =====================
// PIN EDIT
// =====================
function openPin(pin) {

    selectedPin = pin;

    pinName.value = pin.name;
    pinStatus.value = pin.status;
    pinDescription.value = pin.description;

    pinForm.classList.remove("hidden");
}

savePinBtn.onclick = () => {
    selectedPin.name = pinName.value;
    selectedPin.status = pinStatus.value;
    selectedPin.description = pinDescription.value;

    savePins();
    renderPins();
    pinForm.classList.add("hidden");
};

deletePinBtn.onclick = () => {

    if (!selectedPin) {
        alert("No pin selected.");
        return;
    }

    fetch("delete_pin.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: selectedPin.id
        })
    })
    .then(res => res.text())
    .then(data => {

        console.log(data);

        pins = pins.filter(p => p.id !== selectedPin.id);

        renderPins();
        pinForm.classList.add("hidden");

        selectedPin = null;
    })
    .catch(err => {
        console.error(err);
        alert("Failed to delete pin.");
    });

};

// =====================
// REPORT SYSTEM (FIXED FOR CHROME)
// =====================
createReportBtn.onclick = () => {
    reportForm.classList.remove("hidden");
    updatePreview();
};

saveReportBtn.onclick = (e) => {
    e.preventDefault(); // 

    const title = reportTitle.value.trim();
    const desc = reportDesc.value.trim();

    const selected = pins.filter(p => selectedPins.has(p.id));

    if (selected.length === 0) {
        alert("No pins selected for report.");
        return;
    }

    const report = {
        id: Date.now(),
        title: title || `Report ${Date.now()}`,
        desc: desc || "No description",
        pins: selected,
        createdAt: new Date().toISOString()
    };

    let reports = JSON.parse(localStorage.getItem("reports") || "[]");
    reports.push(report);

    localStorage.setItem("reports", JSON.stringify(reports));

    reportTitle.value = "";
    reportDesc.value = "";
    selectedPins.clear();

    reportForm.classList.add("hidden");

    updatePreview();
    renderPins();
    renderReports();
};
cancelReportBtn.onclick = () => {
    reportTitle.value = "";
    reportDesc.value = "";
    selectedPins.clear();
    reportForm.classList.add("hidden");
}

// =====================
// REPORT UI
// =====================
function updatePreview() {
    selectedPreview.innerHTML = pins
        .filter(p => selectedPins.has(p.id))
        .map(p => `• ${p.name || "Unnamed"} (${p.status || "No status"})`)
        .join("<br>");
}

function renderReports() {
    let reports = JSON.parse(localStorage.getItem("reports") || "[]");

    reportList.innerHTML = "";

    if (reports.length === 0) {
        reportList.innerHTML = "<p>No reports yet.</p>";
        return;
    }

    reports.forEach(r => {
        const div = document.createElement("div");
        div.className = "report-item";

        div.innerHTML = `<b>${r.title}</b><br>${r.desc}<br>Pins: ${r.pins.length}`;

        div.onclick = () => openReport(r);

        reportList.appendChild(div);
    });
}

function openReport(report) {
    activeReport = report;

    selectedPins.clear();
    report.pins.forEach(p => selectedPins.add(p.id));

    updatePreview();
    renderPins();
    renderReports();
}

// =====================
// VIEW
// =====================
function syncView() {
    mapImage.style.transform =
        `translate(${posX}px, ${posY}px) scale(${scale})`;

    requestAnimationFrame(renderPins);
}
clearPin.addEventListener("click", () => {
    if (!confirm("Clear all pins from database?")) return;

    fetch("clear_pins.php", {
        method: "POST"
    })
    .then(res => res.text())
    .then(data => {
        console.log(data);
        alert("Pins cleared from database!");

        // optional: also clear UI
        location.reload();
    })
    .catch(err => {
        console.error(err);
        alert("Failed to clear pins.");
    });
});
clearHistory.onclick = () => {
    
    // Remove from localStorage
    localStorage.removeItem("reports");

    // Refresh UI
    renderReports();

    
};

// =====================
// INIT
// =====================
renderReports();
renderPins();

}); // END DOM READY