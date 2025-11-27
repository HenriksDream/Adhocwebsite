// =====================================================
// LOAD ALL FACTIONS (do not render anything at startup)
// =====================================================

let allFactions = {};

function prox(p) {
    return p; // no proxying needed
}

fetch("factions.json")
    .then(r => r.json())
    .then(data => allFactions = data)
    .catch(err => console.error("Error loading factions.json:", err));


// =====================================================
// RENDER A FACTION'S DETAILS (images grid)
// =====================================================

function renderFactionDetails(name) {
    const data = allFactions[name];
    if (!data) return null;

    const wrapper = document.createElement("div");
    wrapper.className = "draft-details"; // NOT .faction

    const grid = document.createElement("div");
    grid.className = "big-image-grid";

    const mapping = {
        home_system: "Home System",
        agent: "Agent",
        commander: "Commander",
        hero: "Hero",
        mech: "Mech",
        faction_tech_1: "Faction Tech I",
        faction_tech_2: "Faction Tech II",
        breakthrough: "Breakthrough",
        promissory: "Promissory",
        faction_sheet_front: "Faction Sheet (Front)",
        faction_sheet_back: "Faction Sheet (Back)"
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

    wrapper.appendChild(grid);
    return wrapper;
}


// =====================================================
// DRAFT SYSTEM
// =====================================================

function pickRandomFactions(n) {
    const keys = Object.keys(allFactions);
    return keys
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, n);
}

function renderDraftResult(list) {
    const results = document.getElementById("draft-results");
    results.innerHTML = "";

    list.forEach(name => {
        // Draft entry — NOT the .faction class
        const entry = document.createElement("div");
        entry.className = "draft-entry";

        // Clickable header
        const header = document.createElement("div");
        header.className = "faction-header";

        const icon = document.createElement("img");
        icon.className = "faction-icon";
        icon.src = prox(allFactions[name].symbol);

        const title = document.createElement("h2");
        title.textContent = name;

        header.appendChild(icon);
        header.appendChild(title);
        entry.appendChild(header);

        let expanded = null;

        // Toggle expand/collapse
        header.addEventListener("click", () => {
            if (expanded) {
                expanded.remove();
                expanded = null;
                return;
            }

            expanded = renderFactionDetails(name);
            entry.appendChild(expanded);
        });

        results.appendChild(entry);
    });
}


// =====================================================
// DRAFT BUTTON
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
