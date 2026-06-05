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
wireTimeSlider(timeSlider, timeValue);

let p1IsX = true;
firstToggle.addEventListener('click', function () {
  p1IsX = !p1IsX;
  this.textContent = p1IsX ? 'Player 1 is \u2715' : 'Player 1 is \u25cb';
});

// ── Screen navigation ─────────────────────────────────────────────
wireNav([
  { btn: btnTTT, screen: screenTTT, backBtn: btnBack },
  { btn: btnTTTSettings, screen: screenTTTSet, backBtn: btnSettingsBack },
]);

// ── Decorative scattered TTT boards ──────────────────────────────
(function () {
  const sizes = [44, 52, 60, 68, 80, 92, 106];
  scatterDecorations({
    container: document.getElementById('ttt-deco'),
    count: 18,
    getSize: function () { return sizes[Math.floor(Math.random() * sizes.length)]; },
    createItem: function (x, y, angle, size) {
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
      return board;
    },
  });
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
  let board, curMark, active;

  function sym(m)   { return m === 'X' ? '\u2715' : '\u25cb'; }
  function clr(m)   { return `hsl(${m === 'X' ? xHue.value : oHue.value}, 80%, 48%)`; }
  function p1mark() { return p1IsX ? 'X' : 'O'; }
  function pnum(m)  { return m === p1mark() ? 1 : 2; }

  const timer = createTimer(timeSlider, timerEl, timerDisp, onTimeout);

  function startGame() {
    board   = Array(9).fill(null);
    active  = true;
    curMark = p1mark();
    cells.forEach(c => {
      c.textContent = '';
      c.style.color = '';
      c.classList.remove('taken', 'win-cell', 'x-mark', 'o-mark');
    });
    hideOverlay(overlay);
    setStatus();
    timer.reset();
  }

  function setStatus() {
    statusEl.textContent = `Player ${pnum(curMark)} (${sym(curMark)})'s turn`;
    statusEl.style.color  = clr(curMark);
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
      timer.reset();
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
      timer.stop();
      timerEl.classList.add('hidden');
      win.forEach(j => cells[j].classList.add('win-cell'));
      overlayMsg.textContent = `Player ${pnum(curMark)} (${sym(curMark)}) wins!`;
      showOverlay(overlay);
      return;
    }

    if (board.every(v => v)) {
      active = false;
      timer.stop();
      timerEl.classList.add('hidden');
      overlayMsg.textContent = "It's a draw!";
      showOverlay(overlay);
      return;
    }

    curMark = curMark === 'X' ? 'O' : 'X';
    setStatus();
    timer.reset();
  }

  cells.forEach((c, i) => c.addEventListener('click', () => onCell(i)));

  btnPlay.addEventListener('click', function () {
    warpIn(screenGame, this);
    startGame();
  });

  btnAgain.addEventListener('click', startGame);

  btnMenuFrom.addEventListener('click', function () {
    timer.stop();
    warpOut(screenGame, btnPlay);
  });

  btnGameBack.addEventListener('click', function () {
    timer.stop();
    warpOut(screenGame, btnPlay);
  });
})();
