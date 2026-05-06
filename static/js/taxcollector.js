// ── Tax Collector Navigation ─────────────────────────────────────
const screenTaxCollector    = document.getElementById('screen-taxcollector');
const screenTcSettings      = document.getElementById('screen-tc-settings');
const screenTcGame          = document.getElementById('screen-tc-game');
const btnTaxCollector       = document.getElementById('btn-taxcollector');
const btnTcBack             = document.getElementById('btn-taxcollector-back');
const btnTcSettings         = document.getElementById('btn-taxcollector-settings');
const btnTcSettingsBack     = document.getElementById('btn-tc-settings-back');
const btnPlayTc             = document.getElementById('btn-play-taxcollector');

// Ceiling slider
const tcCeilingSlider = document.getElementById('tc-ceiling-slider');
const tcCeilingValue  = document.getElementById('tc-ceiling-value');
tcCeilingSlider.addEventListener('input', function () {
  tcCeilingValue.textContent = this.value;
});

btnTaxCollector.addEventListener('click',    function () { warpIn(screenTaxCollector, this); });
btnTcBack.addEventListener('click',          function () { warpOut(screenTaxCollector, btnTaxCollector); });
btnTcSettings.addEventListener('click',      function () { warpIn(screenTcSettings, this); });
btnTcSettingsBack.addEventListener('click',  function () { warpOut(screenTcSettings, btnTcSettings); });

// ── Tax Collector Game ───────────────────────────────────────────
(function () {
  var tcNums;          // [{n, state: 'free'|'player'|'tax'}]
  var tcPlayerScore, tcTaxScore, tcOver;

  var gridEl    = document.getElementById('tc-grid');
  var scoreEl   = document.getElementById('tc-score');
  var statusEl  = document.getElementById('tc-status');
  var gameOverEl = document.getElementById('tc-game-over');
  var overMsgEl  = document.getElementById('tc-over-msg');

  btnPlayTc.addEventListener('click', function () {
    warpIn(screenTcGame, this);
    startGame();
  });

  document.getElementById('btn-tc-game-back').addEventListener('click', function () {
    warpOut(screenTcGame, btnPlayTc);
  });

  document.getElementById('btn-tc-play-again').addEventListener('click', startGame);

  document.getElementById('btn-tc-main-menu').addEventListener('click', function () {
    warpOut(screenTcGame, btnTaxCollector);
  });

  // ── Start / reset ─────────────────────────────────────────────
  function startGame() {
    var N = parseInt(tcCeilingSlider.value);
    tcPlayerScore = 0;
    tcTaxScore    = 0;
    tcOver        = false;
    tcNums        = [];
    gameOverEl.classList.remove('visible');

    for (var i = 1; i <= N; i++) {
      tcNums.push({ n: i, state: 'free' });
    }

    renderGrid();
    updateScore();
    statusEl.textContent = 'Pick a number';
  }

  // All proper divisors of n (numbers 1..(n-1) that divide n evenly)
  function divisorsOf(n) {
    var d = [];
    for (var i = 1; i < n; i++) {
      if (n % i === 0) d.push(i);
    }
    return d;
  }

  // Divisors of n that are still 'free' in tcNums
  function freeDivisors(n) {
    return divisorsOf(n).filter(function (d) {
      var e = tcNums.find(function (x) { return x.n === d; });
      return e && e.state === 'free';
    });
  }

  function isPickable(n) {
    var e = tcNums.find(function (x) { return x.n === n; });
    return e && e.state === 'free' && freeDivisors(n).length > 0;
  }

  // ── Render ────────────────────────────────────────────────────
  function renderGrid() {
    gridEl.innerHTML = '';
    tcNums.forEach(function (entry) {
      var btn = document.createElement('button');
      btn.dataset.n   = entry.n;
      btn.textContent = entry.n;
      btn.className   = 'tc-num';

      if (entry.state === 'player') {
        btn.classList.add('tc-player');
      } else if (entry.state === 'tax') {
        btn.classList.add('tc-tax');
      } else if (isPickable(entry.n)) {
        btn.classList.add('tc-pickable');
        btn.addEventListener('click',      (function (n) { return function () { onPick(n); }; })(entry.n));
        btn.addEventListener('mouseenter', (function (n) { return function () { onHover(n, true); }; })(entry.n));
        btn.addEventListener('mouseleave', (function (n) { return function () { onHover(n, false); }; })(entry.n));
      } else {
        btn.classList.add('tc-blocked');
      }

      gridEl.appendChild(btn);
    });
  }

  function onHover(n, on) {
    var divs = freeDivisors(n);
    // Highlight divisors
    divs.forEach(function (d) {
      var el = gridEl.querySelector('[data-n="' + d + '"]');
      if (el) el.classList.toggle('tc-divisor-hint', on);
    });
    // Update status hint
    if (on && divs.length > 0) {
      var sum = divs.reduce(function (a, b) { return a + b; }, 0);
      statusEl.textContent = 'Tax Collector gets: ' + divs.join(', ') + '  (total: ' + sum + ')';
    } else {
      statusEl.textContent = 'Pick a number';
    }
  }

  // ── Game logic ────────────────────────────────────────────────
  function onPick(n) {
    if (tcOver) return;

    var divs  = freeDivisors(n);   // capture before any state changes
    var entry = tcNums.find(function (x) { return x.n === n; });
    entry.state    = 'player';
    tcPlayerScore += n;

    // Tax Collector takes the divisors
    divs.forEach(function (d) {
      var de = tcNums.find(function (x) { return x.n === d; });
      de.state   = 'tax';
      tcTaxScore += d;
    });

    updateScore();

    // Check if any valid picks remain
    var anyPickable = tcNums.some(function (x) { return isPickable(x.n); });
    if (!anyPickable) {
      // Tax Collector sweeps all remaining free numbers
      tcNums.forEach(function (x) {
        if (x.state === 'free') {
          x.state    = 'tax';
          tcTaxScore += x.n;
        }
      });
      updateScore();
      renderGrid();
      endGame();
    } else {
      renderGrid();
      statusEl.textContent = 'Pick a number';
    }
  }

  function updateScore() {
    scoreEl.innerHTML =
      '<span style="color:#2563eb">You: ' + tcPlayerScore + '</span>' +
      ' &nbsp;|&nbsp; ' +
      '<span style="color:#cc2222">Tax Collector: ' + tcTaxScore + '</span>';
  }

  function endGame() {
    tcOver = true;
    var msg;
    if (tcPlayerScore > tcTaxScore)
      msg = '🎉 You win!<br>' + tcPlayerScore + ' vs ' + tcTaxScore;
    else if (tcTaxScore > tcPlayerScore)
      msg = '😔 Tax Collector wins!<br>' + tcTaxScore + ' vs ' + tcPlayerScore;
    else
      msg = "It's a draw!<br>" + tcPlayerScore + ' each';
    overMsgEl.innerHTML = msg;
    gameOverEl.classList.add('visible');
  }

  // ── Rules toggle ──────────────────────────────────────────────
  var tcRulesToggle = document.getElementById('tc-rules-toggle');
  var tcRulesPanel  = document.getElementById('tc-rules-panel');
  tcRulesToggle.addEventListener('click', function () {
    var open = tcRulesPanel.classList.toggle('open');
    this.setAttribute('aria-expanded', open);
    this.textContent = open ? '✕ Rules' : '? Rules';
  });
})();
