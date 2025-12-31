(function () {
  const cells = Array.from(document.querySelectorAll(".cell--active"));
  const clearBtn = document.getElementById("clearBtn");

  // Map row/col -> input element for easy navigation
  const byPos = new Map();
  for (const el of cells) {
    const r = Number(el.dataset.row);
    const c = Number(el.dataset.col);
    byPos.set(`${r},${c}`, el);
  }

  function setValue(el, ch) {
    el.value = (ch || "").toUpperCase();
  }

  function isActiveCellAt(r, c) {
    return byPos.has(`${r},${c}`);
  }

  function focusCellAt(r, c) {
    const el = byPos.get(`${r},${c}`);
    if (!el) return;
    el.focus({ preventScroll: true });
    // select text so typing replaces existing letter (nice on desktop)
    el.setSelectionRange?.(0, 1);
  }

  // Decide navigation: arrow keys move in the cross where possible
  function move(el, dr, dc) {
    const r = Number(el.dataset.row);
    const c = Number(el.dataset.col);
    const nr = r + dr;
    const nc = c + dc;
    if (isActiveCellAt(nr, nc)) focusCellAt(nr, nc);
  }

  for (const el of cells) {
    el.addEventListener("beforeinput", (e) => {
      // Prevent mobile "insert multiple chars" behaviors from being weird
      // We'll handle the final value in `input`.
      if (e.inputType === "insertFromPaste") {
        e.preventDefault();
      }
    });

    el.addEventListener("input", (e) => {
      // Keep only first character, uppercase
      const raw = el.value || "";
      const ch = raw.slice(-1); // last typed char
      setValue(el, ch);

      // Auto-advance:
      // If you're on the overlap cell (3,3), go right by default.
      const r = Number(el.dataset.row);
      const c = Number(el.dataset.col);

      if (!ch) return;

      if (r === 3 && c < 5) {
        // On horizontal word, move right
        move(el, 0, 1);
      } else if (c === 3 && r < 5) {
        // On vertical word (except overlap), move down
        move(el, 1, 0);
      }
    });

    el.addEventListener("keydown", (e) => {
      const r = Number(el.dataset.row);
      const c = Number(el.dataset.col);

      if (e.key === "Backspace") {
        if (el.value) {
          // clear current
          setValue(el, "");
        } else {
          // move back (left on horizontal, up on vertical)
          if (r === 3) {
            // horizontal
            move(el, 0, -1);
          } else if (c === 3) {
            // vertical
            move(el, -1, 0);
          }
        }
        e.preventDefault();
        return;
      }

      if (e.key === "Delete") {
        setValue(el, "");
        e.preventDefault();
        return;
      }

      // Arrow navigation (where it makes sense)
      if (e.key === "ArrowLeft") { move(el, 0, -1); e.preventDefault(); return; }
      if (e.key === "ArrowRight") { move(el, 0, 1); e.preventDefault(); return; }
      if (e.key === "ArrowUp") { move(el, -1, 0); e.preventDefault(); return; }
      if (e.key === "ArrowDown") { move(el, 1, 0); e.preventDefault(); return; }

      // If a letter is typed via keydown, let input handler deal with it.
    });
  }

  clearBtn.addEventListener("click", () => {
    for (const el of cells) setValue(el, "");
    // focus center overlap cell
    focusCellAt(3, 3);
  });

  // Initial focus for desktop (mobile will ignore until user taps)
  focusCellAt(3, 3);
})();
