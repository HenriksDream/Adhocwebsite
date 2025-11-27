// =====================================================
//  LOAD ALL FACTIONS (but don't display anything yet)
// =====================================================

let allFactions = {};

function prox(p) {
    return p; // keep as-is (your proxy handler)
}

fetch("factions.json")
    .then(r => r.json())
    .then(data => allFactions = data)
    .catch(err => console.error("Error loading factions.json:", err));


// =====================================================
//  RENDER A SINGLE FACTION'S IMAGES
// =====================================================
function renderFactionDetails(name) {
    const data = allFactions[name];
    if (!data) return null;

    const wrapper = document.createElement("div");
    wrapper.className = "faction";

    const header = document.createElement("div");
    header.className = "faction-header";

    const icon = document.createElement("img");
    icon.src = prox(data.symbol);
    icon.className = "faction-icon";

    const title = document.createElement("h2");
    title.textContent = name;

    header.appendChild(icon);
    header.appendChild(title);
    wrapper.appendChild(header);

    const content = document.createElement("div");
    content.className = "faction-content";
    content.style.display = "block";

    const grid = document.createElement("div");
    grid.className = "big-image-grid";

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
    wrapper.appendChild(content);

    return wrapper;
}


// =====================================================
//  DRAFT SYSTEM
// =====================================================

function pickRandomFactions(n) {
    const keys = Object.keys(allFactions);
    return keys
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, n);
}

function renderDraftResult(list) {
    const box = document.getElementById("draft-results");
    box.innerHTML = "";

    list.forEach(name => {
        const entry = document.createElement("div");
        entry.className = "faction";
        entry.style.cursor = "pointer";

        entry.innerHTML = `
            <div class="faction-header">
                <img class="faction-icon" src="${prox(allFactions[name].symbol)}">
                <h2>${name}</h2>
            </div>
        `;

        // On click → show full details BELOW this entry
        entry.addEventListener("click", () => {
            // Remove old open sections
            const old = entry.querySelector(".draft-expanded");
            if (old) old.remove();

            // Add new viewer
            const details = renderFactionDetails(name);
            details.classList.add("draft-expanded");
            entry.appendChild(details);
        });

        box.appendChild(entry);
    });
}


// =====================================================
//  BUTTON LISTENER
// =====================================================
document.getElementById("draft-button").addEventListener("click", () => {
    const name = document.getElementById("player-name").value.trim();
    if (!name) {
        alert("Enter your name");
        return;
    }

    const picks = pickRandomFactions(3);
    renderDraftResult(picks);
});
