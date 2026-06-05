// ── Dots and Boxes Navigation ─────────────────────────────────────
const screenDotsAndBoxes          = document.getElementById('screen-dotsandboxes');
const screenDotsAndBoxesSettings  = document.getElementById('screen-dotsandboxes-settings');
const screenDabGame               = document.getElementById('screen-dab-game');
const btnDotsAndBoxes             = document.getElementById('btn-dotsandboxes');
const btnDotsAndBoxesBack         = document.getElementById('btn-dotsandboxes-back');
const btnDotsAndBoxesSettings     = document.getElementById('btn-dotsandboxes-settings');
const btnDotsAndBoxesSettingsBack = document.getElementById('btn-dotsandboxes-settings-back');
const btnPlayDotsAndBoxes         = document.getElementById('btn-play-dotsandboxes');

// Board width slider
const dabWidthSlider = document.getElementById('dab-width-slider');
const dabWidthValue  = document.getElementById('dab-width-value');
dabWidthSlider.addEventListener('input', function () {
  dabWidthValue.textContent = this.value;
});

// Board length slider
const dabLengthSlider = document.getElementById('dab-length-slider');
const dabLengthValue  = document.getElementById('dab-length-value');
dabLengthSlider.addEventListener('input', function () {
  dabLengthValue.textContent = this.value;
});

// Shape toggle
const dabWidthLabel = document.getElementById('dab-width-label');
const dabLengthRow  = document.getElementById('dab-length-row');

function applyShapeMode(val) {
  if (val === 'triangle') {
    dabLengthRow.style.display = 'none';
    dabWidthLabel.textContent  = 'Board Size';
  } else {
    dabLengthRow.style.display = '';
    dabWidthLabel.textContent  = 'Board Width';
  }
}

applyShapeMode('triangle');

wireToggleGroup('#dab-shape-toggle .mode-opt', function (btn) {
  applyShapeMode(btn.getAttribute('data-val'));
});

wireNav([
  { btn: btnDotsAndBoxes, screen: screenDotsAndBoxes, backBtn: btnDotsAndBoxesBack },
  { btn: btnDotsAndBoxesSettings, screen: screenDotsAndBoxesSettings, backBtn: btnDotsAndBoxesSettingsBack },
]);

