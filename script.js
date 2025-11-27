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
const players = ["Tjuven i bagdad", "NöffNöff", "Gissa Mitt Jobb", "Piss I Handfatet"];

fetch("factions.json")
    .then(res => res.json())
    .then(async data => {
        allFactions = data;

        // render boxes first
        renderAllFactions(data);

        // load saved state
        const saved = await loadDraft();

        // create filter dropdown after restore
        setupFilterDropdown();
    });


// =======================
// RENDER MAIN VIEW
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
            if (!url.includes(".jpg")) return;
            if (key.includes("symbol")) return;

            const boxImg = document.createElement("div");
            boxImg.className = "image-box";

            const img = document.createElement("img");
            img.src = url;

            const label = document.createElement("div");
            label.className = "caption";
            label.textContent = key.replaceAll("_", " ");

            boxImg.appendChild(img);
            boxImg.appendChild(label);
            grid.appendChild(boxImg);
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
// HELPER FUNCTIONS
// =======================
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function assignFactionToPlayer(name, player) {
    const box = document.querySelector(`.faction[data-name="${name}"]`);
    if (!box) return;

    const h2 = box.querySelector("h2");
    h2.textContent = `${name} — ${player}`;
    box.dataset.player = player;
}

function clearPlayerAssignments() {
    document.querySelectorAll(".faction").forEach(box => {
        const h2 = box.querySelector("h2");
        h2.textContent = box.dataset.name;
        box.dataset.player = "";
    });
}


// =======================
// DRAFT LOGIC
// =======================
document.getElementById("draft-button").addEventListener("click", async () => {
    const pass = prompt("Enter draft password:");
    if (pass !== "hejkasper1337") return;

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

    // save complete draft to backend
    const data = {
        players: {},
        order: selected
    };

    document.querySelectorAll(".faction").forEach(box => {
        data.players[box.dataset.name] = box.dataset.player;
    });

    await saveDraft(data);

    setupFilterDropdown();
});


// =======================
// RESET DRAFT
// =======================
document.getElementById("reset-button").addEventListener("click", async () => {
    const pass = prompt("Enter reset password:");
    if (pass !== "hejkasper1337") return;

    clearPlayerAssignments();

    await fetch("https://vps.henriksadhoc.se/api/reset", { method: "POST" });

    document.getElementById("player-filter").style.display = "none";
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
// RESTORE DRAFT
// =======================
function restoreDraft(draft) {
    if (!draft || !draft.players) return;

    Object.entries(draft.players).forEach(([name, player]) => {
        if (player) assignFactionToPlayer(name, player);
    });
}
