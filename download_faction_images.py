import os
import json
import requests
from urllib.parse import urlparse, unquote

# ---------------------------------------------------------
# Helper: download a file
# ---------------------------------------------------------
def download(url, path):
    if url is None:
        return None
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)

        # Scale sheets: 500 → 1000
        if "scale-to-width-down/500" in url:
            url = url.replace("scale-to-width-down/500", "scale-to-width-down/1000")

        print("Downloading:", url)
        r = requests.get(url, timeout=20)
        if r.status_code == 200:
            with open(path, "wb") as f:
                f.write(r.content)
            return path
        else:
            print("FAILED:", url, "Status:", r.status_code)
            return None
    except Exception as e:
        print("ERROR:", url, e)
        return None


# ---------------------------------------------------------
# Faction data (Python valid!)
# ---------------------------------------------------------
factions = {
  "The Argent Flight": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/13/ArgentFactionSymbol.png/revision/latest/scale-to-width-down/500?cb=20201103113416",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/9/90/ArgentHome.png/revision/latest/scale-to-width-down/500?cb=20210624182748",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/c/c0/ArgentAgent.png/revision/latest/scale-to-width-down/500?cb=20201105224659",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/8c/ArgentCommander.png/revision/latest/scale-to-width-down/500?cb=20201105224652",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/14/ArgentHero.png/revision/latest/scale-to-width-down/500?cb=20201105224646",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/0/05/ArgentMech.jpg/revision/latest/scale-to-width-down/500?cb=20201228041931",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/d9/ArgentTech2.jpg/revision/latest/scale-to-width-down/500?cb=20201226213356",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/7/72/ArgentTech1.jpg/revision/latest/scale-to-width-down/500?cb=20201226213350",
    "breakthrough": None,
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/80/ArgentPromissory.jpg/revision/latest/scale-to-width-down/77?cb=20201226213656",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/4/49/ArgentFront.jpg/revision/latest/scale-to-width-down/500?cb=20201226213052",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/1b/ArgentBack.jpg/revision/latest/scale-to-width-down/500?cb=20201226212321"
  },
  "The Empyrean": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/c/ca/EmpyreanFactionSymbol.png/revision/latest/scale-to-width-down/500?cb=20201103113437",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/5/5c/EmpyreanHome.png/revision/latest/scale-to-width-down/500?cb=20210624182756",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/e/e6/EmpyreanAgent.jpg/revision/latest/scale-to-width-down/500?cb=20201228040803",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/4/43/EmpyreanCommander.jpg/revision/latest/scale-to-width-down/500?cb=20201228040702",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/28/EmpyreanHero.jpg/revision/latest/scale-to-width-down/500?cb=20201228040708",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/17/EmpyreanMech.jpg/revision/latest/scale-to-width-down/500?cb=20201228041948",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/b/bd/EmpyreanTech1.jpg/revision/latest/scale-to-width-down/500?cb=20201226213414",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/23/EmpyreanTech2.jpg/revision/latest/scale-to-width-down/500?cb=20201226213419",
    "breakthrough": None,
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/23/EmpyreanPromissory2.jpg/revision/latest/scale-to-width-down/77?cb=20201226213723",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/15/EmpyreanFront.jpg/revision/latest/scale-to-width-down/500?cb=20201226213115",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/a8/EmpyreanBack.jpg/revision/latest/scale-to-width-down/500?cb=20201226212506"
  },
  "The Mahact Gene-Sorcerers": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/2f/MahactSymbolSquare.png/revision/latest/scale-to-width-down/500?cb=20250928223932",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/0/08/MahactHome.png/revision/latest/scale-to-width-down/500?cb=20210624182809",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/c/c5/MahactAgent.jpg/revision/latest/scale-to-width-down/500?cb=20201228041034",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/5/52/MahactCommander.jpg/revision/latest/scale-to-width-down/500?cb=20201228041041",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/de/MahactHero.jpg/revision/latest/scale-to-width-down/500?cb=20201228041048",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/f/fb/MahactMech.jpg/revision/latest/scale-to-width-down/500?cb=20201228042020",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/4/4a/MahactTech1.jpg/revision/latest/scale-to-width-down/500?cb=20201226213425",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/b/b8/MahactTech2.jpg/revision/latest/scale-to-width-down/500?cb=20201226213432",
    "breakthrough": None,
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/20/MahactPromissory.jpg/revision/latest/scale-to-width-down/77?cb=20201226213729",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/e/e8/Ti10_faction_mahact.png/revision/latest/scale-to-width-down/500?cb=20200811075309",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/a5/MahactBack.jpg/revision/latest/scale-to-width-down/500?cb=20201226212648"
  },
  "The Naaz-Rokha Alliance": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/3/3b/NaazRokhaSymbolSquare.png/revision/latest/scale-to-width-down/500?cb=20250928224404",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/87/NRHome.png/revision/latest/scale-to-width-down/500?cb=20210624182816",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/5/5b/NRAgent.jpg/revision/latest/scale-to-width-down/500?cb=20201228041409",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/ae/NRCommander.jpg/revision/latest/scale-to-width-down/500?cb=20201228041418",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/d9/NRHero.jpg/revision/latest/scale-to-width-down/500?cb=20201228041425",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/ab/NRMech.jpg/revision/latest/scale-to-width-down/500?cb=20201228042124",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/4/49/NRTech2.jpg/revision/latest/scale-to-width-down/500?cb=20201226213521",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/0/06/NRTech1.jpg/revision/latest/scale-to-width-down/500?cb=20201226213505",
    "breakthrough": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/da/NRBreakthroughFront.PNG/revision/latest/scale-to-width-down/500?cb=20251015150248",
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/0/02/NRPromissory.jpg/revision/latest/scale-to-width-down/77?cb=20201226213745",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/e/ed/NRFront.jpg/revision/latest/scale-to-width-down/500?cb=20201226213220",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/6/67/NRBack.jpg/revision/latest/scale-to-width-down/500?cb=20201226212734"
  },
  "The Nomad": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/5/5e/NomadFactionSheet.png/revision/latest/scale-to-width-down/500?cb=20201104084557",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/a5/NomadHome.png/revision/latest/scale-to-width-down/500?cb=20210624182814",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/7/7d/NomadAgent1.jpg/revision/latest/scale-to-width-down/500?cb=20201228041321",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/e/e1/NomadCommander.jpg/revision/latest/scale-to-width-down/500?cb=20201228041351",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/d7/NomadHero.jpg/revision/latest/scale-to-width-down/500?cb=20201228041401",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/24/NomadMech.jpg/revision/latest/scale-to-width-down/500?cb=20201228042116",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/da/NomadTech1.jpg/revision/latest/scale-to-width-down/500?cb=20201226213443",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/4/4f/NomadTech2.jpg/revision/latest/scale-to-width-down/500?cb=20201226213454",
    "breakthrough": None,
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/b/b9/NomadPromissory.jpg/revision/latest/scale-to-width-down/78?cb=20201226213737",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/ac/NomadFront.jpg/revision/latest/scale-to-width-down/500?cb=20201226213204",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/5/54/NomadBack.jpg/revision/latest/scale-to-width-down/500?cb=20201226212710"
  },
  "The Titans of Ul": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/6/6d/UlFactionSymbol.png/revision/latest/scale-to-width-down/500?cb=20201103113547",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/9/92/TitansHome.png/revision/latest/scale-to-width-down/500?cb=20210624182845",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/10/TitansAgent.jpg/revision/latest/scale-to-width-down/500?cb=20201228041628",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/4/45/TitansCommander.jpg/revision/latest/scale-to-width-down/500?cb=20201228041637",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/d3/TitansHero.jpg/revision/latest/scale-to-width-down/500?cb=20201228041650",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/0/03/TitansMech.jpg/revision/latest/scale-to-width-down/500?cb=20201228042154",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/5/57/TitansTech1.jpg/revision/latest/scale-to-width-down/500?cb=20201226213527",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/3/34/TitansTech2.jpg/revision/latest/scale-to-width-down/500?cb=20201226213532",
    "breakthrough": None,
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/7/74/TitansPromissory.jpg/revision/latest/scale-to-width-down/77?cb=20201226213753",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/af/TitansFront.jpg/revision/latest/scale-to-width-down/500?cb=20201226213233",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/f/fc/TitansBack.jpg/revision/latest/scale-to-width-down/500?cb=20201226212755"
  },
  "The Vuil'Raith Cabal": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/0/04/CabalFactionSymbol.png/revision/latest/scale-to-width-down/500?cb=20201103113606",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/f/f6/CabalHome.png/revision/latest/scale-to-width-down/500?cb=20210624182752",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/5/500/CabalAgent.jpg/revision/latest/scale-to-width-down/500?cb=20201228040646",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/2a/CabalCommander.jpg/revision/latest/scale-to-width-down/500?cb=20201228040651",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/c/c0/CabalHero.jpg/revision/latest/scale-to-width-down/500?cb=20201228040657",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/e/ee/CabalMech.jpg/revision/latest/scale-to-width-down/500?cb=20201228065428",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/9/93/CabalTech2.jpg/revision/latest/scale-to-width-down/500?cb=20201226213408",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/9/9e/CabalTech1.jpg/revision/latest/scale-to-width-down/500?cb=20201226213403",
    "breakthrough": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/de/CabalBreakthrough.png/revision/latest/scale-to-width-down/500?cb=20250930174340",
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/0/00/CabalPromissory.jpg/revision/latest/scale-to-width-down/77?cb=20201226213703",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/15/Vuil%27Raith_Cabal_Faction_Sheet_Front.jpg/revision/latest/scale-to-width-down/500?cb=20200908104629",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/86/CabalBack.jpg/revision/latest/scale-to-width-down/500?cb=20201226212400"
  },
  "The Council Keleres": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/86/KeleresFactionSymbol.png/revision/latest/scale-to-width-down/57?cb=20220427011149",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/9/90/MentakHomeSystem.png/revision/latest/scale-to-width-down/500?cb=20201012101537",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/d9/KeleresAgent.PNG/revision/latest/scale-to-width-down/500?cb=20251012160536",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/b/b2/KeleresCommander.PNG/revision/latest/scale-to-width-down/500?cb=20251012160532",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/d2/KeleresHeroMentak.PNG/revision/latest/scale-to-width-down/500?cb=20251012160455",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/3/32/KeleresMech.png/revision/latest/scale-to-width-down/500?cb=20220426120818",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/9/97/KeleresExecutiveOrder.jpg/revision/latest/scale-to-width-down/500?cb=20251121123816",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/1a/KeleresASN.jpg/revision/latest/scale-to-width-down/500?cb=20251121123805",
    "breakthrough": None,
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/0/0d/KeleresPromissory.png/revision/latest/scale-to-width-down/75?cb=20220426120824",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/b/b0/KeleresFactionSheet.jpg/revision/latest/scale-to-width-down/500?cb=20251121124436",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/e/e3/KeleresFactionSheetBack.png/revision/latest/scale-to-width-down/500?cb=20220426111853"
  },
  "The Crimson Rebellion": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/9/98/ThundersEdgeSymbol4.jpg/revision/latest/scale-to-width-down/500?cb=20250812002431",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/0/06/CrimsonHomeSystem.png/revision/latest/scale-to-width-down/500?cb=20251121062345",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/8f/RebellionAgentCard.png/revision/latest/scale-to-width-down/500?cb=20250930183136",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/2c/RebellionCommanderCard.png/revision/latest/scale-to-width-down/500?cb=20250930183141",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/f/f2/RebellionHeroCard.png/revision/latest/scale-to-width-down/500?cb=20250930183154",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/0/07/Revenant.png/revision/latest/scale-to-width-down/500?cb=20250925162811",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/aa/Subslice.png/revision/latest/scale-to-width-down/500?cb=20250925162834",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/17/RebellionTech2.png/revision/latest/scale-to-width-down/500?cb=20251015150217",
    "breakthrough": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/29/RebellionBreakthrough.png/revision/latest/scale-to-width-down/500?cb=20250930183037",
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/e/ef/Ti11_article_factions_promissorynotecards_sever.png/revision/latest/scale-to-width-down/75?cb=20250925162702",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/8e/CrimsonRebellionFactionSheet.jpg/revision/latest/scale-to-width-down/500?cb=20251121061459",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/c/c4/CrimsonFactionSheetBack.jpg/revision/latest/scale-to-width-down/500?cb=20251121061506"
  },
  "The Deepwrought Scholarate": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/f/f6/ThundersEdgeSymbol1.jpg/revision/latest/scale-to-width-down/500?cb=20250812002409",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/9/90/DWSHomeSystem.png/revision/latest/scale-to-width-down/500?cb=20251121063341",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/c/cc/DeepwroughtAgent.png/revision/latest/scale-to-width-down/500?cb=20250930183024",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/2a/DeepwroughtCommander.png/revision/latest/scale-to-width-down/500?cb=20250930183050",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/a3/DeepwroughtHero.png/revision/latest/scale-to-width-down/500?cb=20250930183027",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/c/ca/Deepwroughtmech.webp/revision/latest/scale-to-width-down/500?cb=20250924164745",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/7/76/DeepwroughtTech1.png/revision/latest/scale-to-width-down/500?cb=20250930183020",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/82/DeepwroughtTech2.png/revision/latest/scale-to-width-down/500?cb=20250930183016",
    "breakthrough": "https://static.wikia.nocookie.net/twilight-imperium-4/images/9/9c/DeepwroughtBreakthrough.png/revision/latest/scale-to-width-down/500?cb=20250930183054",
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/af/DeepwroughtPromissory.png/revision/latest/scale-to-width-down/75?cb=20250930183059",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/22/DWSFactionSheet.jpg/revision/latest/scale-to-width-down/500?cb=20251121061827",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/c/c4/DWSFactionSheetBack.jpg/revision/latest/scale-to-width-down/500?cb=20251121061839"
  },
  "The Firmament": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/4/4c/ThundersEdgeSymbol5.jpg/revision/latest/scale-to-width-down/500?cb=20250812002437",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/8b/FirmamentHomeSystem.png/revision/latest/scale-to-width-down/500?cb=20251121063002",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/d4/FirmamentAgentCard.png/revision/latest/scale-to-width-down/500?cb=20250930183219",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/f/fe/FirmamentCommanderCard.png/revision/latest/scale-to-width-down/500?cb=20250930183216",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/4/4e/FirmamentHeroCard.png/revision/latest/scale-to-width-down/500?cb=20250930183212",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/aa/FirmamentMech.png/revision/latest/scale-to-width-down/500?cb=20250930183202",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/85/FirmamentTech1.png/revision/latest/scale-to-width-down/500?cb=20250930183209",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/0/00/FirmamentTech2.png/revision/latest/scale-to-width-down/500?cb=20250930183206",
    "breakthrough": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/89/FirmamentBreakthrough.png/revision/latest/scale-to-width-down/500?cb=20250930183223",
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/b/b8/FirmamentPromissory.png/revision/latest/scale-to-width-down/75?cb=20250930183226",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/3/38/FirmamentFactionSheet.jpg/revision/latest/scale-to-width-down/500?cb=20251121062023",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/26/FirmamentFactionSheetBack.jpg/revision/latest/scale-to-width-down/500?cb=20251121062032"
  },
  "The Obsidian": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/9/9c/ObsidianFactionSymbol.PNG/revision/latest/scale-to-width-down/54?cb=20250930185642",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/b/b1/ObsidianHomeSystem.png/revision/latest/scale-to-width-down/500?cb=20251121063020",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/88/ObsidianAgentCard.png/revision/latest/scale-to-width-down/500?cb=20250930183236",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/a2/ObsidianCommanderCard.png/revision/latest/scale-to-width-down/500?cb=20250930183239",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/a9/ObsidianHeroCard.png/revision/latest/scale-to-width-down/500?cb=20250930183243",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/c/cd/ObsidianMech.png/revision/latest/scale-to-width-down/500?cb=20250930183311",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/3/33/ObsidianTech1.png/revision/latest/scale-to-width-down/500?cb=20250930183300",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/b/b9/ObsidianTech_2.png/revision/latest/scale-to-width-down/500?cb=20250930183304",
    "breakthrough": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/d8/ObsidianBreakthrough.png/revision/latest/scale-to-width-down/500?cb=20250930183232",
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/d1/ObsidianPromissory.png/revision/latest/scale-to-width-down/75?cb=20250930183229",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/84/ObsidianFactionSheet.jpg/revision/latest/scale-to-width-down/500?cb=20251121121113",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/24/ObsidianFactionSheetBack.jpg/revision/latest/scale-to-width-down/500?cb=20251121121128"
  },
  "Last Bastion": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/3/3a/LastBastionSymbolSquare.png/revision/latest/scale-to-width-down/500?cb=20250928223944",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/16/LastBastionHomeSystem.png/revision/latest/scale-to-width-down/500?cb=20251121063355",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/da/LastBastionAgentCard.png/revision/latest/scale-to-width-down/500?cb=20250930183126",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/c/c0/Bastion_commander.webp/revision/latest/scale-to-width-down/500?cb=20250922013521",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/8/89/LastBastionHero.png/revision/latest/scale-to-width-down/500?cb=20250930183130",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/7/75/LastBastionMech.jpg/revision/latest/scale-to-width-down/500?cb=20250801125118",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/f/fc/Ti11_article_factions_factiontechcards_proximatargetingvi.png/revision/latest/scale-to-width-down/500?cb=20250925165224",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/b/b6/LastBastionTech2.PNG/revision/latest/scale-to-width-down/500?cb=20251103012332",
    "breakthrough": "https://static.wikia.nocookie.net/twilight-imperium-4/images/b/b3/Ti11_article_factions_breakthroughcards_theicon.png/revision/latest/scale-to-width-down/500?cb=20250925165211",
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/11/Ti11_article_factions_promissorynotecards_raisethestandard.png/revision/latest/scale-to-width-down/75?cb=20250925165249",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/5/50/LastBastionFactionSheet.jpg/revision/latest/scale-to-width-down/500?cb=20251121060655",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/f/f3/LastBastionFactionSheetBack.jpg/revision/latest/scale-to-width-down/500?cb=20251121060952"
  },
  "The Ral Nel Consortium": {
    "symbol": "https://static.wikia.nocookie.net/twilight-imperium-4/images/4/4c/RalNelSymbolSquare.png/revision/latest/scale-to-width-down/500?cb=20250928223940",
    "faction": None,
    "home_system": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/af/RalNelHomeSystem.png/revision/latest/scale-to-width-down/500?cb=20251121063407",
    "agent": "https://static.wikia.nocookie.net/twilight-imperium-4/images/f/f9/Lizzardcommander.webp/revision/latest/scale-to-width-down/500?cb=20250922014423",
    "commander": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/2b/RalNelCommanderCard.png/revision/latest/scale-to-width-down/500?cb=20250930183122",
    "hero": "https://static.wikia.nocookie.net/twilight-imperium-4/images/f/f6/RalNelHero.png/revision/latest/scale-to-width-down/500?cb=20250907120622",
    "mech": "https://static.wikia.nocookie.net/twilight-imperium-4/images/d/dd/RalNelMech.png/revision/latest/scale-to-width-down/500?cb=20250930183104",
    "faction_tech_1": "https://static.wikia.nocookie.net/twilight-imperium-4/images/b/bc/RalNelTech2.png/revision/latest/scale-to-width-down/500?cb=20250930183111",
    "faction_tech_2": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/1f/RalNelTech1.png/revision/latest/scale-to-width-down/500?cb=20250930183116",
    "breakthrough": "https://static.wikia.nocookie.net/twilight-imperium-4/images/1/1a/RalNelBreakthrough.png/revision/latest/scale-to-width-down/500?cb=20250930183107",
    "promissory": "https://static.wikia.nocookie.net/twilight-imperium-4/images/9/98/RalNelPromissory.png/revision/latest/scale-to-width-down/75?cb=20250930183120",
    "flagship_front": "https://static.wikia.nocookie.net/twilight-imperium-4/images/a/a9/RalNelFactionSheet.jpg/revision/latest/scale-to-width-down/500?cb=20251121061328",
    "flagship_back": "https://static.wikia.nocookie.net/twilight-imperium-4/images/2/27/RalNelFactionSheetBack.jpg/revision/latest/scale-to-width-down/500?cb=20251121061313"
  }
}





# ---------------------------------------------------------
# Normalize + download
# ---------------------------------------------------------
cleaned = {}

for faction, data in factions.items():
    folder_name = faction.lower().replace(" ", "").replace("'", "")
    base_folder = f"images/{folder_name}/"

    cleaned[faction] = {}

    for key, url in data.items():
        if url is None:
            continue

        # Rename keys
        if key == "flagship_front":
            out_key = "faction_sheet_front"
        elif key == "flagship_back":
            out_key = "faction_sheet_back"
        else:
            out_key = key

        # Parse filename
        parsed = urlparse(url)
        filename = unquote(os.path.basename(parsed.path))

        # Guarantee extension
        if "." not in filename:
            filename += ".jpg"

        extension = os.path.splitext(filename)[1]
        output_path = f"{base_folder}{out_key}{extension}"

        saved = download(url, output_path)
        if saved:
            cleaned[faction][out_key] = saved.replace("\\", "/")


# ---------------------------------------------------------
# Save cleaned JSON
# ---------------------------------------------------------
with open("factions.json", "w") as f:
    json.dump(cleaned, f, indent=2)

print("\nDONE — Images downloaded and factions.json created.")
