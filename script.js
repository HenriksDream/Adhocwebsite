// --- FANDOM IMAGE FIX -------------------------------------------------------
// Fandom blocks hotlinking unless URLs include /revision/latest?cb=#
function fandomFix(url) {
    if (!url) return null;

    // Already fixed?
    if (url.includes("/revision/")) return url;

    // If it's a nocookie.net image, patch it
    if (url.includes("nocookie.net")) {
        return url + "/revision/latest?cb=1";
    }

    return url;
}
// ----------------------------------------------------------------------------


// Load factions JSON (REMOTE IMAGE URL VERSION)
fetch("factions_remote.json")
    .then(r => r.json())
    .then(data => {
        const factionName = "The Arborec"; // test one faction
        const faction = data[factionName];

        const results = document.getElementById("results");
        results.innerHTML = ""; // clear old


        if (!faction) {
            results.innerHTML =
                `<div style="color:white">Faction "${factionName}" not found in JSON.</div>`;
            return;
        }

        // Create display wrapper
        const box = document.createElement("div");
        box.style.textAlign = "center";
        box.style.color = "white";
        box.style.marginTop = "30px";

        box.innerHTML = `<h2>${factionName}</h2>`;

        // Desired display order
        const keys = [
            "symbol",
            "home_system",
            "agent",
            "commander",
            "hero",
            "mech",
            "faction_tech_1",
            "faction_tech_2",
            "breakthrough",
            "promissory",
            "flagship_front",
            "flagship_back"
        ];

        keys.forEach(key => {
            let url = faction[key];

            if (!url) return;

            // Apply hotlink fix
            url = fandomFix(url);

            // Create image element
            const img = document.createElement("img");
            img.src = url;
            img.style.width = "300px";
            img.style.margin = "20px auto";
            img.style.display = "block";
            img.style.border = "1px solid white";

            // Fallback if image fails to load
            img.onerror = () => {
                img.style.border = "1px solid red";
                img.alt = "Image failed to load";
            };

            box.appendChild(img);
        });

        results.appendChild(box);
    })
    .catch(err => {
        document.getElementById("results").innerHTML =
            `<div style='color:white'>Error loading JSON: ${err}</div>`;
    });
