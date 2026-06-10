// ── Higher or Lower Game Navigation ──────────────────────────────
(function () {
  const screenCarnival     = document.getElementById('screen-carnival');
  const screenCarnivalGame = document.getElementById('screen-carnival-game');
  const btnCarnival        = document.getElementById('btn-carnival');
  const btnCarnivalBack    = document.getElementById('btn-carnival-back');
  const btnPlayCarnival    = document.getElementById('btn-play-carnival');
  const btnCarnivalGameBack = document.getElementById('btn-carnival-game-back');
  const btnCarnivalAgain   = document.getElementById('btn-carnival-play-again');
  const btnCarnivalMenu    = document.getElementById('btn-carnival-main-menu');
  const btnHigher          = document.getElementById('btn-carnival-higher');
  const btnLower           = document.getElementById('btn-carnival-lower');

  const scoreEl   = document.getElementById('carnival-score');
  const timeEl    = document.getElementById('carnival-time');
  const statusEl  = document.getElementById('carnival-status');
  const cardEl    = document.getElementById('carnival-card');
  const overEl    = document.getElementById('carnival-game-over');
  const overMsgEl = document.getElementById('carnival-over-msg');

  let score = 0;
  let deck = [];
  let currentCard = null;
  let nextIndex = 0;

  wireNav([
    { btn: btnCarnival, screen: screenCarnival, backBtn: btnCarnivalBack },
  ]);

  function makeDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = [
      { label: 'A', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '6', value: 6 },
      { label: '7', value: 7 },
      { label: '8', value: 8 },
      { label: '9', value: 9 },
      { label: '10', value: 10 },
      { label: 'J', value: 11 },
      { label: 'Q', value: 12 },
      { label: 'K', value: 13 },
    ];

    const cards = [];
    suits.forEach(function (suit) {
      ranks.forEach(function (rank) {
        cards.push({
          label: rank.label,
          suit: suit,
          value: rank.value,
        });
      });
    });
    return shuffle(cards);
  }

  function setGuessEnabled(enabled) {
    btnHigher.disabled = !enabled;
    btnLower.disabled = !enabled;
  }

  function renderCard(card) {
    const color = (card.suit === '♥' || card.suit === '♦') ? '#c0392b' : '#1a4a6e';
    cardEl.style.color = color;
    cardEl.textContent = card.label + card.suit;

    cardEl.classList.remove('flip');
    cardEl.getBoundingClientRect();
    cardEl.classList.add('flip');
  }

  function updateHud() {
    scoreEl.textContent = 'Score: ' + score;
    timeEl.textContent = 'Cards left: ' + Math.max(0, deck.length - nextIndex);
  }

  function endGame(reason) {
    setGuessEnabled(false);
    let header;
    if (reason === 'deck-finished') {
      header = '🎉 Perfect run!';
    } else {
      header = '💥 Wrong guess!';
    }
    overMsgEl.textContent = header + '\nFinal score: ' + score;
    overMsgEl.style.whiteSpace = 'pre-line';
    showOverlay(overEl);
  }

  function onGuess(type) {
    if (nextIndex >= deck.length) {
      endGame('deck-finished');
      return;
    }

    const nextCard = deck[nextIndex++];
    renderCard(nextCard);

    let correct;
    if (nextCard.value === currentCard.value) {
      // Tie counts as correct to keep the run going.
      correct = true;
    } else {
      correct = type === 'higher'
        ? nextCard.value > currentCard.value
        : nextCard.value < currentCard.value;
    }

    if (!correct) {
      statusEl.textContent = 'Wrong guess. Run ended.';
      updateHud();
      endGame('wrong');
      return;
    }

    score++;
    currentCard = nextCard;
    updateHud();

    if (nextIndex >= deck.length) {
      statusEl.textContent = 'You cleared the full deck!';
      endGame('deck-finished');
    } else {
      statusEl.textContent = 'Correct! Higher or lower?';
    }
  }

  function startGame() {
    hideOverlay(overEl);
    score = 0;
    deck = makeDeck();
    currentCard = deck[0];
    nextIndex = 1;

    statusEl.textContent = 'First card is face up. Guess higher or lower.';
    renderCard(currentCard);
    updateHud();
    setGuessEnabled(true);
  }

  btnPlayCarnival.addEventListener('click', function () {
    warpIn(screenCarnivalGame, this);
    startGame();
  });

  btnCarnivalGameBack.addEventListener('click', function () {
    setGuessEnabled(false);
    warpOut(screenCarnivalGame, btnPlayCarnival);
  });

  btnCarnivalAgain.addEventListener('click', startGame);

  btnCarnivalMenu.addEventListener('click', function () {
    setGuessEnabled(false);
    warpOut(screenCarnivalGame, btnPlayCarnival);
  });

  btnHigher.addEventListener('click', function () {
    onGuess('higher');
  });

  btnLower.addEventListener('click', function () {
    onGuess('lower');
  });
})();
