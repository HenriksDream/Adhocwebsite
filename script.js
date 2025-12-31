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

  // Clues + where each word starts + direction.
  // Directions:
  //   "down" = lodrätt
  //   "across" = vågrätt
  //
  // NOTE: Word lengths are inferred from the layout automatically.
  const CLUES = [
    {
      number: 1,
      dir: "down",
      start: [0, 6],
      text: "Världens första rymdflygning med bara kvinnor skedde 2025. Katy Perry var en av resenärerna, vad tog hon med sig upp i rymden?"
    },
    {
      number: 2,
      dir: "across",
      start: [2, 0],
      text: "Från vilken stad kommer nya påven Leo XIV?"
    },
    {
      number: 3,
      dir: "down",
      start: [4, 3],
      text: "Taylor Swift kallade sin blivande make för gympalärare när hon postade om deras förlovning. Vilket ämne kallade hon sig själv lärare i?"
    },
    {
      number: 4,
      dir: "across",
      start: [5, 2],
      text: "Vilket land vann fotbolls EM på damsidan 2025?"
    },
    {
      number: 5,
      dir: "across",
      start: [7, 0],
      text: "Vilket land vann Eurovision 2025?"
    },
    {
      number: 6,
      dir: "down",
      start: [8, 7],
      text: "Vilken grupp vann Melodifestivalen?"
    },
    {
      number: 7,
      dir: "across",
      start: [10, 1],
      text: "Donald trump bannlyste detta i 12 timmar"
    },
  ];

  const gridEl = document.getElementById("grid");
  const clueListEl = document.getElementById("clueList");
  const clearBtn = document.getElementById("clearBtn");
  const modeEl = document.getElementById("mode");

  const rows = LAYOUT.length;
  const cols = LAYOUT[0].length;

  // Maps "r,c" -> { wrapEl, inputEl }
  const cellMap = new Map();

  // For each clue, store computed cell positions: [[r,c],...]
  const clueCells = new Map(); // number -> array of "r,c" keys
  const clueByNumberDir = new Map(); // "num|dir" -> clue object

  // Selection state
  let selectedClue = null; // clue object
  let selectedDir = null;  // "across" | "down"
  let activeCellKey = null;

  function keyOf(r, c) { return `${r},${c}`; }
  function isWhite(r, c) { return r >= 0 && r < rows && c >= 0 && c < cols && LAYOUT[r][c] === 1; }

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

    // Click/tap selects word for that cell
    inp.addEventListener("pointerdown", (e) => {
      // Prevent scroll-jank on mobile while still focusing
      e.preventDefault();
      handleCellPick(r, c);
      inp.focus({ preventScroll: true });
    });

    // Keep only one uppercase letter; allow ÅÄÖ too.
    inp.addEventListener("input", () => {
      const v = (inp.value || "").toUpperCase();
      inp.value = v.slice(-1).replace(/[^A-ZÅÄÖ]/g, "");

      // auto-advance within selected word if possible
      if (!selectedClue) return;
      const seq = clueCells.get(selectedClue.number) || [];
      const here = keyOf(r, c);
      const idx = seq.indexOf(here);
      if (idx >= 0 && inp.value) {
        const nextKey = seq[idx + 1];
        if (nextKey) focusKey(nextKey);
      }
    });

    // Backspace/Delete handling within selected word
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

      // Optional: arrow keys move within selected word
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
    clueByNumberDir.clear();

    for (const clue of CLUES) {
      clueByNumberDir.set(`${clue.number}|${clue.dir}`, clue);
      clueCells.set(clue.number, computeCellsForClue(clue));
    }
  }

  function dirLabel(dir) {
    return dir === "across" ? "Vågrätt" : "Lodrätt";
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

      li.addEventListener("click", () => {
        selectClue(clue);
      });

      clueListEl.appendChild(li);
    }
  }

  function clearHighlights() {
    for (const { wrapEl } of cellMap.values()) {
      wrapEl.classList.remove("hl");
      wrapEl.classList.remove("active");
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

  function setModeText() {
    if (!selectedClue) {
      modeEl.textContent = "";
      return;
    }
    modeEl.textContent = `Vald: ${selectedClue.number} (${dirLabel(selectedClue.dir)})`;
  }

  function focusKey(cellKey) {
    const info = cellMap.get(cellKey);
    if (!info) return;
    info.inputEl.focus({ preventScroll: true });
    info.inputEl.setSelectionRange?.(0, 1);
    activeCellKey = cellKey;
    applyHighlights();
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

  function selectClue(clue) {
    selectedClue = clue;
    selectedDir = clue.dir;
    activeCellKey = clueCells.get(clue.number)?.[0] || null;

    updateClueSelectionUI();
    setModeText();
    applyHighlights();

    if (activeCellKey) focusKey(activeCellKey);
  }

  function cluesForCell(r, c) {
    const k = keyOf(r, c);
    const matches = [];
    for (const clue of CLUES) {
      const seq = clueCells.get(clue.number) || [];
      if (seq.includes(k)) matches.push(clue);
    }
    return matches; // could be 0,1,2
  }

  function handleCellPick(r, c) {
    const k = keyOf(r, c);
    const matches = cluesForCell(r, c);

    if (matches.length === 0) return;

    // If exactly one word uses this cell: select it
    if (matches.length === 1) {
      const clue = matches[0];
      // keep active at this cell
      selectedClue = clue;
      selectedDir = clue.dir;
      activeCellKey = k;
      updateClueSelectionUI();
      setModeText();
      applyHighlights();
      return;
    }

    // If two words (across+down): decide by current selection; allow toggle by re-tapping same cell
    const across = matches.find(m => m.dir === "across");
    const down = matches.find(m => m.dir === "down");

    const alreadyHere = (activeCellKey === k);
    const alreadySelected = selectedClue && matches.some(m => m.number === selectedClue.number && m.dir === selectedClue.dir);

    let next = null;

    if (alreadyHere && alreadySelected) {
      // toggle direction
      if (selectedDir === "across") next = down || across;
      else next = across || down;
    } else {
      // prefer current direction if set, otherwise across
      if (selectedDir === "down") next = down || across;
      else next = across || down;
    }

    if (!next) next = across || down;

    selectedClue = next;
    selectedDir = next.dir;
    activeCellKey = k;

    updateClueSelectionUI();
    setModeText();
    applyHighlights();
  }

  clearBtn.addEventListener("click", () => {
    for (const { inputEl } of cellMap.values()) inputEl.value = "";
    selectedClue = null;
    selectedDir = null;
    activeCellKey = null;
    clearHighlights();
    updateClueSelectionUI();
    setModeText();
  });

  // Init
  buildGrid();
  buildClueMaps();
  renderClues();
  setModeText();
})();
