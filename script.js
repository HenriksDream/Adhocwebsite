// =======================
// BACKEND API
// =======================
async function loadDraft() {
    const res = await fetch("https://vps.henriksadhoc.se/api/draft", {
        cache: "no-store"
    });
    return await res.json();
}

async function saveDraft(data) {
    await fetch("https://vps.henriksadhoc.se/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        cache: "no-store"
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

        renderAllFactions(data);

        const saved = await loadDraft();
        restoreDraft(saved);

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

            const ibox = document.createElement("div");
            ibox.className = "image-box";

            const img = document.createElement("img");
            img.src = url;

            const label = document.createElement("div");
            label.className = "caption";
            label.textContent = key.replaceAll("_", " ");

            ibox.appendChild(img);
            ibox.appendChild(label);
            grid.appendChild(ibox);
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
// DRAFT LOGIC
// =======================
document.getElementById("draft-button").addEventListener("click", () => {
    const pass = prompt("Enter draft password:");
    if (pass !== "hejkasper1337") return;
    runDraft();
});

async function runDraft() {
    const names = Object.keys(allFactions).slice();
    shuffle(names);

    const picks = players.length * 3;
    const selected = names.slice(0, picks);

    clearPlayerAssignments();

    let i = 0;
    selected.forEach(faction => {
        const p = players[i % players.length];
        assignFactionToPlayer(faction, p);
        i++;
    });

    setupFilterDropdown();

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
// ASSIGN + CLEAR
// =======================
function assignFactionToPlayer(name, player) {
    document.querySelectorAll(".faction").forEach(box => {
        if (box.dataset.name === name) {
            const h2 = box.querySelector("h2");
            h2.textContent = `${name} — ${player}`;
            box.dataset.player = player;
        }
    });
}

function clearPlayerAssignments() {
    document.querySelectorAll(".faction").forEach(box => {
        const h2 = box.querySelector("h2");
        h2.textContent = box.dataset.name;
        box.dataset.player = "";
    });
}


// =======================
// RESET BUTTON
// =======================
document.getElementById("reset-button").addEventListener("click", async () => {
    const pass = prompt("Enter reset password:");
    if (pass !== "hejkasper1337") return;

    clearPlayerAssignments();
    document.getElementById("player-filter").style.display = "none";

    await fetch("https://vps.henriksadhoc.se/api/reset", {
        method: "POST",
        cache: "no-store"
    });
});


// =======================
// FILTER DROPDOWN
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
// RESTORE SAVED DRAFT
// =======================
function restoreDraft(draft) {
    if (!draft || !draft.players) return;

    Object.entries(draft.players).forEach(([name, player]) => {
        if (!player) return;

        const box = document.querySelector(`.faction[data-name="${name}"]`);
        if (!box) return;

        box.dataset.player = player;

        const h2 = box.querySelector("h2");
        h2.textContent = `${name} — ${player}`;
    });

    applyPlayerFilter("all");
    setupFilterDropdown();
}


// =======================
// IMAGE ENLARGE
// =======================
const modal = document.getElementById("img-modal");
const modalImg = document.getElementById("img-modal-content");

// Only enlarge real faction images, not icons
document.addEventListener("click", (e) => {
    if (e.target.matches(".image-box img")) {
        modalImg.src = e.target.src;
        modal.style.display = "block";
    }
});

modal.addEventListener("click", () => {
    modal.style.display = "none";
});
