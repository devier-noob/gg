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
const pinEvent = document.getElementById("pinEvent");
const pinDescription = document.getElementById("pinDescription");
const pinEventLogs = document.getElementById("pinEventLogs");


const savePinBtn = document.getElementById("savePinBtn");
const deletePinBtn = document.getElementById("deletePinBtn");
const eventBtns = document.querySelectorAll(".eventBtn");

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
const pinContainerList = document.getElementById("pinContainerList");
const eventDrop =document.getElementById("eventDrop");
// date format
const now =new Date();
// =====================
// STATE
// =====================
let scale = 1;
let posX = 0;
let posY = 0;

let imageLocked = false;

let pins = [];
let selectedPin = null;

let mode = null;

let selectedPins = new Set();

let isSelecting = false;
let startSelectX = 0;
let startSelectY = 0;

let dragMoved = false;

let activeReport = null;
let tempEvent = [];

function addActivityLog(action, details = "") {

    const log = document.createElement("div");

    log.className = "report-item";

    log.innerHTML = `
        <b>${action}</b><br>
        ${details}<br>
        <small>${new Date().toLocaleString()}</small>
    `;

    reportList.prepend(log);
}
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
eventDrop.onclick = () => {
    pinEvent.classList.toggle("hidden");
}

normalModeBtn.onclick = () => {
    if(imageLocked === true)return;
        mode = "normal";
        imageStatus.textContent = "Add Pin";
        normalModeBtn.style.backgroundColor = "blue";
        unlockImage.style.backgroundColor = "blue";
        addActivityLog("Mode Changed", "Add Pin Mode");
        
};



selectModeBtn.onclick = () => {
    mode = "select";
    normalModeBtn.style.backgroundColor = "#1f2937";
    imageStatus.textContent = "Select Pin";
    addActivityLog("Mode Changed", "Select Mode");
};

// =====================
// SAVE / UNLOCK IMAGE
// =====================
saveImageSetup.onclick = () => {
    localStorage.setItem("setup", JSON.stringify({ scale, posX, posY }));
    imageLocked = true;
    unlockImage.style.backgroundColor = "#1f2937";
    normalModeBtn.style.backgroundColor = "#1f2937";
    saveImageSetup.style.backgroundColor = "blue";
    imageStatus.textContent = "Locked";
    addActivityLog("Image Locked");
};

unlockImage.onclick = () => {
    imageLocked = false;
    mode = null;

    saveImageSetup.style.backgroundColor = "#1f2937";
    unlockImage.style.backgroundColor = "blue";
    imageStatus.textContent = "Editing";
    addActivityLog("Image Unlocked");
};

// =====================
// CREATE PIN
// =====================
eventBtns.forEach(btn => {
    btn.addEventListener("click", () => {

        if (!selectedPin) {
            alert("Select a pin first.");
            return;
        }

        if (!Array.isArray(selectedPin.event)) {
            selectedPin.event = [];
        }

        selectedPin.event.push(btn.value);

        savePins(); // save to DB

        renderEventLogs(); // update UI immediately

        addActivityLog(
            "Event Updated",
            `${selectedPin.id} → ${selectedPin.event.join(", ")}`
        );
    });
});
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
        String(now.getMilliseconds()).padStart(3, "0");

    const newPin = {
        id: id,
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        name: "",
        status: "",
        event: [],
        description: ""
    };

    pins.push(newPin);

    // Activity Log
    addActivityLog(
        "Pin Created",
        `ID: ${newPin.id}`
    );

    renderPinContainer();
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
    console.log("Loaded pins:", data);
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
    if (!Array.isArray(selectedPin.event)) {

        if (typeof selectedPin.event === "string" && selectedPin.event.trim() !== "") {
            try {
                selectedPin.event = JSON.parse(selectedPin.event);
            } catch {
                selectedPin.event = [];
            }
        } else {
            selectedPin.event = [];
        }
    }

    pinForm.classList.remove("hidden");
    pinEventLogs.classList.remove("hidden");
    renderEventLogs();
}

