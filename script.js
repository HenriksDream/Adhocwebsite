// Load the correct JSON file
const JSON_FILE = "factions.json";

// No proxy needed since all images are inside the repo
function prox(url) {
    return url;
}

fetch(JSON_FILE)
    .then(r => r.json())
    .then(factions => {
        const container = document.getElementById("faction-container");

        Object.entries(factions).forEach(([name, data]) => {

            // OUTER BOX
            const factionBox = document.createElement("div");
            factionBox.className = "faction";

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

            // CONTENT (starts collapsed)
            const content = document.createElement("div");
            content.className = "faction-content";

            // GRID container (ALL IMAGES GO HERE)
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

                // IMAGE WRAPPER
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

            // CLICK TO EXPAND/COLLAPSE
            header.onclick = () => {
                content.style.display =
                    content.style.display === "block" ? "none" : "block";
            };

            factionBox.appendChild(header);
            factionBox.appendChild(content);
            container.appendChild(factionBox);
        });
    })
    .catch(err => {
        console.error("Error loading factions.json:", err);
    });
