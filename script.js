(function () {
  // 12 rows x 9 cols. 1 = white/playable, 0 = black/block.
  // Matches your screenshot shape.
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

  // Clue numbers positioned to match your screenshot.
  // key: "row,col" -> number
  const CLUE_NUMBERS = {
    "0,6": 1,
    "2,0": 2,
    "4,3": 3,
    "5,2": 4,
    "7,0": 5,
    "8,7": 6,
    "10,1": 7
  };

  const gridEl = document.getElementById("grid");
  const clearBtn = document.getElementById("clearBtn");

  const rows = LAYOUT.length;
  const cols = LAYOUT[0].length;

  const inputs = [];

  function addClueNumberIfAny(wrapper, r, c) {
    const key = `${r},${c}`;
    if (!(key in CLUE_NUMBERS)) return;

    const s = document.createElement("span");
    s.className = "clue-num";
    s.textContent = String(CLUE_NUMBERS[key]);
    wrapper.appendChild(s);
  }

  function makeBlockCell(r, c) {
    const wrapper = document.createElement("div");
    wrapper.className = "cell cell-wrap cell-block";
    wrapper.setAttribute("aria-hidden", "true");
    // No numbers on black cells for this layout
    return wrapper;
  }

  function makeInputCell(r, c) {
    const wrapper = document.createElement("div");
    wrapper.className = "cell cell-wrap";

    const inp = document.createElement("input");
    inp.className = "cell-input";
    inp.type = "text";
    inp.maxLength = 1;
    inp.autocomplete = "off";
    inp.spellcheck = false;

    // Helps mobile keyboards
    inp.inputMode = "text";
    inp.setAttribute("enterkeyhint", "next");

    inp.dataset.row = String(r);
    inp.dataset.col = String(c);

    addClueNumberIfAny(wrapper, r, c);

    // Keep only one uppercase letter; allow ÅÄÖ too.
    inp.addEventListener("input", () => {
      const v = (inp.value || "").toUpperCase();
      inp.value = v.slice(-1).replace(/[^A-ZÅÄÖ]/g, "");
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
        const idx = inputs.indexOf(inp);
        if (idx > 0) {
          inputs[idx - 1].focus({ preventScroll: true });
        }
        e.preventDefault();
      }
    });

    wrapper.appendChild(inp);
    inputs.push(inp);
    return wrapper;
  }

  // Build grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (LAYOUT[r][c] === 1) {
        gridEl.appendChild(makeInputCell(r, c));
      } else {
        gridEl.appendChild(makeBlockCell(r, c));
      }
    }
  }

  clearBtn.addEventListener("click", () => {
    for (const inp of inputs) inp.value = "";
    if (inputs[0]) inputs[0].focus({ preventScroll: true });
  });
})();
