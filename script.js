//----------------------------------------------------
// API HELPERS
//----------------------------------------------------
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

//----------------------------------------------------
// GLOBALS
//----------------------------------------------------
let allFactions = {};
const players = ["Tjuven i bagdad", "NöffNöff", "Gissa Mitt Jobb", "Piss I Handfatet"];

//----------------------------------------------------
// LOAD STATIC FACTION IMAGES
//----------------------------------------------------
fetch("factions.json")
    .then(r => r.json())
    .then(data => {
        allFactions = data;
        renderAllFactions(data);

        // AFTER the DOM exists → restore draft
        restoreDraft();
    });


//----------------------------------------------------
// RENDER FACTIONS
//----------------------------------------------------
function renderAllFactions(factions) {
    const container = document.getElementById("faction-container");
    container.innerHTML = "";

    Object.entries(factions).forEach(([name, data]) => {
        const box = document.createElement("div");
        box.className = "faction";
        box.dataset.name = name;           // keep original
        box.dataset.player = "";           // will be overwritten by restoreDraft()

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

            const caption = document.createElement("div");
            caption.className = "caption";
            caption.textContent = key.replaceAll("_", " ");

            imgBox.appendChild(img);
            imgBox.appendChild(caption);
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


//----------------------------------------------------
// ASSIGN FACTION
//----------------------------------------------------
function assignFactionToPlayer(factionName, playerName) {
    const boxes = document.querySelectorAll(".faction");
    boxes.forEach(box => {
        if (box.dataset.name === factionName) {
            box.dataset.player = playerName;
            const h2 = box.querySelector("h2");
            h2.textContent = playerName
                ? `${factionName} — ${playerName}`
                : factionName;
        }
    });
}


//----------------------------------------------------
// CLEAR (used only by reset button)
//----------------------------------------------------
function clearAssignments() {
    document.querySelectorAll(".faction").forEach(box => {
        box.dataset.player = "";
        box.querySelector("h2").textContent = box.dataset.name;
    });
}


//----------------------------------------------------
// DRAFT BUTTON
//----------------------------------------------------
document.getElementById("draft-button").addEventListener("click", async () => {
    const pass = prompt("Enter draft password:");
    if (pass !== "hejkasper1337") return;

    runDraft();
});

function runDraft() {
    const factionNames = Object.keys(allFactions).slice();
    shuffle(factionNames);

    const picks = players.length * 3;
    const selected = factionNames.slice(0, picks);

    clearAssignments(); // only here – NOT on page load

    let i = 0;
    selected.forEach(f => {
        assignFactionToPlayer(f, players[i % players.length]);
        i++;
    });

    // SAVE TO API
    const payload = {
        players: Object.fromEntries(
            Array.from(document.querySelectorAll(".faction"))
                .map(box => [box.dataset.name, box.dataset.player])
        ),
        order: selected
    };

    saveDraft(payload);
}


//----------------------------------------------------
// RESET BUTTON
//----------------------------------------------------
document.getElementById("reset-button").addEventListener("click", async () => {
    const pass = prompt("Enter reset password:");
    if (pass !== "hejkasper1337") return;

    clearAssignments();
    await fetch("https://vps.henriksadhoc.se/api/reset", { method: "POST" });
});


//----------------------------------------------------
// ON PAGE LOAD → RESTORE DRAFT
//----------------------------------------------------
async function restoreDraft() {
    const saved = await loadDraft();
    if (!saved.players) return;

    Object.entries(saved.players).forEach(([faction, player]) => {
        if (player) assignFactionToPlayer(faction, player);
    });
}


//----------------------------------------------------
// UTILS
//----------------------------------------------------
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
