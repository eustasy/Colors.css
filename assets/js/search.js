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

  // Show/hide each swatch in a family; returns whether any stayed visible.
  function filterSwatches(fam, q, famMatch) {
    let any = false;
    for (const sw of $$(".swatch", fam)) {
      const hit = famMatch || sw.dataset.name.toLowerCase().includes(q) || sw.dataset.hex.toLowerCase().includes(q);
      sw.classList.toggle("hidden", !hit);
      if (hit) any = true;
    }
    return any;
  }

  // Show/hide each family in a palette; returns whether any stayed visible.
  function filterFamilies(p, q, pmatch) {
    let any = false;
    for (const fam of $$(".family", p)) {
      const famMatch = pmatch || (fam.dataset.family || "").toLowerCase().includes(q);
      const visible = filterSwatches(fam, q, famMatch);
      fam.classList.toggle("hidden", !visible);
      if (visible) any = true;
    }
    return any;
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
      const pmatch = p.dataset.slug.includes(q) || displayName(p.dataset.slug).toLowerCase().includes(q);
      p.classList.toggle("hidden", !filterFamilies(p, q, pmatch));
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
