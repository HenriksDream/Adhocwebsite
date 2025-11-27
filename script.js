// =======================
// BACKEND API
// =======================
async function loadDraft() {
    const res = await fetch("https://vps.henriksadhoc.se/api/draft");
    return await res.json();
}

async function saveDraft(data) {
    await fetch("https://vps.henriksadhoc.se/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}


// =======================
// DATA + INITIAL LOAD
// =======================
let allFactions = {};
const players = [
    "Tjuven i bagdad",
    "NöffNöff",
    "Gissa Mitt Jobb",
    "Piss I Handfatet"
];

fetch("factions.json")
    .then(res => res.json())
    .then(async data => {
        allFactions = data;
        renderAllFactions(data);

        // restore saved draft AFTER render
        const draft = await loadDraft();
        restoreDraft(draft);
    });


// =======================
// RENDER FACTIONS
// =======================
function renderAllFactions(factions) {
    const container = document.getElementById("faction-container");
    container.innerHTML = "";

    Object.entries(factions).forEach(([name, data]) => {
        const box = document.createElement("div");
        box.className = "faction";
        box.dataset.name = name;
        box.dataset.player = "";

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

        const content = document.createElement("div");
        content.className = "faction-content";

        const grid = document.createElement("div");
        grid.className = "big-image-grid";

        Object.entries(data).forEach(([key, url]) => {
            if (!url.endsWith(".jpg")) return;
            if (key.includes("symbol")) return;

            const imgBox = document.createElement("div");
            imgBox.className = "image-box";

            const img = document.createElement("img");
            img.src = url;

            const label = document.createElement("div");
            label.className = "caption";
            label.textContent = key.replaceAll("_", " ");

            imgBox.appendChild(img);
            imgBox.appendChild(label);
            grid.appendChild(imgBox);
        });

        content.appendChild(grid);

        header.onclick = () => {
            content.style.display =
                content.style.display === "block" ? "none" : "block";
        };

        box.appendChild(header);
        box.appendChild(content);
        container.appendChild(box);
    });
}


// =======================
// SHUFFLE
// =======================
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}


// =======================
// DRAFT
// =======================
document.getElementById("draft-button").addEventListener("click", async () => {
    const pass = prompt("Enter draft password:");
    if (pass !== "hejkasper1337") return;

    await runDraft();
});

async function runDraft() {
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

    // SAVE DRAFT
    const draft = {
        players: {},
        order: selected
    };

    document.querySelectorAll(".faction").forEach(box => {
        draft.players[box.dataset.name] = box.dataset.player;
    });

    await saveDraft(draft);
}


// =======================
// ASSIGN / CLEAR
// =======================
function assignFactionToPlayer(name, player) {
    document.querySelectorAll(".faction").forEach(box => {
        if (box.dataset.name === name) {
            box.dataset.player = player;
            box.querySelector("h2").textContent = `${name} — ${player}`;
        }
    });
}

function clearPlayerAssignments() {
    document.querySelectorAll(".faction").forEach(box => {
        box.dataset.player = "";
        box.querySelector("h2").textContent = box.dataset.name;
    });
}


// =======================
// RESET
// =======================
document.getElementById("reset-button").addEventListener("click", async () => {
    const pass = prompt("Enter reset password:");
    if (pass !== "hejkasper1337") return;

    clearPlayerAssignments();
    document.getElementById("player-filter").style.display = "none";

    await fetch("https://vps.henriksadhoc.se/api/reset", { method: "POST" });
});


// =======================
// FILTER
// =======================
function setupFilterDropdown() {
    const filter = document.getElementById("player-filter");
    filter.style.display = "inline-block";

    filter.innerHTML = `<option value="all">Show All Factions</option>`;
    players.forEach(p => {
        filter.innerHTML += `<option value="${p}">${p}</option>`;
    });

    filter.onchange = () => applyPlayerFilter(filter.value);
}

function applyPlayerFilter(player) {
    document.querySelectorAll(".faction").forEach(box => {
        box.style.display =
            player === "all" || box.dataset.player === player
                ? "block"
                : "none";
    });
}


// =======================
// RESTORE FROM SERVER
// =======================
function restoreDraft(draft) {
    if (!draft || !draft.players) return;

    Object.entries(draft.players).forEach(([faction, player]) => {
        if (player) assignFactionToPlayer(faction, player);
    });

    setupFilterDropdown();
}
