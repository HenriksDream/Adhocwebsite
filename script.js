const PROXY = "http://127.0.0.1:5005/img?url=";
const JSON_FILE = "factions_remote.json";

function prox(url) {
    return PROXY + encodeURIComponent(url);
}

fetch(JSON_FILE)
    .then(r => r.json())
    .then(factions => {
        const container = document.getElementById("faction-container");

        Object.entries(factions).forEach(([name, data]) => {
            const factionBox = document.createElement("div");
            factionBox.className = "faction";

            // HEADER
            const header = document.createElement("div");
            header.className = "faction-header";

            // Symbol next to name
            let symbol = document.createElement("img");
            symbol.src = prox(data.symbol);
            symbol.onerror = () => symbol.style.display = "none";

            const title = document.createElement("h2");
            title.textContent = name;

            header.appendChild(symbol);
            header.appendChild(title);

            // CONTENT (hidden until clicked)
            const content = document.createElement("div");
            content.className = "faction-content";

            // Keys → labels
            const order = [
                ["home_system", "Home System"],
                ["agent", "Agent"],
                ["commander", "Commander"],
                ["hero", "Hero"],
                ["mech", "Mech"],
                ["faction_tech_1", "Faction Tech I"],
                ["faction_tech_2", "Faction Tech II"],
                ["breakthrough", "Breakthrough"],
                ["promissory", "Promissory Note"],
                ["flagship_front", "Flagship (Front)"],
                ["flagship_back", "Flagship (Back)"]
            ];

            order.forEach(([key, label]) => {
                if (data[key]) {
                    const titleEl = document.createElement("div");
                    titleEl.className = "category-title";
                    titleEl.textContent = label;

                    const grid = document.createElement("div");
                    grid.className = "image-grid";

                    const img = document.createElement("img");
                    img.src = prox(data[key]);

                    grid.appendChild(img);
                    content.appendChild(titleEl);
                    content.appendChild(grid);
                }
            });

            // Toggle collapse
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
        document.body.innerHTML +=
            `<div style="color:red">Failed to load JSON: ${err}</div>`;
    });
