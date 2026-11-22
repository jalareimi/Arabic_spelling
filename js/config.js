/*
 * Shared settings.
 * Feature flags stay off until a teacher screen is added:
 *   wordManager    password-protected add/remove of words
 *   historyByDate  a screen over Records.groupByDate()
 *   emailResults   send Records.buildEmail() from a mailer
 */
(function () {
  window.Imla = window.Imla || {};

  window.Imla.Config = {
    speechLang: "ar-SA",
    speechLangFallback: "ar",
    speechRate: 0.82,
    storageKey: "imla.sessions.v1",
    praise: ["ممتاز!", "جيد جداً!", "أحسنت!", "رائع!"],
    retryMessage: "حاول مرة أخرى",
    /* Keep ة and ه different so the quiz still teaches that spelling. */
    lenientTaaMarbuta: false,
    /* Keep ى and ي different for the same reason. */
    lenientAlefMaksura: false,
    features: {
      wordManager: false,
      historyByDate: false,
      emailResults: false,
    },
  };
})();
