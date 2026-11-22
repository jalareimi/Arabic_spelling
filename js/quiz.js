/*
 * Quiz state. Screens call these functions; they do not touch the DOM.
 * One attempt is recorded per word, then the student moves on.
 */
(function () {
  function create(studentName) {
    return {
      studentName: studentName,
      words: window.Imla.WordBank.getQuizWords(),
      index: 0,
      answered: false,
      results: []
    };
  }

  function current(state) {
    return state.words[state.index];
  }

  function answer(state, typed) {
    if (state.answered) return null;
    var word = current(state);
    var trimmed = String(typed || "").trim();
    var correct = window.Imla.Normalize.equals(trimmed, word.text);
    var result = {
      wordId: word.id,
      expected: word.text,
      emoji: word.emoji,
      typed: trimmed,
      correct: correct
    };
    state.results.push(result);
    state.answered = true;
    return result;
  }

  function advance(state) {
    state.index += 1;
    state.answered = false;
    return state.index >= state.words.length;
  }

  function isLast(state) {
    return state.index >= state.words.length - 1;
  }

  function toSession(state) {
    var score = state.results.filter(function (item) { return item.correct; }).length;
    return {
      studentName: state.studentName,
      finishedAt: new Date().toISOString(),
      score: score,
      total: state.words.length,
      results: state.results.slice()
    };
  }

  window.Imla.Quiz = {
    create: create,
    current: current,
    answer: answer,
    advance: advance,
    isLast: isLast,
    toSession: toSession
  };
})();
