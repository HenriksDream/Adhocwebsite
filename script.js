async function loadDraft() {
    const res = await fetch("https://vps.henriksadhoc.se/api/draft");
    return await res.json();
}

async function saveDraft(data) {
    await fetch("https://vps.henriksadhoc.se/api/draft", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
}

let allFactions = {};
const players = ["Tjuven i bagdad", "NöffNöff", "Gissa Mitt Jobb", "Piss I Handfatet"];

// Load all factions
fetch("factions.json")
    .then(res => res.json())
    .then(data => {
        allFactions = data;
        renderAllFactions(data);
    });


// ---------------------------------------------------------
// RENDER MAIN FACTION VIEWER
// ---------------------------------------------------------
function renderAllFactions(factions) {
    const container = document.getElementById("faction-container");
    container.innerHTML = "";

    Object.entries(factions).forEach(([name, data]) => {
        const factionBox = document.createElement("div");
        factionBox.className = "faction";
        factionBox.dataset.name = name; // store base name
        factionBox.dataset.player = ""; // player assignment

        // Header
        const header = document.createElement("div");
        header.className = "faction-header";

        const iconKey = Object.keys(data).find(k => k.includes("symbol"));
        const icon = document.createElement("img");
        icon.src = data[iconKey];
        icon.className = "faction-icon";

        const title = document.createElement("h2");
        title.textContent = name;

        header.appendChild(icon);
        header.appendChild(title);

        // Collapsible content
        const content = document.createElement("div");
        content.className = "faction-content";

        const grid = document.createElement("div");
        grid.className = "big-image-grid";

        Object.entries(data).forEach(([key, url]) => {
            if (!url.includes(".jpg")) return;

            // Skip symbols, already used
            if (key.includes("symbol")) return;

            const box = document.createElement("div");
            box.className = "image-box";

            const img = document.createElement("img");
            img.src = url;

            const label = document.createElement("div");
            label.className = "caption";
            label.textContent = key.replaceAll("_", " ");

            box.appendChild(img);
            box.appendChild(label);
            grid.appendChild(box);
        });

        content.appendChild(grid);

        header.onclick = () => {
            content.style.display =
                content.style.display === "block" ? "none" : "block";
        };

        factionBox.appendChild(header);
        factionBox.appendChild(content);
        container.appendChild(factionBox);
    });
}


// ---------------------------------------------------------
// SHUFFLE
// ---------------------------------------------------------
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}


// ---------------------------------------------------------
// DRAFT LOGIC
// ---------------------------------------------------------
document.getElementById("draft-button").addEventListener("click", () => {
    const pass = prompt("Enter draft password:");
    if (pass !== "hejkasper1337") return;

    runDraft();
});


function runDraft() {
    const factionNames = Object.keys(allFactions).slice();
    shuffle(factionNames);

    const picksNeeded = players.length * 3;
    const selected = factionNames.slice(0, picksNeeded);

    clearPlayerAssignments();

    let i = 0;
    selected.forEach(faction => {
        const p = players[i % players.length];
        assignFactionToPlayer(faction, p);
        i++;
    });

    setupFilterDropdown();
    saveDraft({
    players: Object.fromEntries(
        Array.from(document.querySelectorAll(".faction"))
            .map(box => [box.dataset.name, box.dataset.player])
    ),
    order: ["dummy"]  // just something for now
});
    
}


// Assign a faction
function assignFactionToPlayer(factionName, playerName) {
    const boxes = document.querySelectorAll(".faction");

    boxes.forEach(box => {
        if (box.dataset.name === factionName) {
            const h2 = box.querySelector("h2");
            h2.textContent = `${factionName} — ${playerName}`;
            box.dataset.player = playerName;
        }
    });
}


// Clear previous draft
function clearPlayerAssignments() {
    const boxes = document.querySelectorAll(".faction");
    boxes.forEach(box => {
        const h2 = box.querySelector("h2");
        h2.textContent = box.dataset.name;
        box.dataset.player = "";
    });
}


// ---------------------------------------------------------
// RESET DRAFT
// ---------------------------------------------------------
document.getElementById("reset-button").addEventListener("click", () => {
    const pass = prompt("Enter reset password:");
    if (pass !== "hejkasper1337") return;

    clearPlayerAssignments();
    document.getElementById("player-filter").style.display = "none";
});


// ---------------------------------------------------------
// PLAYER FILTER DROPDOWN
// ---------------------------------------------------------
function setupFilterDropdown() {
    const filter = document.getElementById("player-filter");
    filter.style.display = "inline-block";

    // Fill dropdown
    filter.innerHTML = `<option value="all">Show All Factions</option>`;
    players.forEach(p => {
        filter.innerHTML += `<option value="${p}">${p}</option>`;
    });

    filter.onchange = () => applyPlayerFilter(filter.value);
}

function applyPlayerFilter(player) {
    const boxes = document.querySelectorAll(".faction");

    boxes.forEach(box => {
        if (player === "all") {
            box.style.display = "block";
        } else {
            box.style.display =
                box.dataset.player === player ? "block" : "none";
        }
    });
}

loadDraft().then(d => {
    if (!d.players) return;

    Object.entries(d.players).forEach(([faction, player]) => {
        if (player) assignFactionToPlayer(faction, player);
    });
});