savePinBtn.onclick = () => {
    

    selectedPin.name = pinName.value;
    selectedPin.status = pinStatus.value;
    selectedPin.event = selectedPin.event || "";
    selectedPin.description = pinDescription.value;
    
    addActivityLog(
        "Pin Updated",
        `ID: ${selectedPin.id}`
    );

    savePins();
    console.log(selectedPin);
    console.log("Pin after save:", selectedPin);
    renderPins();
    pinForm.classList.add("hidden");
    pinEventLogs.classList.add("hidden");
    
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
        pinEventLogs.classList.add("hidden");
        

        const deletedId = selectedPin.id;

        pins = pins.filter(p => p.id !== selectedPin.id);

        selectedPin = null;

        addActivityLog(
            "Pin Deleted",
            `ID: ${deletedId}`
        );
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
    renderPinContainer();
};


cancelReportBtn.onclick = () => {
    reportForm.classList.add("hidden");
};

// =====================
// REPORT UI
// =====================
function renderEventLogs() {
    const container = document.getElementById("eventLogs");

    container.innerHTML = "";

    if (!selectedPin || !Array.isArray(selectedPin.event)) return;

    selectedPin.event.forEach((ev, index) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.padding = "5px 8px";
        row.style.marginBottom = "5px";
        row.style.background = "#f3f4f6";
        row.style.borderRadius = "6px";


        const text = document.createElement("span");
        text.textContent = ev;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "✖";
        removeBtn.style.background = "#f3f4f6";
        removeBtn.style.color = "#1f2937";
        removeBtn.style.padding = "2px 6px";
        removeBtn.style.borderRadius = "50%";

        removeBtn.onclick = () => {
            selectedPin.event.splice(index, 1); // remove from array
            savePins(); // update DB/localStorage
            renderEventLogs(); // refresh UI

            addActivityLog(
                "Event Removed",
                `${ev} removed from Pin ${selectedPin.id}`
            );
        };

        row.appendChild(text);
        row.appendChild(removeBtn);

        container.appendChild(row);
    });
}

function renderPinContainer() {
    pinContainerList.innerHTML = "";
    now.getDate();


    if (pins.length === 0) {
        pinContainerList.innerHTML = "<p>No pins created.</p>";
        return;
    }

    pins.forEach(pin => {
        const div = document.createElement("div");
        div.className = "report-item";

        div.innerHTML = `
            <b>${pin.name || "Unnamed Pin"}</b><br>
            Status: ${pin.status || "No status"}<br>
            <small>ID: ${pin.id}</small>


           
            
        `;
        // <small>Date: ${pin.Date()}</small>
        

        div.onclick = () => {
            openPin(pin); // ✅ KEEP YOUR EXISTING LOGIC
            reportForm.classList.add("hidden"); // close panel after click
        };
        pinContainerList.appendChild(div);
        
    });
}

function openReport(report) {
    activeReport = report;

    selectedPins.clear();
    report.pins.forEach(p => selectedPins.add(p.id));

    
    renderPins();
    renderPinContainer();
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
    if (!confirm("Clear all pins and reports from database?")) return;

    fetch("clear_pins.php", {
        method: "POST"
    })
    .then(res => res.text())
    .then(data => {
        console.log(data);

        // ✅ CLEAR LOCAL PINS + REPORTS
        localStorage.removeItem("pins");
        localStorage.removeItem("reports");

        pins = [];
        selectedPins.clear();

        renderPins();
        renderPinContainer();

        addActivityLog("All Pins Deleted");

        alert("Pins and reports cleared!");
        pinForm.classList.add("hidden");
        
    })
    .catch(err => {
        console.error(err);
        alert("Failed to clear pins.");
    });
});
clearHistory.onclick = () => {
    
    // Remove from localStorage
    localStorage.removeItem("reports");
    reportList.innerHTML = "";

    // Refresh UI
    renderPinContainer();

    
};

// =====================
// INIT
// =====================
renderPinContainer();
renderPins();

}); // END DOM READY