// ── Dots and Boxes Game ───────────────────────────────────────────
(function () {
  const NS    = 'http://www.w3.org/2000/svg';
  const STEP  = 50;
  const MAR   = 30;
  const TRI_H = STEP * Math.sqrt(3) / 2;
  const P_COLORS = ['#cc2222', '#2563eb'];

  let dabEdges, dabCells, dabCurrentPlayer, dabScores, dabOver;

  const svgBoard   = document.getElementById('dab-board');
  const statusEl   = document.getElementById('dab-status');
  const scoreEl    = document.getElementById('dab-score');
  const gameOverEl = document.getElementById('dab-game-over');
  const overMsgEl  = document.getElementById('dab-over-msg');

  btnPlayDotsAndBoxes.addEventListener('click', function () {
    warpIn(screenDabGame, this);
    startGame();
  });

  document.getElementById('btn-dab-game-back').addEventListener('click', function () {
    warpOut(screenDabGame, btnPlayDotsAndBoxes);
  });

  document.getElementById('btn-dab-play-again').addEventListener('click', startGame);

  document.getElementById('btn-dab-main-menu').addEventListener('click', function () {
    warpOut(screenDabGame, btnDotsAndBoxes);
  });

  // ── Start / reset ─────────────────────────────────────────────
  function startGame() {
    const shape = document.querySelector('#dab-shape-toggle .mode-opt.selected').getAttribute('data-val');
    const w = parseInt(dabWidthSlider.value);
    const l = shape === 'rectangle' ? parseInt(dabLengthSlider.value) : w;

    dabCurrentPlayer = 0;
    dabScores        = [0, 0];
    dabOver          = false;
    dabEdges         = {};
    dabCells         = [];
    hideOverlay(gameOverEl);

    if (shape === 'rectangle') buildRect(w, l);
    else                       buildTri(w);

    updateStatus();
    updateScore();
  }

  // ── Coordinate helpers ────────────────────────────────────────
  function rectPt(r, c) {
    return { x: MAR + c * STEP, y: MAR + r * STEP };
  }

  function triPt(r, c, N) {
    return {
      x: MAR + (N - r) * STEP / 2 + c * STEP,
      y: MAR + r * TRI_H
    };
  }

  // ── Build rectangle board ─────────────────────────────────────
  function buildRect(cols, rows) {
    svgBoard.innerHTML = '';
    svgBoard.setAttribute('viewBox', `0 0 ${cols * STEP + MAR * 2} ${rows * STEP + MAR * 2}`);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p = rectPt(r, c);
        const el = mksvg('rect', { x: p.x, y: p.y, width: STEP, height: STEP,
                                    fill: 'transparent', class: 'dab-cell-fill' });
        svgBoard.appendChild(el);
        dabCells.push({ type: 'rect', r, c, el, owner: -1 });
      }
    }

    for (let r = 0; r <= rows; r++)
      for (let c = 0; c < cols; c++)
        addEdge('H' + r + ',' + c, rectPt(r, c), rectPt(r, c + 1));

    for (let r = 0; r < rows; r++)
      for (let c = 0; c <= cols; c++)
        addEdge('V' + r + ',' + c, rectPt(r, c), rectPt(r + 1, c));

    for (let r = 0; r <= rows; r++)
      for (let c = 0; c <= cols; c++)
        addDot(rectPt(r, c));
  }

  // ── Build triangle board ──────────────────────────────────────
  function buildTri(N) {
    svgBoard.innerHTML = '';
    svgBoard.setAttribute('viewBox', `0 0 ${N * STEP + MAR * 2} ${N * TRI_H + MAR * 2}`);

    const dp = (r, c) => triPt(r, c, N);

    // Upward triangles U(r,c): r=0..N-1, c=0..r
    for (let r = 0; r < N; r++) {
      for (let c = 0; c <= r; c++) {
        const el = mksvg('polygon', {
          points: fmtPts(dp(r, c), dp(r + 1, c), dp(r + 1, c + 1)),
          fill: 'transparent', class: 'dab-cell-fill'
        });
        svgBoard.appendChild(el);
        dabCells.push({ type: 'up', r, c, el, owner: -1 });
      }
    }

    // Downward triangles D(r,d): r=1..N-1, d=0..r-1
    // vertices: dot(r,d), dot(r,d+1), dot(r+1,d+1)
    for (let r = 1; r < N; r++) {
      for (let d = 0; d < r; d++) {
        const el = mksvg('polygon', {
          points: fmtPts(dp(r, d), dp(r, d + 1), dp(r + 1, d + 1)),
          fill: 'transparent', class: 'dab-cell-fill'
        });
        svgBoard.appendChild(el);
        dabCells.push({ type: 'down', r, d, el, owner: -1 });
      }
    }

    // H edges: dot(r,c)->dot(r,c+1), r=1..N, c=0..r-1
    for (let r = 1; r <= N; r++)
      for (let c = 0; c < r; c++)
        addEdge('H' + r + ',' + c, dp(r, c), dp(r, c + 1));

    // L edges: dot(r,c)->dot(r+1,c), r=0..N-1, c=0..r
    for (let r = 0; r < N; r++)
      for (let c = 0; c <= r; c++)
        addEdge('L' + r + ',' + c, dp(r, c), dp(r + 1, c));

    // R edges: dot(r,c)->dot(r+1,c+1), r=0..N-1, c=0..r
    for (let r = 0; r < N; r++)
      for (let c = 0; c <= r; c++)
        addEdge('R' + r + ',' + c, dp(r, c), dp(r + 1, c + 1));

    for (let r = 0; r <= N; r++)
      for (let c = 0; c <= r; c++)
        addDot(dp(r, c));
  }

  // ── SVG helpers ───────────────────────────────────────────────
  function mksvg(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }

  function fmtPts() {
    return Array.from(arguments).map(p => p.x + ',' + p.y).join(' ');
  }

  function addEdge(id, p0, p1) {
    const g    = mksvg('g',    { class: 'dab-edge-g', 'pointer-events': 'all' });
    const line = mksvg('line', { x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y, class: 'dab-edge' });
    const hit  = mksvg('line', { x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y, class: 'dab-edge-hit' });
    g.appendChild(line);
    g.appendChild(hit);
    g.addEventListener('click', (function (eid) { return function () { onEdgeClick(eid); }; })(id));
    svgBoard.appendChild(g);
    dabEdges[id] = { g: g, claimed: false };
  }

  function addDot(p) {
    svgBoard.appendChild(
      mksvg('circle', { cx: p.x, cy: p.y, r: 4, class: 'dab-dot', 'pointer-events': 'none' })
    );
  }

  // ── Game logic ────────────────────────────────────────────────
  function onEdgeClick(id) {
    if (dabOver) return;
    const edge = dabEdges[id];
    if (!edge || edge.claimed) return;

    edge.claimed = true;
    edge.g.classList.add('claimed-p' + (dabCurrentPlayer + 1));

    const scored = checkCells();
    dabScores[dabCurrentPlayer] += scored;
    updateScore();

    if (dabCells.every(function (c) { return c.owner !== -1; })) { endGame(); return; }
    if (scored === 0) dabCurrentPlayer = 1 - dabCurrentPlayer;
    updateStatus();
  }

  function checkCells() {
    var count = 0;
    for (var i = 0; i < dabCells.length; i++) {
      var cell = dabCells[i];
      if (cell.owner !== -1) continue;
      if (isCellComplete(cell)) {
        cell.owner = dabCurrentPlayer;
        cell.el.setAttribute('fill', P_COLORS[dabCurrentPlayer]);
        cell.el.setAttribute('fill-opacity', '0.28');
        count++;
      }
    }
    return count;
  }

  function isCellComplete(cell) {
    var e = dabEdges;
    if (cell.type === 'rect') {
      var r = cell.r, c = cell.c;
      return e['H' + r + ',' + c]   && e['H' + r + ',' + c].claimed &&
             e['H' + (r+1) + ',' + c] && e['H' + (r+1) + ',' + c].claimed &&
             e['V' + r + ',' + c]   && e['V' + r + ',' + c].claimed &&
             e['V' + r + ',' + (c+1)] && e['V' + r + ',' + (c+1)].claimed;
    }
    if (cell.type === 'up') {
      // edges: L(r,c), R(r,c), H(r+1,c)
      var r = cell.r, c = cell.c;
      return e['L' + r + ',' + c]     && e['L' + r + ',' + c].claimed &&
             e['R' + r + ',' + c]     && e['R' + r + ',' + c].claimed &&
             e['H' + (r+1) + ',' + c] && e['H' + (r+1) + ',' + c].claimed;
    }
    if (cell.type === 'down') {
      // edges: H(r,d), R(r,d), L(r,d+1)
      var r = cell.r, d = cell.d;
      return e['H' + r + ',' + d]     && e['H' + r + ',' + d].claimed &&
             e['R' + r + ',' + d]     && e['R' + r + ',' + d].claimed &&
             e['L' + r + ',' + (d+1)] && e['L' + r + ',' + (d+1)].claimed;
    }
    return false;
  }

  function updateStatus() {
    statusEl.textContent = 'Player ' + (dabCurrentPlayer + 1) + '\'s turn';
    statusEl.style.color = P_COLORS[dabCurrentPlayer];
  }

  function updateScore() {
    scoreEl.innerHTML =
      '<span style="color:' + P_COLORS[0] + '">P1: ' + dabScores[0] + '</span>' +
      ' &nbsp;|&nbsp; ' +
      '<span style="color:' + P_COLORS[1] + '">P2: ' + dabScores[1] + '</span>';
  }

  function endGame() {
    dabOver = true;
    var msg;
    if (dabScores[0] > dabScores[1])      msg = '🎉 Player 1 wins!';
    else if (dabScores[1] > dabScores[0]) msg = '🎉 Player 2 wins!';
    else                                  msg = "It's a draw!";
    overMsgEl.textContent = msg;
    showOverlay(gameOverEl);
  }
})();
