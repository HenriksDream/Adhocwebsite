(function () {
  // 12 rows x 9 cols. 1 = white/playable, 0 = black/block.
  // This matches the shape in your image.
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

  const gridEl = document.getElementById("grid");
  const clearBtn = document.getElementById("clearBtn");

  const rows = LAYOUT.length;
  const cols = LAYOUT[0].length;

  // Keep a row-major list of inputs for simple navigation (optional).
  const inputs = [];

  function makeBlockCell() {
    const d = document.createElement("div");
    d.className = "cell cell-block";
    d.setAttribute("aria-hidden", "true");
    return d;
  }

  function makeInputCell(r, c) {
    const inp = document.createElement("input");
    inp.className = "cell cell-input";
    inp.type = "text";
    inp.maxLength = 1;
    inp.autocomplete = "off";
    inp.spellcheck = false;

    // Helps mobile keyboards
    inp.inputMode = "text";
    inp.setAttribute("enterkeyhint", "next");

    inp.dataset.row = String(r);
    inp.dataset.col = String(c);

    // Force single uppercase letter, allow empty.
    inp.addEventListener("input", () => {
      const v = (inp.value || "").toUpperCase();
      inp.value = v.slice(-1).replace(/[^A-ZÅÄÖ]/g, ""); // allows Swedish letters too
    });

    // Backspace/Delete clears. If empty + Backspace, move to previous input in row-major order.
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
        // move to previous input in list if empty
        const idx = inputs.indexOf(inp);
        if (idx > 0) {
          inputs[idx - 1].focus({ preventScroll: true });
        }
        e.preventDefault();
      }
    });

    return inp;
  }

  // Build grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (LAYOUT[r][c] === 1) {
        const inp = makeInputCell(r, c);
        gridEl.appendChild(inp);
        inputs.push(inp);
      } else {
        gridEl.appendChild(makeBlockCell());
      }
    }
  }

  clearBtn.addEventListener("click", () => {
    for (const inp of inputs) inp.value = "";
    if (inputs[0]) inputs[0].focus({ preventScroll: true });
  });
})();
