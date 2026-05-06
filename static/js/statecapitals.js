// ── State Capitals Game ───────────────────────────────────────────
(function () {
  const screenSC      = document.getElementById('screen-statecapitals');
  const screenSCGame  = document.getElementById('screen-sc-game');
  const btnSC         = document.getElementById('btn-statecapitals');
  const btnSCBack     = document.getElementById('btn-sc-back');
  const btnSCGameBack = document.getElementById('btn-sc-game-back');
  const btnPlaySC     = document.getElementById('btn-play-sc');
  const btnPlayAgain  = document.getElementById('btn-sc-play-again');
  const btnMainMenu   = document.getElementById('btn-sc-main-menu');

  const scProgress    = document.getElementById('sc-progress');
  const scScoreDisplay = document.getElementById('sc-score-display');
  const scQuestion    = document.getElementById('sc-question');
  const scChoices     = document.getElementById('sc-choices');
  const scFeedback    = document.getElementById('sc-feedback');
  const scNextBtn     = document.getElementById('sc-next-btn');
  const scExitBtn     = document.getElementById('sc-exit-btn');
  const scGameOver    = document.getElementById('sc-game-over');
  const scOverMsg     = document.getElementById('sc-over-msg');

  // ── All 50 states and capitals ────────────────────────────────
  const STATES = [
    { state: 'Alabama',        capital: 'Montgomery' },
    { state: 'Alaska',         capital: 'Juneau' },
    { state: 'Arizona',        capital: 'Phoenix' },
    { state: 'Arkansas',       capital: 'Little Rock' },
    { state: 'California',     capital: 'Sacramento' },
    { state: 'Colorado',       capital: 'Denver' },
    { state: 'Connecticut',    capital: 'Hartford' },
    { state: 'Delaware',       capital: 'Dover' },
    { state: 'Florida',        capital: 'Tallahassee' },
    { state: 'Georgia',        capital: 'Atlanta' },
    { state: 'Hawaii',         capital: 'Honolulu' },
    { state: 'Idaho',          capital: 'Boise' },
    { state: 'Illinois',       capital: 'Springfield' },
    { state: 'Indiana',        capital: 'Indianapolis' },
    { state: 'Iowa',           capital: 'Des Moines' },
    { state: 'Kansas',         capital: 'Topeka' },
    { state: 'Kentucky',       capital: 'Frankfort' },
    { state: 'Louisiana',      capital: 'Baton Rouge' },
    { state: 'Maine',          capital: 'Augusta' },
    { state: 'Maryland',       capital: 'Annapolis' },
    { state: 'Massachusetts',  capital: 'Boston' },
    { state: 'Michigan',       capital: 'Lansing' },
    { state: 'Minnesota',      capital: 'Saint Paul' },
    { state: 'Mississippi',    capital: 'Jackson' },
    { state: 'Missouri',       capital: 'Jefferson City' },
    { state: 'Montana',        capital: 'Helena' },
    { state: 'Nebraska',       capital: 'Lincoln' },
    { state: 'Nevada',         capital: 'Carson City' },
    { state: 'New Hampshire',  capital: 'Concord' },
    { state: 'New Jersey',     capital: 'Trenton' },
    { state: 'New Mexico',     capital: 'Santa Fe' },
    { state: 'New York',       capital: 'Albany' },
    { state: 'North Carolina', capital: 'Raleigh' },
    { state: 'North Dakota',   capital: 'Bismarck' },
    { state: 'Ohio',           capital: 'Columbus' },
    { state: 'Oklahoma',       capital: 'Oklahoma City' },
    { state: 'Oregon',         capital: 'Salem' },
    { state: 'Pennsylvania',   capital: 'Harrisburg' },
    { state: 'Rhode Island',   capital: 'Providence' },
    { state: 'South Carolina', capital: 'Columbia' },
    { state: 'South Dakota',   capital: 'Pierre' },
    { state: 'Tennessee',      capital: 'Nashville' },
    { state: 'Texas',          capital: 'Austin' },
    { state: 'Utah',           capital: 'Salt Lake City' },
    { state: 'Vermont',        capital: 'Montpelier' },
    { state: 'Virginia',       capital: 'Richmond' },
    { state: 'Washington',     capital: 'Olympia' },
    { state: 'West Virginia',  capital: 'Charleston' },
    { state: 'Wisconsin',      capital: 'Madison' },
    { state: 'Wyoming',        capital: 'Cheyenne' },
  ];

  let deck = [];
  let currentIdx = 0;
  let score = 0;
  let answered = false;

  // ── Fisher-Yates shuffle ──────────────────────────────────────
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Pick 2 wrong answers different from correct ───────────────
  function getWrongAnswers(correctCapital) {
    const pool = STATES.filter(s => s.capital !== correctCapital);
    const shuffled = shuffle(pool);
    return [shuffled[0].capital, shuffled[1].capital];
  }

  // ── Render current question ───────────────────────────────────
  function renderQuestion() {
    const item = deck[currentIdx];
    answered = false;

    scProgress.textContent = `Question ${currentIdx + 1} of ${deck.length}`;
    scScoreDisplay.textContent = `Score: ${score} / ${currentIdx}`;
    scQuestion.textContent = item.state;
    scFeedback.textContent = '';
    scNextBtn.disabled = true;
    scNextBtn.textContent = 'Next →';

    const wrongs = getWrongAnswers(item.capital);
    const options = shuffle([item.capital, wrongs[0], wrongs[1]]);

    scChoices.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'sc-choice-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => onChoice(btn, opt, item.capital));
      scChoices.appendChild(btn);
    });
  }

  // ── Handle answer selection ───────────────────────────────────
  function onChoice(btn, chosen, correct) {
    if (answered) return;
    answered = true;

    // Disable all buttons
    scChoices.querySelectorAll('.sc-choice-btn').forEach(b => { b.disabled = true; });

    if (chosen === correct) {
      score++;
      btn.classList.add('correct');
      scFeedback.textContent = '✓ Correct!';
      scFeedback.style.color = '#155724';
    } else {
      btn.classList.add('wrong');
      scFeedback.textContent = `✗ The capital is ${correct}.`;
      scFeedback.style.color = '#721c24';
      // Highlight the correct answer
      scChoices.querySelectorAll('.sc-choice-btn').forEach(b => {
        if (b.textContent === correct) b.classList.add('reveal-correct');
      });
    }

    scScoreDisplay.textContent = `Score: ${score} / ${currentIdx + 1}`;

    if (currentIdx + 1 < deck.length) {
      scNextBtn.disabled = false;
    } else {
      // Last question — show game over after brief delay
      scNextBtn.disabled = true;
      setTimeout(showGameOver, 900);
    }
  }

  // ── Next button ───────────────────────────────────────────────
  scNextBtn.addEventListener('click', () => {
    currentIdx++;
    renderQuestion();
  });

  // ── Show final score ──────────────────────────────────────────
  function showGameOver() {
    const total = deck.length;
    const pct = Math.round((score / total) * 100);
    let grade;
    if (pct === 100) grade = '🏆 Perfect score!';
    else if (pct >= 90) grade = '🌟 Excellent!';
    else if (pct >= 70) grade = '👍 Good job!';
    else if (pct >= 50) grade = '📚 Keep studying!';
    else grade = '🗺️ Better luck next time!';

    scOverMsg.textContent = `${grade}\nYou got ${score} out of ${total} correct (${pct}%)`;
    scOverMsg.style.whiteSpace = 'pre-line';
    scGameOver.classList.add('visible');
  }

  // ── Start / restart game ──────────────────────────────────────
  function startGame() {
    deck = shuffle(STATES);
    currentIdx = 0;
    score = 0;
    scGameOver.classList.remove('visible');
    renderQuestion();
  }

  // ── Navigation wiring ─────────────────────────────────────────
  btnSC.addEventListener('click', function () { warpIn(screenSC, this); });
  btnSCBack.addEventListener('click', function () { warpOut(screenSC, btnSC); });

  btnPlaySC.addEventListener('click', function () {
    warpIn(screenSCGame, this);
    startGame();
  });

  btnSCGameBack.addEventListener('click', function () {
    warpOut(screenSCGame, btnPlaySC);
  });

  scExitBtn.addEventListener('click', function () {
    warpOut(screenSCGame, btnPlaySC);
  });

  btnPlayAgain.addEventListener('click', startGame);

  btnMainMenu.addEventListener('click', function () {
    warpOut(screenSCGame, btnPlaySC);
  });
})();
