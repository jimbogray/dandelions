// ── Shared utilities ──────────────────────────────────────────────
const timeLevels = ['Unlimited', '10s', '15s', '20s', '30s', '45s', '60s', '90s'];

function getCenter(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function warpIn(screen, originEl) {
  const { x, y } = getCenter(originEl);
  screen.style.setProperty('--ox', x + 'px');
  screen.style.setProperty('--oy', y + 'px');
  screen.style.animation = 'none';
  screen.getBoundingClientRect();
  screen.style.animation = 'warp-in 1s cubic-bezier(0.35, 0, 0.75, 0) forwards';
}

function warpOut(screen, targetEl) {
  const { x, y } = getCenter(targetEl);
  screen.style.setProperty('--ox', x + 'px');
  screen.style.setProperty('--oy', y + 'px');
  screen.style.animation = 'none';
  screen.getBoundingClientRect();
  screen.style.animation = 'warp-out 1s cubic-bezier(0.25, 1, 0.65, 1) forwards';
}

// ── Navigation wiring ─────────────────────────────────────────────
// Wire pairs of [button, screen, backTarget] for warpIn/warpOut navigation.
//   pairs: [{ btn, screen, backBtn?, backTarget? }]
function wireNav(pairs) {
  pairs.forEach(function (p) {
    p.btn.addEventListener('click', function () { warpIn(p.screen, this); });
    if (p.backBtn) {
      p.backBtn.addEventListener('click', function () {
        warpOut(p.screen, p.backTarget || p.btn);
      });
    }
  });
}

// ── Time-slider wiring ────────────────────────────────────────────
function wireTimeSlider(slider, display) {
  slider.addEventListener('input', function () {
    display.textContent = timeLevels[this.value];
  });
}

// ── Toggle-group wiring ───────────────────────────────────────────
// Makes buttons inside `selector` mutually exclusive (.selected).
// Optional `onChange(btn)` callback on selection change.
function wireToggleGroup(selector, onChange) {
  document.querySelectorAll(selector).forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll(selector).forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      if (onChange) onChange(btn);
    });
  });
}

// ── Rules-panel toggle ────────────────────────────────────────────
function wireRulesToggle(toggleEl, panelEl) {
  toggleEl.addEventListener('click', function () {
    var open = panelEl.classList.toggle('open');
    this.setAttribute('aria-expanded', open);
    this.textContent = open ? '\u2715 Rules' : '? Rules';
  });
}

// ── Game-over overlay helpers ─────────────────────────────────────
function showOverlay(el) { el.classList.add('visible'); }
function hideOverlay(el) { el.classList.remove('visible'); }

// ── Countdown timer factory ───────────────────────────────────────
// Returns { reset(), stop() }.
//   sliderEl : the range input for time level
//   timerEl  : wrapper element (gets hidden/urgent/ringing classes)
//   displayEl: element whose textContent shows remaining seconds
//   onTimeout: callback when timer reaches 0
function createTimer(sliderEl, timerEl, displayEl, onTimeout) {
  var countdown = 0, cInt = null;

  function stop() {
    clearInterval(cInt);
    cInt = null;
  }

  function reset() {
    stop();
    timerEl.classList.remove('urgent', 'ringing');
    timerEl.style.color       = '';
    timerEl.style.borderColor = '';

    var lvl = parseInt(sliderEl.value);
    if (lvl === 0) { timerEl.classList.add('hidden'); return; }

    timerEl.classList.remove('hidden');
    countdown = parseInt(timeLevels[lvl]);
    displayEl.textContent = countdown;

    cInt = setInterval(function () {
      countdown--;
      displayEl.textContent = countdown;
      if (countdown <= 5) timerEl.classList.add('urgent');
      if (countdown <= 0) { stop(); onTimeout(); }
    }, 1000);
  }

  return { reset: reset, stop: stop };
}

// ── Decorative scatter ────────────────────────────────────────────
// Scatters random elements outside a centered safe zone.
//   container  : parent element
//   count      : number of items to place
//   maxAttempts: max random placement tries (default 400)
//   safeMargins: { x1, x2, y1, y2 } as fractions (default 0.25/0.75/0.20/0.80)
//   createItem(x, y, angle, size, W, H): must return an element or null
//   getSize()  : returns the size of the next item to try
function scatterDecorations(opts) {
  var container   = opts.container;
  var count       = opts.count;
  var maxAttempts = opts.maxAttempts || 400;
  var m           = opts.safeMargins || {};
  var W = window.innerWidth, H = window.innerHeight;
  var safeX1 = W * (m.x1 != null ? m.x1 : 0.25);
  var safeX2 = W * (m.x2 != null ? m.x2 : 0.75);
  var safeY1 = H * (m.y1 != null ? m.y1 : 0.20);
  var safeY2 = H * (m.y2 != null ? m.y2 : 0.80);

  var placed = 0, attempts = 0;
  while (placed < count && attempts < maxAttempts) {
    attempts++;
    var size  = opts.getSize();
    var x     = Math.random() * (W - size);
    var y     = Math.random() * (H - size);
    if (x + size > safeX1 && x < safeX2 && y + size > safeY1 && y < safeY2) continue;
    var angle = Math.random() * 360;
    var el    = opts.createItem(x, y, angle, size, W, H);
    if (el) { container.appendChild(el); placed++; }
  }
}

// ── Fisher-Yates shuffle ──────────────────────────────────────────
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}
