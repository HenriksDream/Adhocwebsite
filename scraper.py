import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE = "https://twilight-imperium.fandom.com"
FACTIONS_URL = BASE + "/wiki/Factions"

OUTPUT = "factions_remote.json"

# IMPORTANT: Only keep these keys in the final JSON
WANTED_KEYS = {
    "symbol": ["symbol"],
    "home_system": ["home", "system"],
    "agent": ["agent"],
    "commander": ["commander"],
    "hero": ["hero"],
    "mech": ["mech"],
    "faction_tech_1": ["tech"],
    "faction_tech_2": ["tech"],
    "breakthrough": ["breakthrough"],
    "promissory": ["promissory", "stymie"],
    "flagship_front": ["flagship", "sheet", "front"],
    "flagship_back": ["flagship", "sheet", "back"]
}


def strip_revision(url):
    """Remove /revision/latest/... and ?cb= etc."""
    if url is None:
        return None
    if "/revision/" in url:
        url = url.split("/revision/")[0]
    if "?" in url:
        url = url.split("?")[0]
    return url


def classify_image(url, alt):
    """Return the correct key for this image based on filename/alt."""
    alt = alt.lower()

    for key, keywords in WANTED_KEYS.items():
        if all(word in alt for word in keywords):
            return key

    # Try filename-based detection
    filename = url.split("/")[-1].lower()
    for key, keywords in WANTED_KEYS.items():
        if any(word in filename for word in keywords):
            return key

    return None


def scrape_faction_page(url):
    """Scrape one faction page for remote image URLs."""
    r = requests.get(url)
    soup = BeautifulSoup(r.text, "html.parser")

    result = {key: None for key in WANTED_KEYS.keys()}

    for img in soup.select("img"):
        src = img.get("data-src") or img.get("src")
        if not src:
            continue

        # Only accept twilight-imperium-4 images
        if "twilight-imperium-4" not in src:
            continue

        clean = strip_revision(src)
        alt = img.get("alt", "")

        key = classify_image(clean, alt)
        if key:
            # first image fills tech_1, second fills tech_2
            if key == "faction_tech_1" and result["faction_tech_1"] is not None:
                key = "faction_tech_2"

            result[key] = clean

    return result


def main():
    print("Scraping faction list...")
    r = requests.get(FACTIONS_URL)
    soup = BeautifulSoup(r.text, "html.parser")

    factions = {}

    # All faction links in the table
    links = soup.select("table a[href*='/wiki/']")
    for a in links:
        name = a.text.strip()
        href = a.get("href")

        if not name or not href:
            continue

        # Eliminate non-faction entries
        if ":" in href:
            continue

        url = urljoin(BASE, href)
        print("Scraping:", name)

        data = scrape_faction_page(url)
        factions[name] = data

    # Save clean JSON
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(factions, f, indent=2, ensure_ascii=False)

    print("\nDONE. OUTPUT:", OUTPUT)


if __name__ == "__main__":
    main()
