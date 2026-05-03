// ── Dandelions Navigation & Settings ─────────────────────────────
const screenDandelions         = document.getElementById('screen-dandelions');
const screenDandelionsSettings = document.getElementById('screen-dandelions-settings');
const btnDandelions            = document.getElementById('btn-dandelions');
const btnDandeBack             = document.getElementById('btn-dandelions-back');
const btnDandelionsSettings    = document.getElementById('btn-dandelions-settings');
const btnDandSettingsBack      = document.getElementById('btn-dand-settings-back');
const btnPlayDandelions        = document.getElementById('btn-play-dandelions');
const dandTimeSlider           = document.getElementById('dand-time-slider');
const dandTimeValue            = document.getElementById('dand-time-value');

// Style pickers
document.querySelectorAll('#dand-style-picker .style-opt, #seed-style-picker .style-opt').forEach(btn => {
  btn.addEventListener('click', function () {
    this.closest('.style-picker').querySelectorAll('.style-opt').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
  });
});

// Mode toggle
const dandRoleRow = document.getElementById('dand-role-row');
document.querySelectorAll('#dand-mode-toggle .mode-opt').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#dand-mode-toggle .mode-opt').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    dandRoleRow.style.display = this.getAttribute('data-val') === 'single' ? '' : 'none';
  });
});

// Role toggle (single player)
document.querySelectorAll('#dand-role-toggle .mode-opt').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#dand-role-toggle .mode-opt').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
  });
});

dandTimeSlider.addEventListener('input', function () {
  dandTimeValue.textContent = timeLevels[this.value];
});

btnDandelions.addEventListener('click', function () { warpIn(screenDandelions, this); });
btnDandeBack.addEventListener('click', function () { warpOut(screenDandelions, btnDandelions); });
btnDandelionsSettings.addEventListener('click', function () { warpIn(screenDandelionsSettings, this); });
btnDandSettingsBack.addEventListener('click', function () { warpOut(screenDandelionsSettings, btnDandelionsSettings); });
if (btnPlayDandelions) btnPlayDandelions.addEventListener('click', function () { location.href = '/dandelions'; });

// ── Dandelion seed decorations ────────────────────────────────────
(function () {
  const container = document.getElementById('dandelions-deco');
  const W = window.innerWidth, H = window.innerHeight;
  const safeX1 = W * 0.25, safeX2 = W * 0.75;
  const safeY1 = H * 0.20, safeY2 = H * 0.80;
  const seeds = ['\ud83c\udf3c', '\u273f', '\u2740', '\ud83c\udf38', '\u273e', '\u2698'];
  const count = 28;
  let placed = 0, attempts = 0;
  while (placed < count && attempts < 500) {
    attempts++;
    const size = 32 + Math.random() * 48;
    const x = Math.random() * (W - size);
    const y = Math.random() * (H - size);
    if (x + size > safeX1 && x < safeX2 && y + size > safeY1 && y < safeY2) continue;
    const el = document.createElement('span');
    el.className       = 'dand-deco-seed';
    el.textContent     = seeds[Math.floor(Math.random() * seeds.length)];
    el.style.left      = x + 'px';
    el.style.top       = y + 'px';
    el.style.fontSize  = size + 'px';
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(el);
    placed++;
  }
})();

