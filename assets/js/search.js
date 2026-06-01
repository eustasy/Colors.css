// Colors.css site — palette/colour search filter.
//
// Self-contained: it works off the rendered-DOM contract the app.js renderer
// emits — .palette[data-slug], .family[data-family], .swatch[data-name][data-hex]
// — and toggles a `.hidden` class. It reads window.COLORS_DATA only for palette
// display names, so it shares no state with the rest of app.js.
(function () {
  "use strict";

  const { index } = window.COLORS_DATA;

  function $$(sel, root = document) {
    return [...root.querySelectorAll(sel)];
  }

  // slug -> display name (reverse of COLORS_DATA.index, which maps name -> slug)
  function displayName(slug) {
    for (const [display, s] of Object.entries(index)) if (s === slug) return display;
    return slug;
  }

  // Filter the rendered palettes/families/swatches against the query by toggling
  // `.hidden`. An empty query restores everything.
  function apply(q) {
    q = q.trim().toLowerCase();
    const palettes = $$(".palette");
    if (!q) {
      palettes.forEach((p) => {
        p.classList.remove("hidden");
        $$(".family", p).forEach((f) => f.classList.remove("hidden"));
        $$(".swatch", p).forEach((s) => s.classList.remove("hidden"));
      });
      return;
    }
    for (const p of palettes) {
      const slug = p.dataset.slug;
      let pmatch = slug.includes(q) || displayName(slug).toLowerCase().includes(q);
      let anyFamilyVisible = false;
      for (const fam of $$(".family", p)) {
        const famName = (fam.dataset.family || "").toLowerCase();
        const famMatch = pmatch || famName.includes(q);
        let anySwatch = false;
        for (const sw of $$(".swatch", fam)) {
          const hit = pmatch || famMatch || sw.dataset.name.toLowerCase().includes(q) || sw.dataset.hex.toLowerCase().includes(q);
          sw.classList.toggle("hidden", !hit);
          if (hit) anySwatch = true;
        }
        fam.classList.toggle("hidden", !anySwatch);
        if (anySwatch) anyFamilyVisible = true;
      }
      p.classList.toggle("hidden", !anyFamilyVisible);
    }
  }

  // Wire up the search input: live (debounced) filtering, a count-aware
  // placeholder, and the "/" focus shortcut.
  function wire(input) {
    if (!input) return;
    input.placeholder = `Search ${Object.keys(index).length} palettes…`;

    let timer = null;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => apply(input.value), 80);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        input.focus();
      }
    });
  }

  window.ColorSearch = { apply, wire };
})();
