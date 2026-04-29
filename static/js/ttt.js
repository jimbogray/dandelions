// ── TTT Navigation ────────────────────────────────────────────────
const screenTTT      = document.getElementById('screen-ttt');
const screenTTTSet   = document.getElementById('screen-ttt-settings');
const btnTTT         = document.getElementById('btn-ttt');
const btnBack        = document.getElementById('btn-back');
const btnTTTSettings = document.getElementById('btn-ttt-settings');
const btnSettingsBack = document.getElementById('btn-settings-back');

// ── TTT Settings controls ─────────────────────────────────────────
const timeSlider  = document.getElementById('time-slider');
const timeValue   = document.getElementById('time-value');
const xHue        = document.getElementById('x-hue');
const oHue        = document.getElementById('o-hue');
const xPreview    = document.getElementById('x-preview');
const oPreview    = document.getElementById('o-preview');
const firstToggle = document.getElementById('first-player-toggle');

function updateXColor() { xPreview.style.background = `hsl(${xHue.value}, 80%, 55%)`; }
function updateOColor() { oPreview.style.background = `hsl(${oHue.value}, 80%, 55%)`; }

updateXColor();
updateOColor();
timeValue.textContent = timeLevels[0];

xHue.addEventListener('input', updateXColor);
oHue.addEventListener('input', updateOColor);
timeSlider.addEventListener('input', function () {
  timeValue.textContent = timeLevels[this.value];
});

let p1IsX = true;
firstToggle.addEventListener('click', function () {
  p1IsX = !p1IsX;
  this.textContent = p1IsX ? 'Player 1 is \u2715' : 'Player 1 is \u25cb';
});

// ── Screen navigation ─────────────────────────────────────────────
btnTTT.addEventListener('click', function () { warpIn(screenTTT, this); });
btnBack.addEventListener('click', function () { warpOut(screenTTT, btnTTT); });
btnTTTSettings.addEventListener('click', function () { warpIn(screenTTTSet, this); });
btnSettingsBack.addEventListener('click', function () { warpOut(screenTTTSet, btnTTTSettings); });

// ── Decorative scattered TTT boards ──────────────────────────────
(function () {
  const container = document.getElementById('ttt-deco');
  const W = window.innerWidth, H = window.innerHeight;
  const safeX1 = W * 0.25, safeX2 = W * 0.75;
  const safeY1 = H * 0.20, safeY2 = H * 0.80;

  function overlaps(cx, cy, size) {
    return cx + size > safeX1 && cx < safeX2 &&
           cy + size > safeY1 && cy < safeY2;
  }

  const count = 18;
  const sizes = [44, 52, 60, 68, 80, 92, 106];
  let attempts = 0, placed = 0;

  while (placed < count && attempts < 400) {
    attempts++;
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const x = Math.random() * (W - size);
    const y = Math.random() * (H - size);
    if (overlaps(x, y, size)) continue;

    const angle = Math.random() * 360;
    const board = document.createElement('div');
    board.className = 'deco-board';
    board.style.width     = size + 'px';
    board.style.height    = size + 'px';
    board.style.left      = x + 'px';
    board.style.top       = y + 'px';
    board.style.transform = `rotate(${angle}deg)`;

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'deco-cell';
      board.appendChild(cell);
    }
    container.appendChild(board);
    placed++;
  }
})();