// ── Dandelions Game ───────────────────────────────────────────────
(function () {
  const screenDandGame   = document.getElementById('screen-dand-game');
  const btnPlayDandGame  = document.getElementById('btn-play-dand-game');
  const btnDandGameBack  = document.getElementById('btn-dand-game-back');
  const btnDandPlayAgain = document.getElementById('btn-dand-play-again');
  const btnDandMainMenu  = document.getElementById('btn-dand-main-menu');
  const dandBoard        = document.getElementById('dand-board');
  const dandCompassSVG   = document.getElementById('dand-compass');
  const dandStatus       = document.getElementById('dand-status');
  const dandTimerEl      = document.getElementById('dand-game-timer');
  const dandTimerText    = document.getElementById('dand-timer-text');
  const dandGameOver     = document.getElementById('dand-game-over');
  const dandOverMsg      = document.getElementById('dand-over-msg');
  const gustCanvas       = document.getElementById('dand-gust-canvas');
  const gctx             = gustCanvas.getContext('2d');

  const MAX_ROUNDS = 7;
  const ns = 'http://www.w3.org/2000/svg';
  const DIRS = [
    { label: 'N',  angle: -90, dr: -1, dc:  0 },
    { label: 'NE', angle: -45, dr: -1, dc:  1 },
    { label: 'E',  angle:   0, dr:  0, dc:  1 },
    { label: 'SE', angle:  45, dr:  1, dc:  1 },
    { label: 'S',  angle:  90, dr:  1, dc:  0 },
    { label: 'SW', angle: 135, dr:  1, dc: -1 },
    { label: 'W',  angle: 180, dr:  0, dc: -1 },
    { label: 'NW', angle: 225, dr: -1, dc: -1 },
  ];

  let dRound, dPhase, dOver, dTimerInterval, dTimerRemaining, dTimerDuration;
  let arrowGroups = [];
  let cells = [];
  let botTimeout = null;

  // ── Build board ───────────────────────────────────────────────
  function buildBoard() {
    dandBoard.innerHTML = '';
    cells = [];
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'dand-cell';
      cell.addEventListener('click', () => onDandCell(i));
      dandBoard.appendChild(cell);
      cells.push(cell);
    }
  }

  // ── Build compass ─────────────────────────────────────────────
  function buildCompass() {
    [...dandCompassSVG.querySelectorAll('.dand-arrow')].forEach(g => g.remove());
    arrowGroups = [];

    const cx = 100, cy = 100;
    const spokeStart = 12, spokeEnd = 68, headLen = 13, headHalf = 6;
    const labelR = 97;

    DIRS.forEach(dir => {
      const rad = dir.angle * Math.PI / 180;
      const x1 = cx + spokeStart * Math.cos(rad);
      const y1 = cy + spokeStart * Math.sin(rad);
      const x2 = cx + spokeEnd   * Math.cos(rad);
      const y2 = cy + spokeEnd   * Math.sin(rad);
      const tx = cx + (spokeEnd + headLen) * Math.cos(rad);
      const ty = cy + (spokeEnd + headLen) * Math.sin(rad);
      const perp = rad + Math.PI / 2;
      const bx1 = x2 + headHalf * Math.cos(perp), by1 = y2 + headHalf * Math.sin(perp);
      const bx2 = x2 - headHalf * Math.cos(perp), by2 = y2 - headHalf * Math.sin(perp);
      const lx = cx + labelR * Math.cos(rad);
      const ly = cy + labelR * Math.sin(rad);

      const g = document.createElementNS(ns, 'g');
      g.classList.add('dand-arrow');
      g.setAttribute('data-dir', dir.label);

      const line = document.createElementNS(ns, 'line');
      line.classList.add('dspoke');
      line.setAttribute('x1', x1); line.setAttribute('y1', y1);
      line.setAttribute('x2', x2); line.setAttribute('y2', y2);
      g.appendChild(line);

      const poly = document.createElementNS(ns, 'polygon');
      poly.classList.add('dhead');
      poly.setAttribute('points', `${tx},${ty} ${bx1},${by1} ${bx2},${by2}`);
      g.appendChild(poly);

      const hit = document.createElementNS(ns, 'circle');
      hit.setAttribute('cx', tx); hit.setAttribute('cy', ty);
      hit.setAttribute('r', 14);
      hit.setAttribute('fill', 'transparent');
      hit.style.cursor = 'pointer';
      g.appendChild(hit);

      const hitSpoke = document.createElementNS(ns, 'line');
      hitSpoke.setAttribute('x1', x1); hitSpoke.setAttribute('y1', y1);
      hitSpoke.setAttribute('x2', x2); hitSpoke.setAttribute('y2', y2);
      hitSpoke.setAttribute('stroke', 'transparent');
      hitSpoke.setAttribute('stroke-width', '14');
      g.appendChild(hitSpoke);

      const text = document.createElementNS(ns, 'text');
      text.classList.add('dlabel');
      text.setAttribute('x', lx); text.setAttribute('y', ly);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('pointer-events', 'none');
      text.textContent = dir.label;
      g.appendChild(text);

      g.addEventListener('click', () => onDandCompass(dir.label, g));
      dandCompassSVG.appendChild(g);
      arrowGroups.push(g);
    });
  }

  // ── Cell click ────────────────────────────────────────────────
  function onDandCell(idx) {
    if (dOver || dPhase !== 'dandelion') return;
    const cell = cells[idx];
    if (cell.classList.contains('occupied')) return;
    stopDandTimer();
    placeDandelion(idx);
    advanceDandTurn();
  }

  // ── Compass click ─────────────────────────────────────────────
  function onDandCompass(dirLabel, g) {
    if (dOver || dPhase !== 'wind') return;
    if (g.classList.contains('dused')) return;
    stopDandTimer();
    triggerWind(dirLabel, g);
  }

  function triggerWind(dirLabel, g) {
    dandBoard.style.pointerEvents = 'none';
    dandCompassSVG.style.pointerEvents = 'none';

    const hasDandelion = cells.map(c => c.classList.contains('has-dandelion'));
    const dir = DIRS.find(d => d.label === dirLabel);

    playGust(dir.angle, function onGustDone() {
      spreadDandSeeds(dirLabel, hasDandelion);
      g.classList.add('dused');
      dandBoard.style.pointerEvents = '';
      dandCompassSVG.style.pointerEvents = '';
      advanceDandTurn();
    });
  }

  // ── Gust animation ────────────────────────────────────────────
  function playGust(angleDeg, onDone) {
    const W = gustCanvas.width  = window.innerWidth;
    const H = gustCanvas.height = window.innerHeight;
    const rad = angleDeg * Math.PI / 180;
    const vx = Math.cos(rad), vy = Math.sin(rad);
    const perpX = -vy, perpY = vx;

    const STREAKS = 36, CLOUDS = 6, DURATION = 1400;
    const start = performance.now();

    const streaks = Array.from({ length: STREAKS }, () => {
      const spread = (Math.random() - 0.5) * Math.max(W, H) * 1.3;
      const len = 60 + Math.random() * 100;
      const speed = 0.5 + Math.random() * 0.5;
      const delay = Math.random() * 0.35;
      const cx0 = W / 2 + perpX * spread - vx * (len + Math.random() * W * 0.6);
      const cy0 = H / 2 + perpY * spread - vy * (len + Math.random() * H * 0.6);
      return { cx0, cy0, len, speed, delay, alpha: 0.6 + Math.random() * 0.35, lw: 3 + Math.random() * 2 };
    });

    const clouds = Array.from({ length: CLOUDS }, () => {
      const spread = (Math.random() - 0.5) * Math.max(W, H) * 0.9;
      const speed = 0.35 + Math.random() * 0.3;
      const delay = Math.random() * 0.3;
      const r = 28 + Math.random() * 28;
      const cx0 = W / 2 + perpX * spread - vx * (r * 2 + Math.random() * W * 0.4);
      const cy0 = H / 2 + perpY * spread - vy * (r * 2 + Math.random() * H * 0.4);
      return { cx0, cy0, r, speed, delay, alpha: 0.18 + Math.random() * 0.14 };
    });

    function drawCloud(cx, cy, r, alpha) {
      gctx.save();
      gctx.globalAlpha = alpha;
      gctx.fillStyle = '#ffffff';
      gctx.beginPath();
      gctx.arc(cx, cy, r, 0, Math.PI * 2);
      gctx.arc(cx + r * 0.75, cy + r * 0.15, r * 0.72, 0, Math.PI * 2);
      gctx.arc(cx - r * 0.65, cy + r * 0.2,  r * 0.65, 0, Math.PI * 2);
      gctx.arc(cx + r * 0.2,  cy - r * 0.55, r * 0.6,  0, Math.PI * 2);
      gctx.fill();
      gctx.restore();
    }

    function draw(now) {
      const t = Math.min((now - start) / DURATION, 1);
      gctx.clearRect(0, 0, W, H);

      clouds.forEach(c => {
        const st = Math.max(0, (t - c.delay) / (1 - c.delay));
        if (st <= 0) return;
        const travel = st * c.speed * Math.max(W, H) * 1.4;
        const fade = st < 0.12 ? st / 0.12 : st > 0.8 ? (1 - st) / 0.2 : 1;
        drawCloud(c.cx0 + vx * travel, c.cy0 + vy * travel, c.r, c.alpha * fade);
      });

      streaks.forEach(s => {
        const st = Math.max(0, (t - s.delay) / (1 - s.delay));
        if (st <= 0) return;
        const travel = st * s.speed * Math.max(W, H) * 1.5;
        const tailX = s.cx0 + vx * travel, tailY = s.cy0 + vy * travel;
        const fade = st < 0.1 ? st / 0.1 : st > 0.85 ? (1 - st) / 0.15 : 1;
        gctx.save();
        gctx.globalAlpha = s.alpha * fade;
        gctx.strokeStyle = '#ffffff';
        gctx.lineWidth = s.lw;
        gctx.lineCap = 'round';
        gctx.beginPath();
        gctx.moveTo(tailX, tailY);
        gctx.lineTo(tailX + vx * s.len, tailY + vy * s.len);
        gctx.stroke();
        gctx.restore();
      });

      if (t < 1) { requestAnimationFrame(draw); }
      else { gctx.clearRect(0, 0, W, H); onDone(); }
    }
    requestAnimationFrame(draw);
  }

  // ── Place dandelion ───────────────────────────────────────────
  function placeDandelion(idx) {
    const cell = cells[idx];
    cell.classList.add('has-dandelion', 'occupied');
    cell.appendChild(makeDandIcon());
  }

  // ── Spread seeds ──────────────────────────────────────────────
  function spreadDandSeeds(dirLabel, hasDandelion) {
    const dir = DIRS.find(d => d.label === dirLabel);
    hasDandelion.forEach((occupied, idx) => {
      if (!occupied) return;
      let r = Math.floor(idx / 5) + dir.dr;
      let c = (idx % 5) + dir.dc;
      while (r >= 0 && r <= 4 && c >= 0 && c <= 4) {
        const cell = cells[r * 5 + c];
        if (!cell.classList.contains('occupied')) {
          cell.classList.add('has-seed', 'occupied');
          cell.appendChild(makeSeedIcon());
        }
        r += dir.dr; c += dir.dc;
      }
    });
  }

  // ── Advance turn ──────────────────────────────────────────────
  function advanceDandTurn() {
    if (dPhase === 'dandelion') {
      const allFull = cells.every(c => c.classList.contains('occupied'));
      if (allFull) { endDandGame(); return; }
      dPhase = 'wind';
    } else {
      const allFull = cells.every(c => c.classList.contains('occupied'));
      dRound++;
      if (allFull || dRound > MAX_ROUNDS) { endDandGame(); return; }
      dPhase = 'dandelion';
    }
    updateDandStatus();
    if (activeDandMode === 'single' && isBotTurn()) {
      scheduleBotMove();
    } else {
      startDandTimer();
    }
  }

  // ── End game ──────────────────────────────────────────────────
  function endDandGame() {
    dOver = true;
    stopDandTimer();
    const empty = cells.filter(c => !c.classList.contains('occupied')).length;
    let msg;
    if (activeDandMode === 'coop') {
      msg = empty === 0 ? '\ud83c\udf3c Your team won!' : '\ud83d\udca8 Your team lost!';
    } else if (activeDandMode === 'single') {
      const playerWon = (activeSPRole === 'dandelion' && empty === 0) ||
                        (activeSPRole === 'wind'      && empty > 0);
      msg = playerWon ? '\ud83c\udf89 You Win!' : '\ud83e\udd16 Bot Wins!';
    } else {
      msg = empty === 0 ? '\ud83c\udf3c Dandelion Player Wins!' : '\ud83d\udca8 Wind Player Wins!';
    }
    dandOverMsg.textContent = msg;
    dandGameOver.classList.add('visible');
    dandStatus.textContent = 'Game Over';
  }

  // ── Status ────────────────────────────────────────────────────
  function updateDandStatus() {
    if (activeDandMode === 'single' && isBotTurn()) {
      const icon = dPhase === 'dandelion' ? '\ud83c\udf3c' : '\ud83d\udca8';
      dandStatus.textContent = `Round ${dRound} of ${MAX_ROUNDS} \u2014 ${icon} Bot is thinking\u2026`;
      dandBoard.style.opacity = '0.4';
      dandBoard.style.pointerEvents = 'none';
      dandCompassSVG.style.opacity = '0.4';
      dandCompassSVG.style.pointerEvents = 'none';
      return;
    }
    if (dPhase === 'dandelion') {
      const who = activeDandMode === 'single' ? 'Your turn' : 'Dandelion Player';
      dandStatus.textContent = `Round ${dRound} of ${MAX_ROUNDS} \u2014 \ud83c\udf3c ${who}: place a dandelion`;
      dandBoard.style.opacity = '1';
      dandBoard.style.pointerEvents = '';
      dandCompassSVG.style.opacity = '0.4';
      dandCompassSVG.style.pointerEvents = 'none';
    } else {
      const who = activeDandMode === 'single' ? 'Your turn' : 'Wind Player';
      dandStatus.textContent = `Round ${dRound} of ${MAX_ROUNDS} \u2014 \ud83d\udca8 ${who}: choose a direction`;
      dandBoard.style.opacity = '0.4';
      dandBoard.style.pointerEvents = 'none';
      dandCompassSVG.style.opacity = '1';
      dandCompassSVG.style.pointerEvents = '';
    }
  }

  // ── Timer ─────────────────────────────────────────────────────
  function stopDandTimer() {
    clearInterval(dTimerInterval);
    dTimerInterval = null;
    if (botTimeout) { clearTimeout(botTimeout); botTimeout = null; }
  }

  function startDandTimer() {
    stopDandTimer();
    if (dTimerDuration === 0) return;
    dTimerRemaining = dTimerDuration;
    dandTimerText.textContent = dTimerRemaining + 's';
    dandTimerEl.classList.remove('hidden', 'urgent', 'ringing');
    dTimerInterval = setInterval(() => {
      dTimerRemaining--;
      dandTimerText.textContent = dTimerRemaining + 's';
      if (dTimerRemaining <= 5) dandTimerEl.classList.add('urgent');
      if (dTimerRemaining <= 0) {
        stopDandTimer();
        dandTimerEl.classList.add('ringing');
        takeRandomDandMove();
      }
    }, 1000);
  }

  function takeRandomDandMove() {
    if (dOver) return;
    if (dPhase === 'dandelion') {
      const empty = cells.map((c, i) => i).filter(i => !cells[i].classList.contains('occupied'));
      if (empty.length === 0) return;
      const idx = empty[Math.floor(Math.random() * empty.length)];
      placeDandelion(idx);
      advanceDandTurn();
    } else {
      const avail = arrowGroups.filter(g => !g.classList.contains('dused'));
      if (avail.length === 0) return;
      const g = avail[Math.floor(Math.random() * avail.length)];
      triggerWind(g.getAttribute('data-dir'), g);
    }
  }

  // ── Bot logic ─────────────────────────────────────────────────
  function isBotTurn() {
    if (activeDandMode !== 'single') return false;
    return (activeSPRole === 'dandelion' && dPhase === 'wind') ||
           (activeSPRole === 'wind'      && dPhase === 'dandelion');
  }

  function scheduleBotMove() {
    if (botTimeout) clearTimeout(botTimeout);
    const minMs = dTimerDuration > 0 ? dTimerDuration * 0.10 * 1000 : 1500;
    const maxMs = dTimerDuration > 0 ? dTimerDuration * 0.80 * 1000 : 5000;
    const delay = minMs + Math.random() * (maxMs - minMs);
    botTimeout = setTimeout(function () {
      botTimeout = null;
      if (!dOver) takeRandomDandMove();
    }, delay);
  }

  // ── Icon makers ───────────────────────────────────────────────
  let activeDandStyle = 'classic';
  let activeSeedStyle = 'wisp';
  let activeDandMode  = 'versus';
  let activeSPRole    = 'dandelion';

  function makeEmojiIcon(ch) {
    const span = document.createElement('span');
    span.classList.add('dand-icon');
    span.style.cssText = 'display:flex;align-items:center;justify-content:center;width:72%;height:72%;font-size:clamp(1.4rem,4vmin,2.4rem);line-height:1;';
    span.textContent = ch;
    return span;
  }

  function makeDandIcon() {
    if (activeDandStyle === 'full')    return makeEmojiIcon('\ud83c\udf3b');
    if (activeDandStyle === 'minimal') return makeEmojiIcon('\u273f');
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 72 72');
    svg.classList.add('dand-icon');
    const dcx = 36, dcy = 36, spokeCount = 12, innerR = 6, spokeLen = 22, bulbR = 4;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (2 * Math.PI / spokeCount) * i - Math.PI / 2;
      const x1 = dcx + innerR * Math.cos(angle), y1 = dcy + innerR * Math.sin(angle);
      const x2 = dcx + (innerR + spokeLen) * Math.cos(angle), y2 = dcy + (innerR + spokeLen) * Math.sin(angle);
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', x1); line.setAttribute('y1', y1);
      line.setAttribute('x2', x2); line.setAttribute('y2', y2);
      line.setAttribute('stroke', '#9b8b2b'); line.setAttribute('stroke-width', '1.4');
      svg.appendChild(line);
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', x2); circle.setAttribute('cy', y2); circle.setAttribute('r', bulbR);
      circle.setAttribute('fill', '#f0e04a'); circle.setAttribute('stroke', '#c8a820'); circle.setAttribute('stroke-width', '1');
      svg.appendChild(circle);
    }
    const centre = document.createElementNS(svgNS, 'circle');
    centre.setAttribute('cx', dcx); centre.setAttribute('cy', dcy); centre.setAttribute('r', innerR);
    centre.setAttribute('fill', '#f0e04a'); centre.setAttribute('stroke', '#c8a820'); centre.setAttribute('stroke-width', '1.5');
    svg.appendChild(centre);
    return svg;
  }

  function makeSeedIcon() {
    if (activeSeedStyle === 'wisp') return makeEmojiIcon('\u2736');
    if (activeSeedStyle === 'star') return makeEmojiIcon('\u2738');
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 72 72');
    svg.classList.add('dand-icon');
    const stem = document.createElementNS(svgNS, 'line');
    stem.setAttribute('x1', 36); stem.setAttribute('y1', 64); stem.setAttribute('x2', 36); stem.setAttribute('y2', 46);
    stem.setAttribute('stroke', '#9b8b2b'); stem.setAttribute('stroke-width', '1.5');
    svg.appendChild(stem);
    const achene = document.createElementNS(svgNS, 'ellipse');
    achene.setAttribute('cx', 36); achene.setAttribute('cy', 43); achene.setAttribute('rx', 3); achene.setAttribute('ry', 4.5);
    achene.setAttribute('fill', '#b8a020');
    svg.appendChild(achene);
    const filamentCount = 9, spreadDeg = 70, filamentLen = 19;
    const fb = { x: 36, y: 39 };
    for (let i = 0; i < filamentCount; i++) {
      const t = filamentCount === 1 ? 0 : (i / (filamentCount - 1)) * 2 - 1;
      const angleDeg = -90 + t * spreadDeg;
      const rad = angleDeg * Math.PI / 180;
      const fx = fb.x + filamentLen * Math.cos(rad), fy = fb.y + filamentLen * Math.sin(rad);
      const fil = document.createElementNS(svgNS, 'line');
      fil.setAttribute('x1', fb.x); fil.setAttribute('y1', fb.y); fil.setAttribute('x2', fx); fil.setAttribute('y2', fy);
      fil.setAttribute('stroke', '#aaaaaa'); fil.setAttribute('stroke-width', '1');
      svg.appendChild(fil);
      const tip = document.createElementNS(svgNS, 'circle');
      tip.setAttribute('cx', fx); tip.setAttribute('cy', fy); tip.setAttribute('r', 2.5);
      tip.setAttribute('fill', '#ffffff'); tip.setAttribute('stroke', '#999999'); tip.setAttribute('stroke-width', '0.8');
      svg.appendChild(tip);
    }
    return svg;
  }

  // ── Start / reset game ────────────────────────────────────────
  function startDandGame() {
    dRound = 1; dPhase = 'dandelion'; dOver = false;
    const dandStyleSel = document.querySelector('#dand-style-picker .style-opt.selected');
    const seedStyleSel = document.querySelector('#seed-style-picker .style-opt.selected');
    const modeSel      = document.querySelector('#dand-mode-toggle .mode-opt.selected');
    activeDandStyle = dandStyleSel ? dandStyleSel.getAttribute('data-val') : 'classic';
    activeSeedStyle = seedStyleSel ? seedStyleSel.getAttribute('data-val') : 'wisp';
    activeDandMode  = modeSel      ? modeSel.getAttribute('data-val')      : 'versus';
    const roleSel   = document.querySelector('#dand-role-toggle .mode-opt.selected');
    activeSPRole    = roleSel      ? roleSel.getAttribute('data-val')      : 'dandelion';
    stopDandTimer();
    const durMap = [0, 10, 15, 20, 30, 45, 60, 90];
    dTimerDuration = durMap[parseInt(dandTimeSlider.value)] || 0;
    if (dTimerDuration === 0) dandTimerEl.classList.add('hidden');
    else dandTimerEl.classList.remove('hidden');
    buildBoard();
    buildCompass();
    dandGameOver.classList.remove('visible');
    gctx.clearRect(0, 0, gustCanvas.width, gustCanvas.height);
    updateDandStatus();
    if (activeDandMode === 'single' && isBotTurn()) {
      scheduleBotMove();
    } else {
      startDandTimer();
    }
  }

  // ── Wiring ────────────────────────────────────────────────────
  btnPlayDandGame.addEventListener('click', function () {
    warpIn(screenDandGame, this);
    startDandGame();
  });

  btnDandGameBack.addEventListener('click', function () {
    stopDandTimer();
    warpOut(screenDandGame, btnPlayDandGame);
  });

  btnDandPlayAgain.addEventListener('click', startDandGame);

  btnDandMainMenu.addEventListener('click', function () {
    stopDandTimer();
    warpOut(screenDandGame, btnPlayDandGame);
  });

  // ── Rules toggle ──────────────────────────────────────────────
  const rulesToggle = document.getElementById('dand-rules-toggle');
  const rulesPanel  = document.getElementById('dand-rules-panel');
  rulesToggle.addEventListener('click', function () {
    const open = rulesPanel.classList.toggle('open');
    this.setAttribute('aria-expanded', open);
    this.textContent = open ? '\u2715 Rules' : '? Rules';
  });
})();
