// ── Menu chess piece decorations ──────────────────────────────────
(function () {
  const deco = document.getElementById('menu-deco');
  const pieces = ['\u2654','\u2655','\u2656','\u2657','\u2658','\u2659','\u265a','\u265b','\u265c','\u265d','\u265e','\u265f'];
  const rng = (() => { let s = 42; return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }; })();

  // Returns a [left%, top%] pair guaranteed to be outside the center content area.
  // Exclusion zone: horizontal 28-72%, vertical 20-80% (title + 3 buttons).
  function safePos() {
    for (let attempt = 0; attempt < 40; attempt++) {
      const l = rng() * 100, t = rng() * 100;
      if (l >= 28 && l <= 72 && t >= 20 && t <= 80) continue;
      return [l, t];
    }
    // Fallback: force into a corner zone
    return [rng() < 0.5 ? rng() * 24 : 76 + rng() * 24, rng() * 100];
  }

  // Scatter chess piece characters
  for (let i = 0; i < 32; i++) {
    const el = document.createElement('span');
    el.className = 'menu-deco-piece';
    el.textContent = pieces[i % pieces.length];
    const size = 2.0 + rng() * 3.2;
    const rot  = (rng() - 0.5) * 50;
    const op   = 0.07 + rng() * 0.1;
    const [l, t] = safePos();
    el.style.cssText = `left:${l.toFixed(2)}%;top:${t.toFixed(2)}%;font-size:${size.toFixed(2)}rem;opacity:${op.toFixed(3)};transform:translate(-50%,-50%) rotate(${rot.toFixed(1)}deg);`;
    deco.appendChild(el);
  }

  // Scatter small chess boards (4x4 checker pattern)
  const ns = 'http://www.w3.org/2000/svg';
  for (let b = 0; b < 7; b++) {
    const svg = document.createElementNS(ns, 'svg');
    const sq = 10, S = 4;
    svg.setAttribute('viewBox', `0 0 ${S * sq} ${S * sq}`);
    const bpx = Math.round(38 + rng() * 52);
    const rot = (rng() - 0.5) * 35;
    const op  = 0.07 + rng() * 0.09;
    const [l, t] = safePos();
    svg.style.cssText = `position:absolute;left:${l.toFixed(2)}%;top:${t.toFixed(2)}%;width:${bpx}px;height:${bpx}px;opacity:${op.toFixed(3)};transform:translate(-50%,-50%) rotate(${rot.toFixed(1)}deg);pointer-events:none;`;
    for (let r = 0; r < S; r++) {
      for (let c = 0; c < S; c++) {
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', c * sq);
        rect.setAttribute('y', r * sq);
        rect.setAttribute('width', sq);
        rect.setAttribute('height', sq);
        rect.setAttribute('fill', (r + c) % 2 === 0 ? '#1a4a6e' : '#a8d0e8');
        svg.appendChild(rect);
      }
    }
    deco.appendChild(svg);
  }
})();
