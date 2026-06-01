// Colors.css site — initial page build (runs once on load).
// Reads window.COLORS_DATA and renders the palette nav, the palette sections,
// and the count-aware page chrome. The interactive layer lives in app.js, which
// calls ColorPage.render() and then wires events against this DOM.
(function (global) {
  "use strict";

  const { palettes, index, meta } = window.COLORS_DATA;
  const U = window.ColorUtils;
  const { $, $$, escapeHtml, escapeAttr } = window.DOM;

  const palettesRoot = $("#palettes-root");
  const paletteNav = $("#palette-nav");

  function paletteDisplayName(slug) {
    for (const [display, s] of Object.entries(index)) if (s === slug) return display;
    return slug;
  }

  // ---------- Grouping ----------
  // Detect the "family" for a color name within a palette.
  // Returns { family, shadeOrder, sub }; shadeOrder sorts within a family.
  function detectFamily(name) {
    let m;
    // "name 500" or "name A500"
    m = name.match(/^(.+?)\s+(A)?(\d+)$/);
    if (m) return { family: m[1].trim(), shadeOrder: (m[2] ? 10000 : 0) + parseInt(m[3], 10), sub: null };
    // "name-500"
    m = name.match(/^(.+?)-(\d+)$/);
    if (m) return { family: m[1].trim(), shadeOrder: parseInt(m[2], 10), sub: null };
    // "name Text"
    m = name.match(/^(.+?)\s+Text$/i);
    if (m) return { family: m[1].trim(), shadeOrder: 99999, sub: "text" };
    // bare name — possibly the "main" value of a family or its own thing
    return { family: name, shadeOrder: -1, sub: "base" };
  }

  // Special-case sub-palette bare values that belong to a known family
  const aliasesPerPalette = {
    flexoki: { black: "base", paper: "base" }, // "black" + "paper" join the base ramp
  };
  const aliasShade = {
    flexoki: { black: 1000, paper: 0 },
  };

  function groupPalette(slug, palette) {
    const entries = Object.entries(palette);
    const fams = new Map();
    const aliasMap = aliasesPerPalette[slug] || {};
    const aliasShadeMap = aliasShade[slug] || {};

    for (const [name, hex] of entries) {
      let fam, order, sub;
      if (aliasMap[name]) {
        fam = aliasMap[name];
        order = aliasShadeMap[name] ?? -1;
        sub = name;
      } else {
        const d = detectFamily(name);
        fam = d.family;
        order = d.shadeOrder;
        sub = d.sub;
      }
      if (!fams.has(fam)) fams.set(fam, []);
      fams.get(fam).push({ name, hex, order, sub });
    }

    // Merge size-1 families (lone names) into "Other" — UNLESS the whole palette has
    // no families of size >2, in which case there's no grouping at all.
    const sizes = [...fams.values()].map((v) => v.length);
    const maxSize = Math.max(0, ...sizes);
    if (maxSize <= 2) {
      // No real shade groups — return a single un-named group.
      const flat = entries.map(([name, hex]) => ({ name, hex, order: 0, sub: null }));
      return [{ family: "", items: flat }];
    }

    // Big families stay; lone singletons (no siblings sharing the prefix) → Other
    const grouped = [];
    const other = [];
    for (const [fam, items] of fams) {
      if (items.length === 1) {
        other.push(items[0]);
      } else {
        items.sort((a, b) => a.order - b.order);
        grouped.push({ family: fam, items });
      }
    }
    if (other.length) grouped.push({ family: "Other", items: other });
    return grouped;
  }

  // ---------- Rendering ----------
  function familyAccentColor(items) {
    // Pick a representative mid-tone for the family chip
    if (!items.length) return "#888";
    // Prefer shade ~500 or middle index
    const target = items.find((i) => /500|550|600/.test(String(i.order))) ?? items[Math.floor(items.length / 2)];
    return target.hex;
  }

  function renderPaletteNav() {
    paletteNav.innerHTML = "";
    for (const [display, slug] of Object.entries(index)) {
      const a = document.createElement("a");
      a.href = "#p-" + slug;
      a.textContent = display;
      a.dataset.slug = slug;
      paletteNav.appendChild(a);
    }
  }

  function paletteHeader(slug, display, total, groups, m) {
    const header = document.createElement("header");
    header.className = "palette-header";
    const embedSrc = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/eustasy/Colors.css@2/${slug}.min.css" crossorigin="anonymous">`;
    const families = groups.length > 1 ? ` · ${groups.filter((g) => g.family).length} families` : "";
    const source = m.source ? ` <a href="${m.source.url}">${escapeHtml(m.source.label)} ↗</a>` : "";
    const desc = m.description ? `<p class="palette-desc">${escapeHtml(m.description)}${source}</p>` : "";
    header.innerHTML = `
      <div class="palette-title">
        <h3>${escapeHtml(display)}</h3>
        <span class="count">${total} colors${families}</span>
        ${desc}
      </div>
      <div class="palette-embed" title="${escapeAttr(embedSrc)}">
        <span class="embed-text">cdn.jsdelivr.net/gh/eustasy/Colors.css@2/<strong>${slug}</strong>.min.css</span>
        <button data-embed="${escapeAttr(embedSrc)}">Copy &lt;link&gt;</button>
      </div>
    `;
    return header;
  }

  function renderSwatch(slug, it) {
    const btn = document.createElement("button");
    btn.className = "swatch";
    const hasHex = U.isHex(it.hex);
    btn.style.background = hasHex ? it.hex : "transparent";
    btn.style.color = hasHex ? U.pickForeground(it.hex) : "var(--tx)";
    if (!hasHex) {
      btn.style.backgroundImage = "repeating-linear-gradient(45deg, var(--paper-2) 0 6px, var(--ui-2) 6px 7px)";
      btn.classList.add("swatch-keyword");
    }
    btn.dataset.slug = slug;
    btn.dataset.name = it.name;
    btn.dataset.hex = it.hex;
    btn.title = hasHex ? `${it.name} · ${it.hex.toUpperCase()}` : `${it.name} · keyword`;
    btn.innerHTML = `
          <span class="swatch-name">${escapeHtml(it.name)}</span>
          <span class="swatch-hex">${escapeHtml(hasHex ? it.hex.toUpperCase() : it.hex)}</span>
        `;
    return btn;
  }

  function renderFamily(slug, group) {
    const fam = document.createElement("div");
    fam.className = "family";
    fam.dataset.family = group.family || "all";

    if (group.family) {
      const accent = familyAccentColor(group.items);
      const h4 = document.createElement("h4");
      h4.innerHTML = `<span class="dot" style="background:${accent}"></span>${escapeHtml(group.family)} <span style="color:var(--tx-3); font-weight:400; margin-left:.2rem;">${group.items.length}</span>`;
      fam.appendChild(h4);
    }

    const sw = document.createElement("div");
    sw.className = "swatches";
    // Larger groups → tighter grid
    if (group.items.length > 10) sw.classList.add("tight");

    for (const it of group.items) sw.appendChild(renderSwatch(slug, it));
    fam.appendChild(sw);
    return fam;
  }

  function renderPalette(slug) {
    const palette = palettes[slug];
    const m = meta[slug] || {};
    const groups = groupPalette(slug, palette);
    const total = Object.keys(palette).length;
    const display = paletteDisplayName(slug);

    const section = document.createElement("article");
    section.className = "palette";
    section.id = "p-" + slug;
    section.dataset.slug = slug;

    section.appendChild(paletteHeader(slug, display, total, groups, m));
    for (const group of groups) section.appendChild(renderFamily(slug, group));

    palettesRoot.appendChild(section);
  }

  // ---------- Page chrome that tracks the palette set ----------
  // Keeps hardcoded counts/lists in index.html in sync with COLORS_DATA,
  // so adding a palette only means adding its data files.
  function numberWord(n) {
    const words = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
      "twenty",
    ];
    return words[n] || String(n);
  }

  function renderChrome() {
    const slugs = Object.values(index);
    const n = slugs.length;

    $$("[data-palette-count-word]").forEach((el) => {
      el.textContent = numberWord(n);
    });

    $$("[data-palette-slugs]").forEach((el) => {
      el.innerHTML = "";
      slugs.forEach((slug, i) => {
        if (i > 0) el.appendChild(document.createTextNode(i === n - 1 ? ", or " : ", "));
        const code = document.createElement("code");
        code.textContent = slug;
        el.appendChild(code);
      });
    });
  }

  function render() {
    renderChrome();
    renderPaletteNav();
    for (const slug of Object.values(index)) renderPalette(slug);
  }

  global.ColorPage = { render };
})(window);
