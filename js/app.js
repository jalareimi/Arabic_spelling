/*
 * Wires the three screens together.
 *
 * Flow: welcome (name) -> one word at a time -> score summary.
 * Speech and sound effects run from the button clicks so browsers
 * allow audio. Records.save() keeps each finished quiz for a future
 * history-by-date view. Records.buildEmail() is ready for a mailer;
 * Config.features.emailResults stays false until that exists.
 */
(function () {
  var quiz = null;
  var speakToken = 0;

  function cleanName(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 24);
  }

  function praise() {
    var list = window.Imla.Config.praise;
    return list[Math.floor(Math.random() * list.length)];
  }

  function playWord() {
    var word = window.Imla.Quiz.current(quiz);
    var token = ++speakToken;
    window.Imla.UI.setSpeaking(true);
    window.Imla.UI.setSpeechHint("أستمع إلى الكلمة...");
    window.Imla.Speech.speak(word.text).then(function (result) {
      if (token !== speakToken) return;
      window.Imla.UI.setSpeaking(false);
      if (!result.ok && result.reason !== "interrupted" && result.reason !== "canceled") {
        window.Imla.UI.setSpeechHint("لم أستطع نطق الكلمة. اضغط «استمع للكلمة» مرة أخرى.");
      }
    });
  }

  function startQuiz(name) {
    window.Imla.Audio.unlock();
    window.Imla.Speech.cancel();
    quiz = window.Imla.Quiz.create(name);
    window.Imla.UI.clearConfetti();
    window.Imla.UI.showScreen("quiz");
    window.Imla.UI.renderQuestion(quiz);
    playWord();
  }

  function onWelcomeSubmit(event) {
    event.preventDefault();
    var name = cleanName(window.Imla.UI.nameInput().value);
    if (!name) {
      window.Imla.UI.showNameError(true);
      return;
    }
    window.Imla.UI.showNameError(false);
    window.Imla.UI.nameInput().value = name;
    startQuiz(name);
  }

  function onAnswerSubmit(event) {
    event.preventDefault();
    if (!quiz || quiz.answered) return;
    window.Imla.Audio.unlock();
    var result = window.Imla.Quiz.answer(quiz, window.Imla.UI.answerInput().value);
    if (!result) return;

    var message = result.correct ? praise() : window.Imla.Config.retryMessage;
    window.Imla.UI.showFeedback(quiz, result, message);
    if (result.correct) window.Imla.Audio.playCorrect();
    else window.Imla.Audio.playRetry();
    window.Imla.Speech.speak(message);
  }

  function onNext() {
    if (!quiz || !quiz.answered) return;
    window.Imla.Audio.unlock();
    if (window.Imla.Quiz.isLast(quiz)) {
      finishQuiz();
      return;
    }
    window.Imla.Quiz.advance(quiz);
    window.Imla.UI.renderQuestion(quiz);
    playWord();
  }

  function finishQuiz() {
    var session = window.Imla.Quiz.toSession(quiz);
    window.Imla.Records.save(session);
    window.Imla.UI.showSummary(session);
    window.Imla.Audio.playCelebrate();
    var line = "مبروك يا " + session.studentName + ". أنهيت الإملاء. نتيجتك " +
      session.score + " من " + session.total + ".";
    window.setTimeout(function () {
      window.Imla.Speech.speak(line);
    }, 700);
  }

  function onReplay() {
    if (!quiz) return;
    startQuiz(quiz.studentName);
  }

  function onNewStudent() {
    window.Imla.Speech.cancel();
    speakToken += 1;
    window.Imla.UI.setSpeaking(false);
    quiz = null;
    window.Imla.UI.showScreen("welcome");
    window.Imla.UI.nameInput().focus();
    window.Imla.UI.nameInput().select();
  }

  document.getElementById("welcome-form").addEventListener("submit", onWelcomeSubmit);
  document.getElementById("answer-form").addEventListener("submit", onAnswerSubmit);
  document.getElementById("listen-btn").addEventListener("click", function () {
    if (!quiz) return;
    window.Imla.Audio.unlock();
    playWord();
  });
  document.getElementById("repeat-btn").addEventListener("click", function () {
    if (!quiz) return;
    window.Imla.Audio.unlock();
    playWord();
  });
  document.getElementById("next-btn").addEventListener("click", onNext);
  document.getElementById("replay-btn").addEventListener("click", onReplay);
  document.getElementById("new-student-btn").addEventListener("click", onNewStudent);

  document.getElementById("student-name").addEventListener("input", function () {
    window.Imla.UI.showNameError(false);
  });

  window.Imla.UI.showScreen("welcome");
})();
