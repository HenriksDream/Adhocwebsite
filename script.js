(function () {
  // 12 rows x 9 cols. 1 = white/playable, 0 = black/block.
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

  // Numbers to match your screenshot.
  const CLUE_NUMBERS = {
    "0,6": 1,
    "2,0": 2,
    "4,3": 3,
    "5,2": 4,
    "7,0": 5,
    "8,7": 6,
    "10,1": 7
  };

  // Clues + positions
  const CLUES = [
    { number: 1, dir: "down",   start: [0, 6], text: "Världens första rymdflygning med bara kvinnor skedde 2025. Katy Perry var en av resenärerna, vad tog hon med sig upp i rymden?" },
    { number: 2, dir: "across", start: [2, 0], text: "Från vilken stad kommer nya påven Leo XIV?" },
    { number: 3, dir: "down",   start: [4, 3], text: "Taylor Swift kallade sin blivande make för gympalärare när hon postade om deras förlovning. Vilket ämne kallade hon sig själv lärare i?" },
    { number: 4, dir: "across", start: [5, 2], text: "Vilket land vann fotbolls EM på damsidan 2025?" },
    { number: 5, dir: "across", start: [7, 0], text: "Vilket land vann Eurovision 2025?" },
    { number: 6, dir: "down",   start: [8, 7], text: "Vilken grupp vann Melodifestivalen?" },
    { number: 7, dir: "across", start: [10,1], text: "Donald trump bannlyste detta i 12 timmar" },
  ];

  // ✅ Correct answers from your screenshot (uppercase)
  // IMPORTANT: Keep them exactly as the grid expects.
  const ANSWERS = {
    1: "BLOMMA",
    2: "CHICAGO",
    3: "ENGELSKA",
    4: "ENGLAND",
    5: "ÖSTERRIKE",
    6: "KAJ",
    7: "TIKTOK",
  };

  const gridEl = document.getElementById("grid");
  const clueListEl = document.getElementById("clueList");
  const clearBtn = document.getElementById("clearBtn");
  const checkBtn = document.getElementById("checkBtn");
  const modeEl = document.getElementById("mode");

  const rows = LAYOUT.length;
  const cols = LAYOUT[0].length;

  const cellMap = new Map();        // "r,c" -> { wrapEl, inputEl }
  const clueCells = new Map();      // number -> array of "r,c"
  const clueByNumDir = new Map();   // "num|dir" -> clue

  let selectedClue = null;
  let selectedDir = null;
  let activeCellKey = null;

  function keyOf(r, c) { return `${r},${c}`; }
  function isWhite(r, c) {
    return r >= 0 && r < rows && c >= 0 && c < cols && LAYOUT[r][c] === 1;
  }
  function dirLabel(dir) { return dir === "across" ? "Vågrätt" : "Lodrätt"; }

  function addClueNumberIfAny(wrapper, r, c) {
    const key = keyOf(r, c);
    if (!(key in CLUE_NUMBERS)) return;
    const s = document.createElement("span");
    s.className = "clue-num";
    s.textContent = String(CLUE_NUMBERS[key]);
    wrapper.appendChild(s);
  }

  function makeBlockCell() {
    const d = document.createElement("div");
    d.className = "cell cell-wrap cell-block";
    d.setAttribute("aria-hidden", "true");
    return d;
  }

  function normalizeChar(ch) {
    return (ch || "").toUpperCase().replace(/[^A-ZÅÄÖ]/g, "");
  }

  function clearPerCellMarks() {
    for (const { wrapEl } of cellMap.values()) {
      wrapEl.classList.remove("correct", "incorrect");
    }
  }

  function makeInputCell(r, c) {
    const wrapper = document.createElement("div");
    wrapper.className = "cell cell-wrap";
    addClueNumberIfAny(wrapper, r, c);

    const inp = document.createElement("input");
    inp.className = "cell-input";
    inp.type = "text";
    inp.maxLength = 1;
    inp.autocomplete = "off";
    inp.spellcheck = false;
    inp.inputMode = "text";
    inp.setAttribute("enterkeyhint", "next");

    inp.dataset.row = String(r);
    inp.dataset.col = String(c);

    inp.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      handleCellPick(r, c);
      inp.focus({ preventScroll: true });
    });

    inp.addEventListener("input", () => {
      // typing clears previous check marks so you can re-check
      clearPerCellMarks();

      const v = normalizeChar(inp.value);
      inp.value = v.slice(-1);

      if (!selectedClue) return;
      const seq = clueCells.get(selectedClue.number) || [];
      const here = keyOf(r, c);
      const idx = seq.indexOf(here);
      if (idx >= 0 && inp.value) {
        const nextKey = seq[idx + 1];
        if (nextKey) focusKey(nextKey);
      }
    });

    inp.addEventListener("keydown", (e) => {
      if (e.key === "Delete") {
        clearPerCellMarks();
        inp.value = "";
        e.preventDefault();
        return;
      }

      if (e.key === "Backspace") {
        if (inp.value) {
          clearPerCellMarks();
          inp.value = "";
          e.preventDefault();
          return;
        }

        if (!selectedClue) {
          e.preventDefault();
          return;
        }

        const seq = clueCells.get(selectedClue.number) || [];
        const here = keyOf(r, c);
        const idx = seq.indexOf(here);
        const prevKey = seq[idx - 1];
        if (prevKey) focusKey(prevKey);
        e.preventDefault();
        return;
      }

      // Arrow keys within selected word
      if (selectedClue) {
        const seq = clueCells.get(selectedClue.number) || [];
        const here = keyOf(r, c);
        const idx = seq.indexOf(here);
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          const prevKey = seq[idx - 1];
          if (prevKey) focusKey(prevKey);
          e.preventDefault();
          return;
        }
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          const nextKey = seq[idx + 1];
          if (nextKey) focusKey(nextKey);
          e.preventDefault();
          return;
        }
      }
    });

    wrapper.appendChild(inp);
    cellMap.set(keyOf(r, c), { wrapEl: wrapper, inputEl: inp });
    return wrapper;
  }

  function buildGrid() {
    gridEl.innerHTML = "";
    cellMap.clear();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (LAYOUT[r][c] === 1) gridEl.appendChild(makeInputCell(r, c));
        else gridEl.appendChild(makeBlockCell());
      }
    }
  }

  function computeCellsForClue(clue) {
    const [sr, sc] = clue.start;
    const dr = clue.dir === "down" ? 1 : 0;
    const dc = clue.dir === "across" ? 1 : 0;

    const keys = [];
    let r = sr, c = sc;
    while (isWhite(r, c)) {
      keys.push(keyOf(r, c));
      r += dr; c += dc;
    }
    return keys;
  }

  function buildClueMaps() {
    clueCells.clear();
    clueByNumDir.clear();

    for (const clue of CLUES) {
      clueByNumDir.set(`${clue.number}|${clue.dir}`, clue);
      clueCells.set(clue.number, computeCellsForClue(clue));
    }
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

  function updateClueSelectionUI() {
    const items = clueListEl.querySelectorAll(".clue-item");
    items.forEach((el) => {
      const n = Number(el.dataset.number);
      const d = el.dataset.dir;
      const isSel = selectedClue && selectedClue.number === n && selectedClue.dir === d;
      el.classList.toggle("selected", isSel);
    });
  }

  function clearHighlights() {
    for (const { wrapEl } of cellMap.values()) {
      wrapEl.classList.remove("hl", "active");
    }
  }

  function setModeText() {
    if (!selectedClue) {
      modeEl.textContent = "";
      return;
    }
    modeEl.textContent = `Vald: ${selectedClue.number} (${dirLabel(selectedClue.dir)})`;
  }

  function applyHighlights() {
    clearHighlights();
    if (!selectedClue) return;

    const seq = clueCells.get(selectedClue.number) || [];
    for (const k of seq) {
      const info = cellMap.get(k);
      if (info) info.wrapEl.classList.add("hl");
    }
    if (activeCellKey) {
      const info = cellMap.get(activeCellKey);
      if (info) info.wrapEl.classList.add("active");
    }
  }

  function focusKey(cellKey) {
    const info = cellMap.get(cellKey);
    if (!info) return;
    info.inputEl.focus({ preventScroll: true });
    info.inputEl.setSelectionRange?.(0, 1);
    activeCellKey = cellKey;
    applyHighlights();
  }

  function selectClue(clue, focusStart) {
    selectedClue = clue;
    selectedDir = clue.dir;

    const seq = clueCells.get(clue.number) || [];
    if (!activeCellKey || !seq.includes(activeCellKey)) {
      activeCellKey = seq[0] || null;
    }

    updateClueSelectionUI();
    setModeText();
    applyHighlights();

    if (focusStart && activeCellKey) focusKey(activeCellKey);
  }

  function cluesForCellKey(k) {
    const matches = [];
    for (const clue of CLUES) {
      const seq = clueCells.get(clue.number) || [];
      if (seq.includes(k)) matches.push(clue);
    }
    return matches;
  }

  function handleCellPick(r, c) {
    const k = keyOf(r, c);
    const matches = cluesForCellKey(k);
    if (matches.length === 0) return;

    if (matches.length === 1) {
      selectedClue = matches[0];
      selectedDir = selectedClue.dir;
      activeCellKey = k;
      updateClueSelectionUI();
      setModeText();
      applyHighlights();
      return;
    }

    const across = matches.find(m => m.dir === "across");
    const down = matches.find(m => m.dir === "down");

    const alreadyHere = (activeCellKey === k);
    const alreadySelected = selectedClue && matches.some(m => m.number === selectedClue.number && m.dir === selectedClue.dir);

    let next = null;
    if (alreadyHere && alreadySelected) {
      next = (selectedDir === "across") ? (down || across) : (across || down);
    } else {
      next = (selectedDir === "down") ? (down || across) : (across || down);
    }

    selectedClue = next || across || down;
    selectedDir = selectedClue.dir;
    activeCellKey = k;

    updateClueSelectionUI();
    setModeText();
    applyHighlights();
  }

  function allFilled() {
    for (const { inputEl } of cellMap.values()) {
      if (!normalizeChar(inputEl.value)) return false;
    }
    return true;
  }

  function buildExpectedMap() {
    // cellKey -> expected char
    const expected = new Map();

    for (const clue of CLUES) {
      const ans = (ANSWERS[clue.number] || "").toUpperCase();
      const seq = clueCells.get(clue.number) || [];

      if (!ans || ans.length !== seq.length) {
        // If this ever happens, your layout and answer length mismatch.
        // We'll still map what we can.
      }

      for (let i = 0; i < seq.length; i++) {
        const k = seq[i];
        const ch = ans[i] || "";
        if (!ch) continue;

        const prev = expected.get(k);
        if (prev && prev !== ch) {
          // In a valid crossword, overlaps must match.
          // We'll keep the first, but this indicates a mismatch in data.
        } else {
          expected.set(k, ch);
        }
      }
    }

    return expected;
  }

  function checkAnswers() {
    clearPerCellMarks();

    if (!allFilled()) {
      alert("Fyll i hela korsordet för att rätta");
      return;
    }

    const expected = buildExpectedMap();
    let wrong = 0;

    for (const [k, { wrapEl, inputEl }] of cellMap.entries()) {
      const got = normalizeChar(inputEl.value);
      const exp = expected.get(k);

      if (!exp) continue;

      if (got === exp) {
        wrapEl.classList.add("correct");
      } else {
        wrapEl.classList.add("incorrect");
        wrong++;
      }
    }

    if (wrong === 0) alert("Allt rätt!");
    else alert(`${wrong} fel.`);
  }

  clearBtn.addEventListener("click", () => {
    for (const { inputEl, wrapEl } of cellMap.values()) {
      inputEl.value = "";
      wrapEl.classList.remove("correct", "incorrect");
    }
    selectedClue = null;
    selectedDir = null;
    activeCellKey = null;
    clearHighlights();
    updateClueSelectionUI();
    setModeText();
  });

  checkBtn.addEventListener("click", checkAnswers);

  // Init
  buildGrid();
  buildClueMaps();
  renderClues();
  setModeText();
})();
