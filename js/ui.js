/*
 * DOM updates only. app.js decides when each screen appears.
 */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  function arabicDigits(value) {
    return String(value).replace(/[0-9]/g, function (digit) {
      return "٠١٢٣٤٥٦٧٨٩"[digit];
    });
  }

  function showScreen(name) {
    ["welcome", "quiz", "done"].forEach(function (screen) {
      var node = $("screen-" + screen);
      if (screen === name) node.hidden = false;
      else node.hidden = true;
    });
  }

  function setSpeaking(active) {
    $("listen-btn").classList.toggle("is-speaking", active);
    $("speech-status").textContent = active ? "أستمع إلى الكلمة..." : "";
  }

  function setSpeechHint(message) {
    $("speech-status").textContent = message || "";
  }

  function renderQuestion(state) {
    var word = window.Imla.Quiz.current(state);
    var total = state.words.length;
    $("quiz-name").textContent = state.studentName;
    $("quiz-progress").textContent = "الكلمة " + arabicDigits(state.index + 1) + " من " + arabicDigits(total);
    $("answer-input").value = "";
    $("answer-input").disabled = false;
    $("submit-btn").disabled = false;
    $("feedback").hidden = true;
    $("letter-hint").textContent = "عدد الحروف: " + arabicDigits(window.Imla.Normalize.text(word.text).length);
    renderDots(state);
    $("answer-input").focus();
  }

  function renderDots(state) {
    var wrap = $("progress-dots");
    wrap.replaceChildren();
    state.words.forEach(function (_word, index) {
      var dot = document.createElement("span");
      dot.className = "dot";
      if (index < state.results.length) {
        dot.classList.add(state.results[index].correct ? "is-ok" : "is-miss");
      } else if (index === state.index) {
        dot.classList.add("is-current");
      }
      wrap.appendChild(dot);
    });
  }

  function showFeedback(state, result, message) {
    var box = $("feedback");
    box.hidden = false;
    box.classList.toggle("is-correct", result.correct);
    box.classList.toggle("is-wrong", !result.correct);
    $("feedback-emoji").textContent = result.correct ? result.emoji : "💪";
    $("feedback-message").textContent = message;

    var detail = $("feedback-detail");
    detail.replaceChildren();
    if (result.correct) {
      detail.textContent = "كتبت الكلمة الصحيحة: " + result.expected;
    } else {
      var correctLine = document.createElement("span");
      correctLine.textContent = "الكلمة الصحيحة: ";
      var strong = document.createElement("strong");
      strong.textContent = result.expected + " " + result.emoji;
      var typedLine = document.createElement("span");
      typedLine.className = "wrote";
      typedLine.textContent = result.typed
        ? "كتبت: " + result.typed
        : "لم تكتب إجابة.";
      detail.append(correctLine, strong, typedLine);
    }

    $("answer-input").disabled = true;
    $("submit-btn").disabled = true;
    $("next-btn").textContent = window.Imla.Quiz.isLast(state) ? "النتيجة" : "الكلمة التالية";
    renderDots(state);
    $("next-btn").focus();
  }

  function cheerFor(score, total) {
    var ratio = total ? score / total : 0;
    if (score === total) return "كل الكلمات صحيحة. أنت بطل الإملاء!";
    if (ratio >= 0.7) return "عمل رائع! كلمات كثيرة كانت صحيحة.";
    if (ratio >= 0.4) return "جيد! كل محاولة تجعلك أقوى.";
    return "محاولة جميلة. هيا نلعب مرة أخرى.";
  }

  function clearConfetti() {
    $("confetti").replaceChildren();
  }

  function burst() {
    var layer = $("confetti");
    layer.replaceChildren();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var colors = ["#ff6b6b", "#ffd93d", "#3ddc97", "#4d96ff", "#b983ff"];
    for (var i = 0; i < 26; i += 1) {
      var piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = (Math.random() * 0.25) + "s";
      piece.style.animationDuration = (1.1 + Math.random() * 0.8) + "s";
      layer.appendChild(piece);
    }
  }

  function showSummary(session) {
    $("done-name").textContent = session.studentName;
    $("done-cheer").textContent = cheerFor(session.score, session.total);
    $("score-value").textContent = arabicDigits(session.score);
    $("score-total").textContent = arabicDigits(session.total);

    var list = $("summary");
    list.replaceChildren();
    session.results.forEach(function (item) {
      var row = document.createElement("article");
      row.className = "result " + (item.correct ? "is-correct" : "is-wrong");

      var emoji = document.createElement("span");
      emoji.className = "result-emoji";
      emoji.textContent = item.emoji;

      var text = document.createElement("div");
      var expected = document.createElement("p");
      expected.textContent = item.expected;
      var typed = document.createElement("p");
      typed.className = "result-typed";
      typed.textContent = "كتبت: " + (item.typed || "—");
      text.append(expected, typed);

      var badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = item.correct ? "صحيح" : "غير صحيح";

      row.append(emoji, text, badge);
      list.appendChild(row);
    });

    showScreen("done");
    burst();
  }

  function showNameError(show) {
    $("name-field").classList.toggle("is-invalid", show);
    $("name-error").hidden = !show;
    if (show) $("student-name").focus();
  }

  window.Imla.UI = {
    showScreen: showScreen,
    renderQuestion: renderQuestion,
    showFeedback: showFeedback,
    showSummary: showSummary,
    setSpeaking: setSpeaking,
    setSpeechHint: setSpeechHint,
    showNameError: showNameError,
    clearConfetti: clearConfetti,
    arabicDigits: arabicDigits,
    nameInput: function () { return $("student-name"); },
    answerInput: function () { return $("answer-input"); }
  };
})();
