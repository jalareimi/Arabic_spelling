/*
 * Spelling comparison for kids' keyboards.
 * Diacritics, tatweel, and alef-hamza shapes are ignored.
 * ة/ه and ى/ي stay different unless the matching config flag is turned on.
 */
(function () {
  var config = window.Imla.Config;

  function normalize(value) {
    var text = String(value || "")
      .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/[^\u0621-\u063A\u0641-\u064A]/g, "");

    if (config.lenientTaaMarbuta) {
      text = text.replace(/ة/g, "ه");
    }
    if (config.lenientAlefMaksura) {
      text = text.replace(/ى/g, "ي");
    }
    return text;
  }

  window.Imla.Normalize = {
    text: normalize,
    equals: function (typed, expected) {
      var answer = normalize(typed);
      if (!answer) return false;
      return answer === normalize(expected);
    }
  };
})();
