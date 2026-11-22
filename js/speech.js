/*
 * Arabic speech via the Web Speech API.
 * Prefers ar-SA, then any ar-* voice installed on the device.
 */
(function () {
  var config = window.Imla.Config;
  var cachedVoice = null;

  function supports() {
    return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  }

  function chooseVoice() {
    if (!supports()) return null;
    var voices = window.speechSynthesis.getVoices();
    if (!voices.length) return cachedVoice;
    cachedVoice = null;
    for (var i = 0; i < voices.length; i += 1) {
      if (voices[i].lang === config.speechLang) {
        cachedVoice = voices[i];
        return cachedVoice;
      }
    }
    for (var j = 0; j < voices.length; j += 1) {
      var lang = (voices[j].lang || "").toLowerCase();
      if (lang.indexOf(config.speechLangFallback) === 0) {
        cachedVoice = voices[j];
        return cachedVoice;
      }
    }
    return null;
  }

  if (supports()) {
    chooseVoice();
    window.speechSynthesis.addEventListener("voiceschanged", chooseVoice);
  }

  function speak(text) {
    return new Promise(function (resolve) {
      if (!supports() || !text) {
        resolve({ ok: false, reason: "unsupported" });
        return;
      }

      var synth = window.speechSynthesis;
      var utterance = new SpeechSynthesisUtterance(text);
      var voice = chooseVoice();
      utterance.lang = voice ? voice.lang : config.speechLang;
      utterance.rate = config.speechRate;
      utterance.pitch = 1.05;
      if (voice) utterance.voice = voice;

      var settled = false;
      function finish(result) {
        if (settled) return;
        settled = true;
        resolve(result);
      }

      utterance.onend = function () { finish({ ok: true }); };
      utterance.onerror = function (event) {
        var reason = event && event.error ? event.error : "error";
        /* cancel() interrupts the previous phrase; that is not a failure of the new one. */
        if (reason === "interrupted" || reason === "canceled") {
          finish({ ok: false, reason: reason });
          return;
        }
        finish({ ok: false, reason: reason });
      };

      function start() {
        try {
          synth.resume();
          synth.speak(utterance);
        } catch (error) {
          finish({ ok: false, reason: "exception" });
        }
      }

      /*
       * Chrome drops a speak() that follows cancel() in the same turn.
       * Wait a beat only when something is already playing.
       */
      if (synth.speaking || synth.pending) {
        synth.cancel();
        window.setTimeout(start, 70);
      } else {
        start();
      }
    });
  }

  function cancel() {
    if (supports()) window.speechSynthesis.cancel();
  }

  window.Imla.Speech = {
    speak: speak,
    cancel: cancel,
    hasArabicVoice: function () { return Boolean(chooseVoice()); },
    supported: supports
  };
})();
