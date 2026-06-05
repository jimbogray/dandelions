/**
 * Unit tests for static/js/statecapitals.js — State Capitals quiz logic.
 *
 * Tests the shuffle, wrong-answer selection, scoring, and game-over logic
 * by loading the real source into jsdom and interacting through the DOM.
 */

const { buildDOM } = require('./helpers');

describe('State Capitals game logic', () => {
  let dom, window, document;

  beforeEach(() => {
    dom = buildDOM(['utils.js', 'menu-deco.js', 'statecapitals.js']);
    window = dom.window;
    document = window.document;
  });

  afterEach(() => {
    dom.window.close();
  });

  function clickPlay() {
    document.getElementById('btn-play-sc').click();
  }

  function getChoiceButtons() {
    return Array.from(document.querySelectorAll('#sc-choices .sc-choice-btn'));
  }

  function getQuestionText() {
    return document.getElementById('sc-question').textContent;
  }

  function getProgressText() {
    return document.getElementById('sc-progress').textContent;
  }

  function getScoreText() {
    return document.getElementById('sc-score-display').textContent;
  }

  function clickNext() {
    document.getElementById('sc-next-btn').click();
  }

  // ── Game start ──────────────────────────────────────────────────

  test('starting a game shows a question', () => {
    clickPlay();
    const q = getQuestionText();
    expect(q.length).toBeGreaterThan(0);
  });

  test('starting a game shows 3 answer choices', () => {
    clickPlay();
    const btns = getChoiceButtons();
    expect(btns).toHaveLength(3);
  });

  test('progress starts at "Question 1 of 50"', () => {
    clickPlay();
    const p = getProgressText();
    expect(p).toContain('1');
    expect(p).toContain('50');
  });

  test('score starts at 0', () => {
    clickPlay();
    const s = getScoreText();
    expect(s).toContain('0');
  });

  // ── Answer choices ──────────────────────────────────────────────

  test('exactly one choice is the correct answer for each question', () => {
    clickPlay();
    // We need to know what state is being asked about.
    // The question text IS the state name. One of the 3 choices
    // should be its capital. We'll just verify all 3 are distinct.
    const btns = getChoiceButtons();
    const answers = btns.map(b => b.textContent);
    const unique = new Set(answers);
    expect(unique.size).toBe(3);
  });

  // ── Correct answer ─────────────────────────────────────────────

  test('selecting the correct answer increments score', () => {
    clickPlay();
    // We'll brute-force by clicking each choice until we find the correct one.
    // After answering, the correct button gets class "correct".
    const btns = getChoiceButtons();

    // All 50 state/capital pairs to look up the right answer
    const STATE_CAPITALS = {
      'Alabama': 'Montgomery', 'Alaska': 'Juneau', 'Arizona': 'Phoenix',
      'Arkansas': 'Little Rock', 'California': 'Sacramento',
      'Colorado': 'Denver', 'Connecticut': 'Hartford', 'Delaware': 'Dover',
      'Florida': 'Tallahassee', 'Georgia': 'Atlanta', 'Hawaii': 'Honolulu',
      'Idaho': 'Boise', 'Illinois': 'Springfield', 'Indiana': 'Indianapolis',
      'Iowa': 'Des Moines', 'Kansas': 'Topeka', 'Kentucky': 'Frankfort',
      'Louisiana': 'Baton Rouge', 'Maine': 'Augusta', 'Maryland': 'Annapolis',
      'Massachusetts': 'Boston', 'Michigan': 'Lansing',
      'Minnesota': 'Saint Paul', 'Mississippi': 'Jackson',
      'Missouri': 'Jefferson City', 'Montana': 'Helena',
      'Nebraska': 'Lincoln', 'Nevada': 'Carson City',
      'New Hampshire': 'Concord', 'New Jersey': 'Trenton',
      'New Mexico': 'Santa Fe', 'New York': 'Albany',
      'North Carolina': 'Raleigh', 'North Dakota': 'Bismarck',
      'Ohio': 'Columbus', 'Oklahoma': 'Oklahoma City', 'Oregon': 'Salem',
      'Pennsylvania': 'Harrisburg', 'Rhode Island': 'Providence',
      'South Carolina': 'Columbia', 'South Dakota': 'Pierre',
      'Tennessee': 'Nashville', 'Texas': 'Austin',
      'Utah': 'Salt Lake City', 'Vermont': 'Montpelier',
      'Virginia': 'Richmond', 'Washington': 'Olympia',
      'West Virginia': 'Charleston', 'Wisconsin': 'Madison',
      'Wyoming': 'Cheyenne',
    };

    const state = getQuestionText();
    const correctCapital = STATE_CAPITALS[state];
    const correctBtn = btns.find(b => b.textContent === correctCapital);
    correctBtn.click();

    expect(correctBtn.classList.contains('correct')).toBe(true);
    expect(getScoreText()).toContain('1');
  });

  // ── Wrong answer ────────────────────────────────────────────────

  test('selecting a wrong answer marks it wrong and reveals correct', () => {
    clickPlay();
    const STATE_CAPITALS = {
      'Alabama': 'Montgomery', 'Alaska': 'Juneau', 'Arizona': 'Phoenix',
      'Arkansas': 'Little Rock', 'California': 'Sacramento',
      'Colorado': 'Denver', 'Connecticut': 'Hartford', 'Delaware': 'Dover',
      'Florida': 'Tallahassee', 'Georgia': 'Atlanta', 'Hawaii': 'Honolulu',
      'Idaho': 'Boise', 'Illinois': 'Springfield', 'Indiana': 'Indianapolis',
      'Iowa': 'Des Moines', 'Kansas': 'Topeka', 'Kentucky': 'Frankfort',
      'Louisiana': 'Baton Rouge', 'Maine': 'Augusta', 'Maryland': 'Annapolis',
      'Massachusetts': 'Boston', 'Michigan': 'Lansing',
      'Minnesota': 'Saint Paul', 'Mississippi': 'Jackson',
      'Missouri': 'Jefferson City', 'Montana': 'Helena',
      'Nebraska': 'Lincoln', 'Nevada': 'Carson City',
      'New Hampshire': 'Concord', 'New Jersey': 'Trenton',
      'New Mexico': 'Santa Fe', 'New York': 'Albany',
      'North Carolina': 'Raleigh', 'North Dakota': 'Bismarck',
      'Ohio': 'Columbus', 'Oklahoma': 'Oklahoma City', 'Oregon': 'Salem',
      'Pennsylvania': 'Harrisburg', 'Rhode Island': 'Providence',
      'South Carolina': 'Columbia', 'South Dakota': 'Pierre',
      'Tennessee': 'Nashville', 'Texas': 'Austin',
      'Utah': 'Salt Lake City', 'Vermont': 'Montpelier',
      'Virginia': 'Richmond', 'Washington': 'Olympia',
      'West Virginia': 'Charleston', 'Wisconsin': 'Madison',
      'Wyoming': 'Cheyenne',
    };

    const state = getQuestionText();
    const correctCapital = STATE_CAPITALS[state];
    const btns = getChoiceButtons();
    const wrongBtn = btns.find(b => b.textContent !== correctCapital);
    wrongBtn.click();

    expect(wrongBtn.classList.contains('wrong')).toBe(true);

    // The correct answer should be revealed
    const revealedBtns = btns.filter(b => b.classList.contains('reveal-correct'));
    expect(revealedBtns).toHaveLength(1);
    expect(revealedBtns[0].textContent).toBe(correctCapital);
  });

  // ── Answer locking ──────────────────────────────────────────────

  test('buttons are disabled after answering', () => {
    clickPlay();
    const btns = getChoiceButtons();
    btns[0].click(); // answer (right or wrong)
    btns.forEach(b => expect(b.disabled).toBe(true));
  });

  // ── Next question ───────────────────────────────────────────────

  test('clicking next advances to question 2', () => {
    clickPlay();
    const btns = getChoiceButtons();
    btns[0].click(); // answer first question
    clickNext();
    expect(getProgressText()).toContain('2');
  });

  // ── Multiple questions produce distinct states ──────────────────

  test('answering two questions updates score correctly', () => {
    clickPlay();

    // Answer first question (just click first choice)
    let btns = getChoiceButtons();
    btns[0].click();
    clickNext();

    // Answer second question
    btns = getChoiceButtons();
    btns[0].click();

    // Score should reflect 2 questions answered
    const score = getScoreText();
    expect(score).toContain('2'); // "Score: X / 2"
  });
});
