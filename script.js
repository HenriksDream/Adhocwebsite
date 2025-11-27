// =====================================================
//  LOADING & RENDERING ALL FACTIONS (original viewer)
// =====================================================

const JSON_FILE = "factions.json";

// Proxy helper (your original code used this)
function prox(path) {
    return path; // no proxying needed unless you use proxy.py
}

let allFactions = {};

fetch(JSON_FILE)
    .then(r => r.json())
    .then(factions => {
        allFactions = factions;
        renderAllFactions(factions);
    })
    .catch(err => console.error("Error loading factions.json:", err));


// -------- Render all factions on the page ----------
function renderAllFactions(factions) {
    const container = document.getElementById("faction-container");

    Object.entries(factions).forEach(([name, data]) => {

        // OUTER BOX
        const factionBox = document.createElement("div");
        factionBox.className = "faction";

        // ADD UNIQUE ID (required for draft scrolling)
        factionBox.id = "faction-" + name.replace(/\s+/g, "-");

        // HEADER
        const header = document.createElement("div");
        header.className = "faction-header";

        const icon = document.createElement("img");
        icon.src = prox(data.symbol);
        icon.className = "faction-icon";

        const title = document.createElement("h2");
        title.textContent = name;

        header.appendChild(icon);
        header.appendChild(title);

        // COLLAPSIBLE CONTENT
        const content = document.createElement("div");
        content.className = "faction-content";

        const grid = document.createElement("div");
        grid.className = "big-image-grid";

        // MAP JSON KEYS TO LABELS
        const mapping = {
            "home_system": "Home System",
            "agent": "Agent",
            "commander": "Commander",
            "hero": "Hero",
            "mech": "Mech",
            "faction_tech_1": "Faction Tech I",
            "faction_tech_2": "Faction Tech II",
            "breakthrough": "Breakthrough",
            "promissory": "Promissory",
            "flagship_front": "Flagship (Front)",
            "flagship_back": "Flagship (Back)",
            "faction_sheet_front": "Faction Sheet (Front)",
            "faction_sheet_back": "Faction Sheet (Back)"
        };

        Object.entries(mapping).forEach(([key, label]) => {
            if (!data[key]) return;

            const box = document.createElement("div");
            box.className = "image-box";

            const img = document.createElement("img");
            img.src = prox(data[key]);

            const caption = document.createElement("div");
            caption.className = "caption";
            caption.textContent = label;

            box.appendChild(img);
            box.appendChild(caption);
            grid.appendChild(box);
        });

        content.appendChild(grid);

        // CLICK TO TOGGLE
        header.onclick = () => {
            content.style.display =
                content.style.display === "block" ? "none" : "block";
        };

        factionBox.appendChild(header);
        factionBox.appendChild(content);
        container.appendChild(factionBox);
    });
}



// =====================================================
//  DRAFTING SYSTEM (3 random factions per player)
// =====================================================

// Pick N random factions
function pickRandomFactions(n) {
    const keys = Object.keys(allFactions);
    return keys
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, n);
}


// Render the draft result tiles
function renderDraftResult(factions) {
    const container = document.getElementById("draft-results");
    container.innerHTML = "";

    factions.forEach(name => {
        const box = document.createElement("div");
        box.className = "faction";
        box.style.cursor = "pointer";

        box.innerHTML = `
            <div class="faction-header">
                <img class="faction-icon" src="${prox(allFactions[name].symbol)}">
                <h2>${name}</h2>
            </div>
        `;

        // Clicking a draft pick scrolls to the full faction block
        box.addEventListener("click", () => {
            const id = "faction-" + name.replace(/\s+/g, "-");
            const realSection = document.getElementById(id);
            if (!realSection) return;

            realSection.scrollIntoView({ behavior: "smooth" });

            const content = realSection.querySelector(".faction-content");
            if (content) content.style.display = "block";
        });

        container.appendChild(box);
    });
}


// Draft button
document.getElementById("draft-button").addEventListener("click", () => {
    const playerName = document.getElementById("player-name").value.trim();

    if (!playerName) {
        alert("Enter your name");
        return;
    }

    const picks = pickRandomFactions(3);
    renderDraftResult(picks);
});
