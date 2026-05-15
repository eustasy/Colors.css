// Colors.css site — main app logic
(function () {
  'use strict';

  const { palettes, index, meta } = window.COLORS_DATA;
  const U = window.ColorUtils;

  // ---------- Helpers ----------
  function slugify(s) {
    return String(s)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function $(sel, root = document) { return root.querySelector(sel); }
  function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

  // ---------- Grouping ----------
  // Detect "family" for a color name within a palette.
  // Returns { family, shadeOrder, sub } where shadeOrder is used to sort within family.
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
    if (m) return { family: m[1].trim(), shadeOrder: 99999, sub: 'text' };
    // bare name — possibly the "main" value of a family or its own thing
    return { family: name, shadeOrder: -1, sub: 'base' };
  }

  // Special-case sub-palette bare values that belong to a known family
  const aliasesPerPalette = {
    flexoki: { black: 'base', paper: 'base' }, // "black" + "paper" join the base ramp
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
    const sizes = [...fams.values()].map(v => v.length);
    const maxSize = Math.max(0, ...sizes);
    if (maxSize <= 2) {
      // No real shade groups — return a single un-named group.
      const flat = entries.map(([name, hex]) => ({ name, hex, order: 0, sub: null }));
      return [{ family: '', items: flat }];
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
    if (other.length) grouped.push({ family: 'Other', items: other });
    return grouped;
  }

  // ---------- Format computation ----------
  function isHex(s) { return /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(String(s || '').trim()); }

  function formatsFor(slug, name, hex) {
    const slugName = slugify(name);
    const base = {
      name,
      var:   `var(--${slug}-${slugName})`,
      class: `${slug}-${slugName}`,
    };
    if (!isHex(hex)) {
      return { ...base, hex: hex, rgb: hex, hsl: hex, oklch: hex, p3: hex };
    }
    return {
      ...base,
      hex:   U.toHex(hex),
      rgb:   U.toRgb(hex),
      hsl:   U.toHsl(hex),
      oklch: U.toOklch(hex),
      p3:    U.toP3(hex),
    };
  }

  // ---------- Rendering ----------
  const palettesRoot = $('#palettes-root');
  const paletteNav = $('#palette-nav');

  function paletteDisplayName(slug) {
    for (const [display, s] of Object.entries(index)) if (s === slug) return display;
    return slug;
  }

  function renderPaletteNav() {
    paletteNav.innerHTML = '';
    for (const [display, slug] of Object.entries(index)) {
      const a = document.createElement('a');
      a.href = '#p-' + slug;
      a.textContent = display;
      a.dataset.slug = slug;
      paletteNav.appendChild(a);
    }
  }

  function familyAccentColor(items) {
    // Pick a representative mid-tone for the family chip
    if (!items.length) return '#888';
    // Prefer shade ~500 or middle index
    const target = items.find(i => /500|550|600/.test(String(i.order))) ?? items[Math.floor(items.length / 2)];
    return target.hex;
  }

  function renderPalette(slug) {
    const palette = palettes[slug];
    const m = meta[slug] || {};
    const groups = groupPalette(slug, palette);
    const total = Object.keys(palette).length;
    const display = paletteDisplayName(slug);

    const section = document.createElement('article');
    section.className = 'palette';
    section.id = 'p-' + slug;
    section.dataset.slug = slug;

    // Header
    const header = document.createElement('header');
    header.className = 'palette-header';
    const embedSrc = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/eustasy/Colors.css@2/${slug}.min.css" crossorigin="anonymous">`;
    header.innerHTML = `
      <div class="palette-title">
        <h3>${escapeHtml(display)}</h3>
        <span class="count">${total} colors${groups.length > 1 ? ` · ${groups.filter(g=>g.family).length} families` : ''}</span>
        ${m.description ? `<p class="palette-desc">${escapeHtml(m.description)}${m.source ? ` <a href="${m.source.url}">${escapeHtml(m.source.label)} ↗</a>` : ''}</p>` : ''}
      </div>
      <div class="palette-embed" title="${escapeAttr(embedSrc)}">
        <span class="embed-text">cdn.jsdelivr.net/gh/eustasy/Colors.css@2/<strong>${slug}</strong>.min.css</span>
        <button data-embed="${escapeAttr(embedSrc)}">Copy &lt;link&gt;</button>
      </div>
    `;
    section.appendChild(header);

    // Families
    for (const group of groups) {
      const fam = document.createElement('div');
      fam.className = 'family';
      fam.dataset.family = group.family || 'all';

      if (group.family) {
        const accent = familyAccentColor(group.items);
        const h4 = document.createElement('h4');
        h4.innerHTML = `<span class="dot" style="background:${accent}"></span>${escapeHtml(group.family)} <span style="color:var(--tx-3); font-weight:400; margin-left:.2rem;">${group.items.length}</span>`;
        fam.appendChild(h4);
      }

      const sw = document.createElement('div');
      sw.className = 'swatches';
      // Larger groups → tighter grid
      if (group.items.length > 10) sw.classList.add('tight');

      for (const it of group.items) {
        const btn = document.createElement('button');
        btn.className = 'swatch';
        const hasHex = isHex(it.hex);
        btn.style.background = hasHex ? it.hex : 'transparent';
        btn.style.color = hasHex ? U.pickForeground(it.hex) : 'var(--tx)';
        if (!hasHex) {
          btn.style.backgroundImage = 'repeating-linear-gradient(45deg, var(--paper-2) 0 6px, var(--ui-2) 6px 7px)';
          btn.classList.add('swatch-keyword');
        }
        btn.dataset.slug = slug;
        btn.dataset.name = it.name;
        btn.dataset.hex = it.hex;
        btn.title = hasHex ? `${it.name} · ${it.hex.toUpperCase()}` : `${it.name} · keyword`;
        btn.innerHTML = `
          <span class="swatch-name">${escapeHtml(it.name)}</span>
          <span class="swatch-hex">${escapeHtml(hasHex ? it.hex.toUpperCase() : it.hex)}</span>
        `;
        sw.appendChild(btn);
      }
      fam.appendChild(sw);
      section.appendChild(fam);
    }

    palettesRoot.appendChild(section);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ---------- Popover ----------
  const pop = $('#copy-pop');
  const popChip = $('#pop-chip');
  const popName = $('#pop-name');
  const popSub = $('#pop-sub');
  const popRows = $('#pop-rows');
  const popContrast = $('#pop-contrast');

  let popTarget = null;
  let popHideTimer = null;

  const FORMATS = [
    ['name',  'Name'],
    ['var',   'CSS var'],
    ['class', 'Class'],
    ['hex',   'Hex'],
    ['rgb',   'RGB'],
    ['hsl',   'HSL'],
    ['oklch', 'OKLCH'],
    ['p3',    'P3'],
  ];

  function buildPopRows(fmts, hasHex = true) {
    popRows.innerHTML = '';
    const list = hasHex ? FORMATS : FORMATS.filter(([k]) => ['name', 'var', 'class', 'hex'].includes(k));
    for (const [key, label] of list) {
      const row = document.createElement('button');
      row.className = 'pop-row';
      row.dataset.fmt = key;
      row.innerHTML = `
        <span class="label">${label}</span>
        <span class="val">${escapeHtml(fmts[key])}</span>
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
      `;
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        copyText(fmts[key]);
        flashRow(row);
        showToast(`Copied ${label.toLowerCase()} · ${truncate(fmts[key], 40)}`);
      });
      popRows.appendChild(row);
    }
  }

  function showPopFor(btn) {
    clearTimeout(popHideTimer);
    popTarget = btn;
    const slug = btn.dataset.slug;
    const name = btn.dataset.name;
    const hex = btn.dataset.hex;
    const fmts = formatsFor(slug, name, hex);
    const hasHex = isHex(hex);

    popChip.style.background = hasHex ? hex : 'repeating-linear-gradient(45deg, var(--paper-2) 0 4px, var(--ui-2) 4px 5px)';
    popName.textContent = `${slug}-${slugify(name)}`;
    popSub.textContent = hasHex ? `${name} · ${hex.toUpperCase()}` : `${name} · CSS keyword`;

    if (hasHex) {
      const styles = getComputedStyle(document.documentElement);
      const bg = styles.getPropertyValue('--paper').trim() || '#FFFCF0';
      const fg = styles.getPropertyValue('--tx').trim() || '#100F0F';
      const cBg = U.contrast(hex, bg).toFixed(2);
      const cFg = U.contrast(hex, fg).toFixed(2);
      popContrast.innerHTML = `<span title="Contrast vs page background / vs body text">${cBg}:1 bg &nbsp;·&nbsp; ${cFg}:1 tx</span>`;
    } else {
      popContrast.innerHTML = `<span>CSS keyword</span>`;
    }

    buildPopRows(fmts, hasHex);

    positionPop(btn);
    pop.classList.add('open');
  }

  function positionPop(btn) {
    const r = btn.getBoundingClientRect();
    pop.style.visibility = 'hidden';
    pop.classList.add('open');
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    pop.classList.remove('open');
    pop.style.visibility = '';

    let left = r.left + r.width / 2 - pw / 2;
    let top = r.bottom + 8;
    if (left + pw + 8 > innerWidth) left = innerWidth - pw - 8;
    if (left < 8) left = 8;
    if (top + ph + 8 > innerHeight) top = r.top - ph - 8;
    if (top < 8) top = 8;
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  function hidePop(delay = 100) {
    clearTimeout(popHideTimer);
    popHideTimer = setTimeout(() => {
      pop.classList.remove('open');
      popTarget = null;
    }, delay);
  }

  function flashRow(row) {
    row.classList.add('copied');
    setTimeout(() => row.classList.remove('copied'), 700);
  }
  function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  // ---------- Clipboard + toast ----------
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else { fallbackCopy(text); }
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.top = '-1000px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  const toast = $('#toast');
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  // ---------- Wiring ----------
  function wire() {
    // Swatch hover/click delegation
    palettesRoot.addEventListener('pointerover', (e) => {
      const sw = e.target.closest('.swatch');
      if (!sw) return;
      showPopFor(sw);
    });
    palettesRoot.addEventListener('pointerleave', () => hidePop(150), true);
    palettesRoot.addEventListener('focusin', (e) => {
      const sw = e.target.closest('.swatch');
      if (sw) showPopFor(sw);
    });

    // Keep pop open while hovered
    pop.addEventListener('pointerenter', () => clearTimeout(popHideTimer));
    pop.addEventListener('pointerleave', () => hidePop(100));

    // Swatch click → copy default format
    palettesRoot.addEventListener('click', (e) => {
      const sw = e.target.closest('.swatch');
      if (!sw) return;
      const fmt = $('#format-select').value;
      const fmts = formatsFor(sw.dataset.slug, sw.dataset.name, sw.dataset.hex);
      copyText(fmts[fmt]);
      const label = FORMATS.find(f => f[0] === fmt)[1];
      showToast(`Copied ${label.toLowerCase()} · ${truncate(fmts[fmt], 40)}`);
    });

    window.addEventListener('scroll', () => { if (popTarget) positionPop(popTarget); }, { passive: true });
    window.addEventListener('resize', () => { if (popTarget) positionPop(popTarget); });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hidePop(0);
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        $('#search').focus();
      }
    });

    // Codeblock copy buttons
    $$('.codeblock').forEach(cb => {
      const btn = cb.querySelector('.copy-btn');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const src = cb.dataset.copySrc || cb.querySelector('pre').textContent;
        copyText(src);
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
      });
    });

    // Palette embed copy
    palettesRoot.addEventListener('click', (e) => {
      const eb = e.target.closest('.palette-embed button[data-embed]');
      if (!eb) return;
      e.stopPropagation();
      copyText(eb.dataset.embed);
      const orig = eb.textContent;
      eb.textContent = 'Copied';
      eb.classList.add('copied');
      setTimeout(() => { eb.textContent = orig; eb.classList.remove('copied'); }, 1500);
    });

    // Theme toggle
    const themeBtn = $('#theme-toggle');
    themeBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const next = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('colorscss-theme', next);
      themeBtn.querySelector('svg').style.transform = next === 'dark' ? 'rotate(180deg)' : '';
    });

    // Format select persistence
    const fs = $('#format-select');
    const savedFmt = localStorage.getItem('colorscss-format');
    if (savedFmt && [...fs.options].some(o => o.value === savedFmt)) fs.value = savedFmt;
    fs.addEventListener('change', () => localStorage.setItem('colorscss-format', fs.value));

    // Search
    const search = $('#search');
    let searchTimer = null;
    search.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => applySearch(search.value), 80);
    });

    // Palette nav scrollspy — pick the section whose top is most recently above the threshold
    const navLinks = $$('#palette-nav a');
    const sections = $$('.palette');
    function updateActive() {
      const threshold = 130; // just below site header + palette nav
      let current = null;
      for (const s of sections) {
        const top = s.getBoundingClientRect().top;
        if (top <= threshold) current = s;
        else break;
      }
      // If we're scrolled past the last one's bottom, still keep it active
      const last = sections[sections.length - 1];
      if (last && last.getBoundingClientRect().bottom < threshold) current = last;
      navLinks.forEach(l => l.classList.toggle('active', current ? l.dataset.slug === current.dataset.slug : false));
    }
    let raf = 0;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; updateActive(); });
    }, { passive: true });
    updateActive();
  }

  // ---------- Search ----------
  function applySearch(q) {
    q = q.trim().toLowerCase();
    const palettes = $$('.palette');
    if (!q) {
      palettes.forEach(p => {
        p.classList.remove('hidden');
        $$('.family', p).forEach(f => f.classList.remove('hidden'));
        $$('.swatch', p).forEach(s => s.classList.remove('hidden'));
      });
      return;
    }
    for (const p of palettes) {
      const slug = p.dataset.slug;
      let pmatch = slug.includes(q) || paletteDisplayName(slug).toLowerCase().includes(q);
      let anyFamilyVisible = false;
      for (const fam of $$('.family', p)) {
        const famName = (fam.dataset.family || '').toLowerCase();
        const famMatch = pmatch || famName.includes(q);
        let anySwatch = false;
        for (const sw of $$('.swatch', fam)) {
          const hit = pmatch || famMatch ||
            sw.dataset.name.toLowerCase().includes(q) ||
            sw.dataset.hex.toLowerCase().includes(q);
          sw.classList.toggle('hidden', !hit);
          if (hit) anySwatch = true;
        }
        fam.classList.toggle('hidden', !anySwatch);
        if (anySwatch) anyFamilyVisible = true;
      }
      p.classList.toggle('hidden', !anyFamilyVisible);
    }
  }

  // ---------- Init ----------
  function init() {
    renderPaletteNav();
    for (const slug of Object.values(index)) renderPalette(slug);
    wire();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