// ── TTT Game Logic ────────────────────────────────────────────────
(function () {
  const screenGame  = document.getElementById('screen-ttt-game');
  const btnPlay     = document.getElementById('btn-play-ttt');
  const btnAgain    = document.getElementById('btn-play-again');
  const btnMenuFrom = document.getElementById('btn-to-ttt-menu');
  const btnGameBack = document.getElementById('btn-game-back');
  const cells       = document.querySelectorAll('.ttt-cell');
  const statusEl    = document.getElementById('game-status');
  const timerEl     = document.getElementById('game-timer');
  const timerDisp   = document.getElementById('timer-display');
  const overlay     = document.getElementById('game-over-overlay');
  const overlayMsg  = document.getElementById('game-over-msg');

  const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let board, curMark, active, countdown, cInt;

  function sym(m)   { return m === 'X' ? '\u2715' : '\u25cb'; }
  function clr(m)   { return `hsl(${m === 'X' ? xHue.value : oHue.value}, 80%, 48%)`; }
  function p1mark() { return p1IsX ? 'X' : 'O'; }
  function pnum(m)  { return m === p1mark() ? 1 : 2; }

  function startGame() {
    board   = Array(9).fill(null);
    active  = true;
    curMark = p1mark();
    cells.forEach(c => {
      c.textContent = '';
      c.style.color = '';
      c.classList.remove('taken', 'win-cell', 'x-mark', 'o-mark');
    });
    overlay.classList.remove('visible');
    setStatus();
    resetTimer();
  }

  function setStatus() {
    statusEl.textContent = `Player ${pnum(curMark)} (${sym(curMark)})'s turn`;
    statusEl.style.color  = clr(curMark);
  }

  function resetTimer() {
    clearInterval(cInt);
    timerEl.classList.remove('urgent', 'ringing');
    timerEl.style.color       = '';
    timerEl.style.borderColor = '';

    const lvl = parseInt(timeSlider.value);
    if (lvl === 0) { timerEl.classList.add('hidden'); return; }

    timerEl.classList.remove('hidden');
    countdown = parseInt(timeLevels[lvl]);
    timerDisp.textContent = countdown;

    cInt = setInterval(() => {
      countdown--;
      timerDisp.textContent = countdown;
      if (countdown <= 5) timerEl.classList.add('urgent');
      if (countdown <= 0) { clearInterval(cInt); onTimeout(); }
    }, 1000);
  }

  function onTimeout() {
    if (!active) return;
    active = false;

    timerEl.classList.remove('ringing');
    timerEl.getBoundingClientRect();
    timerEl.classList.add('ringing');

    const forfeited = curMark;
    statusEl.textContent = `Player ${pnum(forfeited)} (${sym(forfeited)}) forfeited!`;
    statusEl.style.color = '#c0392b';

    setTimeout(() => {
      curMark = forfeited === 'X' ? 'O' : 'X';
      active  = true;
      setStatus();
      resetTimer();
    }, 1500);
  }

  function checkWin() {
    for (const [a, b, c] of WINS)
      if (board[a] && board[a] === board[b] && board[a] === board[c])
        return [a, b, c];
    return null;
  }

  function onCell(i) {
    if (!active || board[i]) return;
    board[i] = curMark;
    if (curMark === 'O') {
      cells[i].innerHTML = `<span class="o-sym">${sym(curMark)}</span>`;
    } else {
      cells[i].textContent = sym(curMark);
    }
    cells[i].style.color = clr(curMark);
    cells[i].classList.add('taken', curMark === 'X' ? 'x-mark' : 'o-mark');

    const win = checkWin();
    if (win) {
      active = false;
      clearInterval(cInt);
      timerEl.classList.add('hidden');
      win.forEach(j => cells[j].classList.add('win-cell'));
      showOver(`Player ${pnum(curMark)} (${sym(curMark)}) wins!`);
      return;
    }

    if (board.every(v => v)) {
      active = false;
      clearInterval(cInt);
      timerEl.classList.add('hidden');
      showOver("It's a draw!");
      return;
    }

    curMark = curMark === 'X' ? 'O' : 'X';
    setStatus();
    resetTimer();
  }

  function showOver(msg) {
    overlayMsg.textContent = msg;
    overlay.classList.add('visible');
  }

  cells.forEach((c, i) => c.addEventListener('click', () => onCell(i)));

  btnPlay.addEventListener('click', function () {
    warpIn(screenGame, this);
    startGame();
  });

  btnAgain.addEventListener('click', startGame);

  btnMenuFrom.addEventListener('click', function () {
    clearInterval(cInt);
    warpOut(screenGame, btnPlay);
  });

  btnGameBack.addEventListener('click', function () {
    clearInterval(cInt);
    warpOut(screenGame, btnPlay);
  });
})();
