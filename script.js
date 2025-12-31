(function () {
  // EXACT layout from your posted crossword image:
  // 14 rows x 8 cols. 1 = white/playable, 0 = black.
  const LAYOUT = [
    [0,0,1,0,0,0,0,1],
    [0,0,1,0,0,0,0,1],
    [0,0,1,0,0,0,0,1],
    [0,0,1,0,0,0,0,1],
    [0,0,1,0,0,1,0,1],
    [1,1,1,1,1,1,1,1],
    [1,0,1,0,0,1,0,0],
    [1,0,0,1,1,1,0,0],
    [1,0,1,0,0,1,0,0],
    [1,0,1,0,0,1,0,1],
    [1,0,1,0,1,1,1,1],
    [1,0,1,0,0,1,0,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,0,0,0,0,0],
  ];

  // Number positions in the grid (row,col) -> number
  const CLUE_NUMBERS = {
    "0,2": 1,
    "0,7": 2,
    "4,5": 3,
    "5,0": 4,
    "7,3": 5,
    "8,2": 6,
    "9,7": 7,
    "10,4": 8,
    "12,1": 9
  };

  // Clues (your updated list for THIS crossword)
  const CLUES = [
    // across (vågrätt)
    { number: 4, dir: "across", start: [5,0], text: "Taylor Swift kallade sin blivande make för gympalärare när hon postade om deras förlovning. Vilket ämne kallade hon sig själv lärare i?" },
    { number: 5, dir: "across", start: [7,3], text: "Hur många partiledare har avgått under året?" },
    { number: 8, dir: "across", start: [10,4], text: "Nobel nobbade Trump för fredspriset, men han fick det av en annan organisation. Vilken?" },
    { number: 9, dir: "across", start: [12,1], text: "Sveriges nya förbundskapen för herrlandslaget delar efternamn med en känd trollkarl. Vad heter han ?" },

    // down (neråt)
    { number: 1, dir: "down", start: [0,2], text: "Från vilken stad kommer nya påven Leo XIV?" },
    { number: 2, dir: "down", start: [0,7], text: "Världens första rymdflygning med bara kvinnor skedde 2025. Katy Perry var en av resenärerna, vad tog hon med sig upp i rymden?" },
    { number: 3, dir: "down", start: [4,5], text: "Vilket land vann Eurovision 2025?" },
    { number: 4, dir: "down", start: [5,0], text: "Vilket land vann fotbolls EM på damsidan 2025?" },
    { number: 6, dir: "down", start: [8,2], text: "Donald trump bannlyste detta i 12 timmar" },
    { number: 7, dir: "down", start: [9,7], text: "Vilken grupp vann Melodifestivalen?" },
  ];

  // Correct answers for Rätta (from the filled solution image)
  // NOTE: #2 is BLOMMA (6) to match the grid.
  const ANSWERS = {
    // across
    "across|4": "ENGELSKA",
    "across|5": "TRE",
    "across|8": "FIFA",
    "across|9": "POTTER",

    // down
    "down|1": "CHICAGO",
    "down|2": "BLOMMA",
    "down|3": "ÖSTERRIKE",
    "down|4": "ENGLAND",
    "down|6": "TIKTOK",
    "down|7": "KAJ",
  };

  const gridEl = document.getElementById("grid");
  const cluesAcrossEl = document.getElementById("cluesAcross");
  const cluesDownEl = document.getElementById("cluesDown");
  const clearBtn = document.getElementById("clearBtn");
  const checkBtn = document.getElementById("checkBtn");
  const modeEl = document.getElementById("mode");

  const rows = LAYOUT.length;
  const cols = LAYOUT[0].length;

  // "r,c" -> { cellEl, inputEl|null }
  const cellMap = new Map();
  // key "dir|number" -> array of "r,c"
  const wordCells = new Map();

  let selectedWord = null; // {dir, number}
  let activeKey = null;

  const keyOf = (r,c) => `${r},${c}`;
  const isWhite = (r,c) => r>=0 && r<rows && c>=0 && c<cols && LAYOUT[r][c] === 1;
  const normalizeChar = (ch) => (ch || "").toUpperCase().replace(/[^A-ZÅÄÖ]/g, "");
  const wordKey = (dir, num) => `${dir}|${num}`;

  function computeCells(start, dir) {
    const [sr, sc] = start;
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;

    const keys = [];
    let r = sr, c = sc;
    while (isWhite(r,c)) {
      keys.push(keyOf(r,c));
      r += dr; c += dc;
    }
    return keys;
  }

  function buildWordCells() {
    wordCells.clear();
    for (const clue of CLUES) {
      wordCells.set(wordKey(clue.dir, clue.number), computeCells(clue.start, clue.dir));
    }
  }

  function clearHL() {
    for (const { cellEl } of cellMap.values()) {
      cellEl.classList.remove("hl", "active");
    }
  }

  function applyHL() {
    clearHL();
    if (!selectedWord) return;

    const seq = wordCells.get(wordKey(selectedWord.dir, selectedWord.number)) || [];
    for (const k of seq) {
      const info = cellMap.get(k);
      if (info) info.cellEl.classList.add("hl");
    }
    if (activeKey) {
      const info = cellMap.get(activeKey);
      if (info) info.cellEl.classList.add("active");
    }
  }

  function setMode() {
    if (!selectedWord) modeEl.textContent = "";
    else {
      modeEl.textContent = `Vald: ${selectedWord.number} (${selectedWord.dir === "across" ? "vågrätt" : "neråt"})`;
    }
  }

  function focusKey(k) {
    const info = cellMap.get(k);
    if (!info || !info.inputEl) return;
    info.inputEl.focus({ preventScroll: true });
    info.inputEl.setSelectionRange?.(0,1);
    activeKey = k;
    applyHL();
  }

  function selectWord(dir, number, focusStart = true, preferKey = null) {
    selectedWord = { dir, number };
    const seq = wordCells.get(wordKey(dir, number)) || [];
    if (preferKey && seq.includes(preferKey)) activeKey = preferKey;
    else if (!activeKey || !seq.includes(activeKey)) activeKey = seq[0] || null;

    updateClueSelectionUI();
    setMode();
    applyHL();
    if (focusStart && activeKey) focusKey(activeKey);
  }

  function wordsForCell(k) {
    const matches = [];
    for (const clue of CLUES) {
      const seq = wordCells.get(wordKey(clue.dir, clue.number)) || [];
      if (seq.includes(k)) matches.push({ dir: clue.dir, number: clue.number });
    }
    return matches;
  }

  function handleCellTap(k) {
    const matches = wordsForCell(k);
    if (matches.length === 0) return;

    if (matches.length === 1) {
      selectWord(matches[0].dir, matches[0].number, false, k);
      return;
    }

    // If both across + down: tap same cell again toggles direction
    const alreadySameCell = (activeKey === k);
    const alreadyOnThisCell = selectedWord && matches.some(m => m.dir === selectedWord.dir && m.number === selectedWord.number);

    let next = null;
    const across = matches.find(m => m.dir === "across");
    const down = matches.find(m => m.dir === "down");

    if (alreadySameCell && alreadyOnThisCell) {
      next = (selectedWord.dir === "across") ? down : across;
    } else {
      next = (selectedWord?.dir === "down") ? down : across;
    }
    next = next || across || down;

    selectWord(next.dir, next.number, false, k);
  }

  function buildGrid() {
    gridEl.innerHTML = "";
    cellMap.clear();

    for (let r=0; r<rows; r++) {
      for (let c=0; c<cols; c++) {
        const k = keyOf(r,c);
        const cell = document.createElement("div");
        cell.className = "cell " + (LAYOUT[r][c] === 1 ? "white" : "black");

        if (LAYOUT[r][c] === 1) {
          // number
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

          // focus selects word for that cell (good phone behavior)
          inp.addEventListener("focus", () => handleCellTap(k));

          // tapping the square focuses input (bigger target)
          cell.addEventListener("click", () => inp.focus());

          inp.addEventListener("input", () => {
            // clear check marks on any edit
            for (const { cellEl } of cellMap.values()) {
              cellEl.classList.remove("correct", "incorrect");
            }

            const v = normalizeChar(inp.value);
            inp.value = v.slice(-1);

            if (!selectedWord) return;
            const seq = wordCells.get(wordKey(selectedWord.dir, selectedWord.number)) || [];
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
              if (!selectedWord) { e.preventDefault(); return; }
              const seq = wordCells.get(wordKey(selectedWord.dir, selectedWord.number)) || [];
              const idx = seq.indexOf(k);
              const prevKey = seq[idx - 1];
              if (prevKey) focusKey(prevKey);
              e.preventDefault();
            }
          });

          cell.appendChild(inp);
          cellMap.set(k, { cellEl: cell, inputEl: inp });
        } else {
          cellMap.set(k, { cellEl: cell, inputEl: null });
        }

        gridEl.appendChild(cell);
      }
    }
  }

  function renderClues() {
    cluesAcrossEl.innerHTML = "";
    cluesDownEl.innerHTML = "";

    const across = CLUES.filter(c => c.dir === "across").sort((a,b)=>a.number-b.number);
    const down = CLUES.filter(c => c.dir === "down").sort((a,b)=>a.number-b.number);

    const makeItem = (clue) => {
      const li = document.createElement("li");
      li.className = "clue-item";
      li.dataset.dir = clue.dir;
      li.dataset.number = String(clue.number);

      const head = document.createElement("div");
      head.className = "clue-head";

      const no = document.createElement("div");
      no.className = "clue-no";
      no.textContent = `${clue.number}.`;

      head.appendChild(no);

      const text = document.createElement("div");
      text.className = "clue-text";
      text.textContent = clue.text;

      li.appendChild(head);
      li.appendChild(text);

      li.addEventListener("click", () => selectWord(clue.dir, clue.number, true));
      return li;
    };

    across.forEach(c => cluesAcrossEl.appendChild(makeItem(c)));
    down.forEach(c => cluesDownEl.appendChild(makeItem(c)));
  }

  function updateClueSelectionUI() {
    const all = document.querySelectorAll(".clue-item");
    all.forEach(el => {
      const dir = el.dataset.dir;
      const num = Number(el.dataset.number);
      const sel = selectedWord && selectedWord.dir === dir && selectedWord.number === num;
      el.classList.toggle("selected", !!sel);
    });
  }

  function allFilled() {
    for (const { inputEl } of cellMap.values()) {
      if (!inputEl) continue;
      if (!normalizeChar(inputEl.value)) return false;
    }
    return true;
  }

  function expectedCharMap() {
    // cellKey -> expected letter, derived from all ANSWERS
    const exp = new Map();

    for (const clue of CLUES) {
      const ans = (ANSWERS[wordKey(clue.dir, clue.number)] || "").toUpperCase();
      const seq = wordCells.get(wordKey(clue.dir, clue.number)) || [];
      for (let i=0; i<seq.length; i++) {
        const k = seq[i];
        const ch = ans[i] || "";
        if (!ch) continue;
        if (!exp.has(k)) exp.set(k, ch);
      }
    }
    return exp;
  }

  function checkAnswers() {
    // clear previous
    for (const { cellEl } of cellMap.values()) {
      cellEl.classList.remove("correct", "incorrect");
    }

    if (!allFilled()) {
      alert("Fyll i hela korsordet för att rätta");
      return;
    }

    const exp = expectedCharMap();
    let wrong = 0;

    for (const [k, { cellEl, inputEl }] of cellMap.entries()) {
      if (!inputEl) continue;
      const got = normalizeChar(inputEl.value);
      const want = exp.get(k);
      if (!want) continue;

      if (got === want) cellEl.classList.add("correct");
      else { cellEl.classList.add("incorrect"); wrong++; }
    }

    alert(wrong === 0 ? "Allt rätt!" : `${wrong} fel.`);
  }

  clearBtn.addEventListener("click", () => {
    for (const { cellEl, inputEl } of cellMap.values()) {
      cellEl.classList.remove("hl","active","correct","incorrect");
      if (inputEl) inputEl.value = "";
    }
    selectedWord = null;
    activeKey = null;
    updateClueSelectionUI();
    setMode();
    clearHL();
  });

  checkBtn.addEventListener("click", checkAnswers);

  // init
  buildWordCells();
  renderClues();
  buildGrid();
  setMode();
})();
