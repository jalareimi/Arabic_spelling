/*
 * Built-in word bank. The quiz never reads this list directly;
 * it calls WordBank.getQuizWords(), so a future teacher editor
 * can prepend saved words without touching the screens.
 *
 * Add a word by appending:
 *   { id: "unique-id", text: "كلمة", emoji: "⭐" }
 */
(function () {
  var builtIn = [
    { id: "qamar", text: "قمر", emoji: "🌙" },
    { id: "shams", text: "شمس", emoji: "☀️" },
    { id: "najma", text: "نجمة", emoji: "⭐" },
    { id: "shajara", text: "شجرة", emoji: "🌳" },
    { id: "warda", text: "وردة", emoji: "🌹" },
    { id: "tuffaha", text: "تفاحة", emoji: "🍎" },
    { id: "maa", text: "ماء", emoji: "💧" },
    { id: "kitab", text: "كتاب", emoji: "📚" },
    { id: "qalam", text: "قلم", emoji: "✏️" },
    { id: "madrasa", text: "مدرسة", emoji: "🏫" }
  ];

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    return copy;
  }

  /*
   * Reserved for a password-protected word manager.
   * When that exists, return teacher words saved on this device
   * only after a successful login. An empty list means "built-in only".
   */
  function loadTeacherWords() {
    return [];
  }

  window.Imla.WordBank = {
    builtIn: builtIn,
    getQuizWords: function () {
      return shuffle(builtIn.concat(loadTeacherWords()));
    }
  };
})();
