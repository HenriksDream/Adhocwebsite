(function () {
  const LAYOUT = [
    [0,0,0,0,0,0,1,0,0],
    [0,0,0,0,0,0,1,0,0],
    [1,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,1,0,0],
    [0,0,0,1,0,0,1,0,0],
    [0,0,1,1,1,1,1,1,1],
    [0,0,0,1,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1],
    [0,0,0,1,0,0,0,1,0],
    [0,0,0,1,0,0,0,1,0],
    [0,1,1,1,1,1,1,0,0],
    [0,0,0,1,0,0,0,0,0],
  ];

  const CLUE_NUMBERS = {
    "0,6": 1,
    "2,0": 2,
    "4,3": 3,
    "5,2": 4,
    "7,0": 5,
    "8,7": 6,
    "10,1": 7
  };

  const CLUES = [
    { number: 1, dir: "down",   start: [0, 6], text: "Världens första rymdflygning med bara kvinnor skedde 2025. Katy Perry var en av resenärerna, vad tog hon med sig upp i rymden?" },
    { number: 2, dir: "across", start: [2, 0], text: "Från vilken stad kommer nya påven Leo XIV?" },
    { number: 3, dir: "down",   start: [4, 3], text: "Taylor Swift kallade sin blivande make för gympalärare när hon postade om deras förlovning. Vilket ämne kallade hon sig själv lärare i?" },
    { number: 4, dir: "across", start: [5, 2], text: "Vilket land vann fotbolls EM på damsidan 2025?" },
    { number: 5, dir: "across", start: [7, 0], text: "Vilket land vann Eurovision 2025?" },
    { number: 6, dir: "down",   start: [8, 7], text: "Vilken grupp vann Melodifestivalen?" },
    { number: 7, dir: "across", start: [10,1], text: "Donald trump bannlyste detta i 12 timmar" },
  ];

  const ANSWERS = {
    1: "BLOMM",
    2: "CHICAGO",
    3: "ENGELSKA",
    4: "ENGLAND",
    5: "ÖSTERRIKE",
    6: "AJ",
    7: "TIKTOK",
  };

  const gridEl = document.getElementById("grid");
  const clueListEl = document.getElementById("clueList");
  const clearBtn = document.getElementById("clearBtn");
  const checkBtn = document.getElementById("checkBtn");
  const modeEl = document.getElementById("mode");

  const rows = LAYOUT.length;
  const cols = LAYOUT[0].length;

  // "r,c" -> { cellEl, inputEl|null }
  const cellMap = new Map();

  // number -> array of "r,c"
  const clueCells = new Map();

  let selectedClue = null;
  let selectedDir = null;
  let activeKey = null;

  const keyOf = (r,c) => `${r},${c}`;
  const isWhite = (r,c) => r>=0 && r<rows && c>=0 && c<cols && LAYOUT[r][c] === 1;
  const dirLabel = (d) => d === "across" ? "Vågrätt" : "Lodrätt";

  function normalizeChar(ch) {
    return (ch || "").toUpperCase().replace(/[^A-ZÅÄÖ]/g, "");
  }

  function computeCellsForClue(clue) {
    const [sr, sc] = clue.start;
    const dr = clue.dir === "down" ? 1 : 0;
    const dc = clue.dir === "across" ? 1 : 0;

    const keys = [];
    let r = sr, c = sc;
    while (isWhite(r, c)) {
      keys.push(keyOf(r,c));
      r += dr; c += dc;
    }
    return keys;
  }

  function buildClueCells() {
    clueCells.clear();
    for (const clue of CLUES) {
      clueCells.set(clue.number, computeCellsForClue(clue));
    }
  }

  function clearAllCellClasses() {
    for (const { cellEl } of cellMap.values()) {
      cellEl.classList.remove("hl", "active", "correct", "incorrect");
    }
  }

  function applyHighlights() {
    // keep correct/incorrect, clear only hl/active
    for (const { cellEl } of cellMap.values()) {
      cellEl.classList.remove("hl", "active");
    }
    if (!selectedClue) return;

    const seq = clueCells.get(selectedClue.number) || [];
    for (const k of seq) {
      const info = cellMap.get(k);
      if (info) info.cellEl.classList.add("hl");
    }
    if (activeKey) {
      const info = cellMap.get(activeKey);
      if (info) info.cellEl.classList.add("active");
    }
  }

  function updateMode() {
    if (!selectedClue) modeEl.textContent = "";
    else modeEl.textContent = `Vald: ${selectedClue.number} (${dirLabel(selectedClue.dir)})`;
  }

  function updateClueUI() {
    const items = clueListEl.querySelectorAll(".clue-item");
    items.forEach(el => {
      const n = Number(el.dataset.number);
      const d = el.dataset.dir;
      el.classList.toggle("selected", !!selectedClue && selectedClue.number === n && selectedClue.dir === d);
    });
  }

  function focusKey(k) {
    const info = cellMap.get(k);
    if (!info || !info.inputEl) return;
    info.inputEl.focus({ preventScroll: true });
    info.inputEl.setSelectionRange?.(0,1);
    activeKey = k;
    applyHighlights();
  }

  function selectClue(clue, focusStart = true) {
    selectedClue = clue;
    selectedDir = clue.dir;

    const seq = clueCells.get(clue.number) || [];
    if (!activeKey || !seq.includes(activeKey)) activeKey = seq[0] || null;

    updateClueUI();
    updateMode();
    applyHighlights();
    if (focusStart && activeKey) focusKey(activeKey);
  }

  function cluesForCellKey(k) {
    const matches = [];
    for (const clue of CLUES) {
      const seq = clueCells.get(clue.number) || [];
      if (seq.includes(k)) matches.push(clue);
    }
    return matches;
  }

  function handleCellTap(k) {
    const matches = cluesForCellKey(k);
    if (matches.length === 0) return;

    if (matches.length === 1) {
      selectedClue = matches[0];
      selectedDir = selectedClue.dir;
      activeKey = k;
      updateClueUI(); updateMode(); applyHighlights();
      focusKey(k);
      return;
    }

    const across = matches.find(m => m.dir === "across");
    const down = matches.find(m => m.dir === "down");

    const alreadySameCell = (activeKey === k);
    const alreadyInThese = selectedClue && matches.some(m => m.number === selectedClue.number && m.dir === selectedClue.dir);

    let next;
    if (alreadySameCell && alreadyInThese) {
      // toggle direction
      next = (selectedDir === "across") ? (down || across) : (across || down);
    } else {
      // keep current dir if possible, else across
      next = (selectedDir === "down") ? (down || across) : (across || down);
    }

    selectedClue = next || across || down;
    selectedDir = selectedClue.dir;
    activeKey = k;

    updateClueUI(); updateMode(); applyHighlights();
    focusKey(k);
  }

  function buildExpectedMap() {
    const expected = new Map(); // cellKey -> char

    for (const clue of CLUES) {
      const ans = (ANSWERS[clue.number] || "").toUpperCase();
      const seq = clueCells.get(clue.number) || [];
      for (let i = 0; i < seq.length; i++) {
        const k = seq[i];
        const ch = ans[i] || "";
        if (!ch) continue;
        if (!expected.has(k)) expected.set(k, ch);
      }
    }
    return expected;
  }

  function allFilled() {
    for (const { inputEl } of cellMap.values()) {
      if (!inputEl) continue;
      if (!normalizeChar(inputEl.value)) return false;
    }
    return true;
  }

  function checkAnswers() {
    // clear previous correctness marks
    for (const { cellEl } of cellMap.values()) {
      cellEl.classList.remove("correct", "incorrect");
    }

    if (!allFilled()) {
      alert("Fyll i hela korsordet för att rätta");
      return;
    }

    const expected = buildExpectedMap();
    let wrong = 0;

    for (const [k, { cellEl, inputEl }] of cellMap.entries()) {
      if (!inputEl) continue;
      const got = normalizeChar(inputEl.value);
      const exp = expected.get(k);
      if (!exp) continue;

      if (got === exp) cellEl.classList.add("correct");
      else { cellEl.classList.add("incorrect"); wrong++; }
    }

    alert(wrong === 0 ? "Allt rätt!" : `${wrong} fel.`);
  }

  function renderClues() {
    clueListEl.innerHTML = "";
    for (const clue of CLUES) {
      const li = document.createElement("li");
      li.className = "clue-item";
      li.dataset.number = String(clue.number);
      li.dataset.dir = clue.dir;

      const head = document.createElement("div");
      head.className = "clue-head";

      const no = document.createElement("div");
      no.className = "clue-no";
      no.textContent = `${clue.number}.`;

      const dir = document.createElement("div");
      dir.className = "clue-dir";
      dir.textContent = dirLabel(clue.dir);

      head.appendChild(no);
      head.appendChild(dir);

      const text = document.createElement("div");
      text.className = "clue-text";
      text.textContent = clue.text;

      li.appendChild(head);
      li.appendChild(text);

      li.addEventListener("click", () => selectClue(clue, true));
      clueListEl.appendChild(li);
    }
  }

  function buildGrid() {
    gridEl.innerHTML = "";
    cellMap.clear();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const k = keyOf(r,c);

        const cell = document.createElement("div");
        cell.className = "cell " + (LAYOUT[r][c] === 1 ? "white" : "black");

        if (LAYOUT[r][c] === 1) {
          // clue number if any
          if (k in CLUE_NUMBERS) {
            const s = document.createElement("span");
            s.className = "clue-num";
            s.textContent = String(CLUE_NUMBERS[k]);
            cell.appendChild(s);
          }

          const inp = document.createElement("input");
          inp.type = "text";
          inp.maxLength = 1;
          inp.autocomplete = "off";
          inp.spellcheck = false;
          inp.inputMode = "text";
          inp.setAttribute("enterkeyhint", "next");

          // On focus (normal phone behavior), select the word for that cell
          inp.addEventListener("focus", () => {
            handleCellTap(k);
          });

          // Tap the cell wrapper also focuses the input (bigger target on phone)
          cell.addEventListener("click", () => {
            inp.focus();
          });

          inp.addEventListener("input", () => {
            // any typing should clear correctness marks so re-check works naturally
            for (const { cellEl } of cellMap.values()) {
              cellEl.classList.remove("correct", "incorrect");
            }

            const v = normalizeChar(inp.value);
            inp.value = v.slice(-1);

            if (!selectedClue) return;
            const seq = clueCells.get(selectedClue.number) || [];
            const idx = seq.indexOf(k);
            if (idx >= 0 && inp.value) {
              const nextKey = seq[idx + 1];
              if (nextKey) focusKey(nextKey);
            }
          });

          inp.addEventListener("keydown", (e) => {
            if (e.key === "Delete") {
              inp.value = "";
              e.preventDefault();
              return;
            }

            if (e.key === "Backspace") {
              if (inp.value) {
                inp.value = "";
                e.preventDefault();
                return;
              }
              if (!selectedClue) { e.preventDefault(); return; }

              const seq = clueCells.get(selectedClue.number) || [];
              const idx = seq.indexOf(k);
              const prevKey = seq[idx - 1];
              if (prevKey) focusKey(prevKey);
              e.preventDefault();
              return;
            }
          });

          cell.appendChild(inp);
          cellMap.set(k, { cellEl: cell, inputEl: inp });
        } else {
          // black cell
          cellMap.set(k, { cellEl: cell, inputEl: null });
        }

        gridEl.appendChild(cell);
      }
    }
  }

  clearBtn.addEventListener("click", () => {
    for (const { cellEl, inputEl } of cellMap.values()) {
      cellEl.classList.remove("hl", "active", "correct", "incorrect");
      if (inputEl) inputEl.value = "";
    }
    selectedClue = null;
    selectedDir = null;
    activeKey = null;
    updateClueUI();
    updateMode();
  });

  checkBtn.addEventListener("click", checkAnswers);

  // Init
  buildClueCells();
  renderClues();
  buildGrid();
  updateMode();
})();
