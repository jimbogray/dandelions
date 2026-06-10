// ── Menu decorations — symbols from the actual games ─────────────
(function () {
  const deco = document.getElementById('menu-deco');
  const NS   = 'http://www.w3.org/2000/svg';

  // Deterministic PRNG (seed 42)
  const rng = (() => {
    let s = 42;
    return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  })();

  // Returns [left%, top%] outside the centre content area
  function safePos() {
    for (let i = 0; i < 40; i++) {
      const l = rng() * 100, t = rng() * 100;
      if (l >= 26 && l <= 74 && t >= 18 && t <= 82) continue;
      return [l, t];
    }
    return [rng() < 0.5 ? rng() * 22 : 78 + rng() * 22, rng() * 100];
  }

  function pos(el, l, t, op, rot, extra) {
    el.style.cssText = `position:absolute;left:${l.toFixed(2)}%;top:${t.toFixed(2)}%;opacity:${op.toFixed(3)};transform:translate(-50%,-50%) rotate(${rot.toFixed(1)}deg);pointer-events:none;${extra||''}`;
  }

  // ── TTT symbols: ✕ and ○ ─────────────────────────────────────
  const tttSyms = ['✕', '○'];
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('span');
    el.className  = 'menu-deco-piece';
    el.textContent = tttSyms[i % 2];
    const size = 2.2 + rng() * 2.8;
    const rot  = (rng() - 0.5) * 40;
    const op   = 0.07 + rng() * 0.09;
    const [l, t] = safePos();
    el.style.cssText = `position:absolute;left:${l.toFixed(2)}%;top:${t.toFixed(2)}%;font-size:${size.toFixed(2)}rem;opacity:${op.toFixed(3)};transform:translate(-50%,-50%) rotate(${rot.toFixed(1)}deg);pointer-events:none;`;
    deco.appendChild(el);
  }

  // ── Othello discs ─────────────────────────────────────────────
  for (let i = 0; i < 8; i++) {
    const svg = document.createElementNS(NS, 'svg');
    const r   = Math.round(14 + rng() * 18);
    svg.setAttribute('viewBox', '0 0 40 40');
    const fill = rng() < 0.5 ? '#1a2a3e' : '#f0f4f8';
    const stroke = fill === '#1a2a3e' ? '#a8d0e8' : '#1a4a6e';
    const circ = document.createElementNS(NS, 'circle');
    circ.setAttribute('cx', 20); circ.setAttribute('cy', 20); circ.setAttribute('r', 18);
    circ.setAttribute('fill', fill); circ.setAttribute('stroke', stroke); circ.setAttribute('stroke-width', 2);
    svg.appendChild(circ);
    const op = 0.08 + rng() * 0.1;
    const rot = (rng() - 0.5) * 20;
    const [l, t] = safePos();
    svg.style.cssText = `position:absolute;left:${l.toFixed(2)}%;top:${t.toFixed(2)}%;width:${r*2}px;height:${r*2}px;opacity:${op.toFixed(3)};transform:translate(-50%,-50%) rotate(${rot.toFixed(1)}deg);pointer-events:none;`;
    deco.appendChild(svg);
  }

  // ── Dandelion seeds (✦) and flowers ──────────────────────────
  const dandSyms = ['✦', '✿', '❀', '🌼'];
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('span');
    el.className   = 'menu-deco-piece';
    el.textContent = dandSyms[i % dandSyms.length];
    const size = 1.6 + rng() * 2.4;
    const rot  = (rng() - 0.5) * 60;
    const op   = 0.07 + rng() * 0.09;
    const [l, t] = safePos();
    el.style.cssText = `position:absolute;left:${l.toFixed(2)}%;top:${t.toFixed(2)}%;font-size:${size.toFixed(2)}rem;opacity:${op.toFixed(3)};transform:translate(-50%,-50%) rotate(${rot.toFixed(1)}deg);pointer-events:none;`;
    deco.appendChild(el);
  }

  // ── Dots and Boxes mini-boards ────────────────────────────────
  for (let b = 0; b < 6; b++) {
    const COLS = 3, ROWS = 3, STEP = 14, MAR = 6;
    const W = COLS * STEP + MAR * 2, H = ROWS * STEP + MAR * 2;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const px  = Math.round(50 + rng() * 36);
    const op  = 0.07 + rng() * 0.09;
    const rot = (rng() - 0.5) * 30;
    const [l, t] = safePos();
    svg.style.cssText = `position:absolute;left:${l.toFixed(2)}%;top:${t.toFixed(2)}%;width:${px}px;height:${px}px;opacity:${op.toFixed(3)};transform:translate(-50%,-50%) rotate(${rot.toFixed(1)}deg);pointer-events:none;`;

    // H and V edges (faint lines)
    for (let r = 0; r <= ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', MAR + c * STEP); line.setAttribute('y1', MAR + r * STEP);
        line.setAttribute('x2', MAR + (c+1) * STEP); line.setAttribute('y2', MAR + r * STEP);
        line.setAttribute('stroke', '#1a4a6e'); line.setAttribute('stroke-width', 1.5); line.setAttribute('stroke-linecap', 'round');
        svg.appendChild(line);
      }
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c <= COLS; c++) {
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', MAR + c * STEP); line.setAttribute('y1', MAR + r * STEP);
        line.setAttribute('x2', MAR + c * STEP); line.setAttribute('y2', MAR + (r+1) * STEP);
        line.setAttribute('stroke', '#1a4a6e'); line.setAttribute('stroke-width', 1.5); line.setAttribute('stroke-linecap', 'round');
        svg.appendChild(line);
      }
    // Dots
    for (let r = 0; r <= ROWS; r++)
      for (let c = 0; c <= COLS; c++) {
        const circ = document.createElementNS(NS, 'circle');
        circ.setAttribute('cx', MAR + c * STEP); circ.setAttribute('cy', MAR + r * STEP); circ.setAttribute('r', 2.5);
        circ.setAttribute('fill', '#1a4a6e');
        svg.appendChild(circ);
      }
    deco.appendChild(svg);
  }

  // ── Tax Collector numbers ─────────────────────────────────────
  const tcNums = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('span');
    el.className   = 'menu-deco-piece';
    el.textContent = tcNums[i % tcNums.length];
    const size = 1.8 + rng() * 2.6;
    const rot  = (rng() - 0.5) * 35;
    const op   = 0.07 + rng() * 0.09;
    const [l, t] = safePos();
    el.style.cssText = `position:absolute;left:${l.toFixed(2)}%;top:${t.toFixed(2)}%;font-size:${size.toFixed(2)}rem;opacity:${op.toFixed(3)};transform:translate(-50%,-50%) rotate(${rot.toFixed(1)}deg);pointer-events:none;font-family:'Lexend',sans-serif;font-weight:700;`;
    deco.appendChild(el);
  }
})();
