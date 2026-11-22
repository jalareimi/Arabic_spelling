/*
 * Finished quizzes saved on this browser.
 *
 * Later screens can use:
 *   Records.groupByDate()  -> history grouped by YYYY-MM-DD
 *   Records.buildEmail()   -> subject + body, ready for a mailer
 * Nothing here sends email or asks for a password.
 */
(function () {
  var key = window.Imla.Config.storageKey;

  function readAll() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function save(session) {
    try {
      var all = readAll();
      all.push(session);
      window.localStorage.setItem(key, JSON.stringify(all.slice(-200)));
      return true;
    } catch (error) {
      return false;
    }
  }

  function groupByDate(sessions) {
    var source = sessions || readAll();
    var groups = {};
    source.forEach(function (session) {
      var day = String(session.finishedAt || "").slice(0, 10) || "unknown";
      if (!groups[day]) groups[day] = [];
      groups[day].push(session);
    });
    return groups;
  }

  function buildEmail(session) {
    var lines = [
      "الطالب: " + session.studentName,
      "النتيجة: " + session.score + " / " + session.total,
      "التاريخ: " + session.finishedAt,
      "j.alareimi@gmail.com"
    ];
    session.results.forEach(function (item) {
      var mark = item.correct ? "صحيح" : "غير صحيح";
      lines.push(item.expected + " — كتب: " + (item.typed || "—") + " — " + mark);
    });
    return {
      subject: "نتيجة الإملاء — " + session.studentName,
      body: lines.join("\n")
    };
  }

  window.Imla.Records = {
    save: save,
    readAll: readAll,
    groupByDate: groupByDate,
    buildEmail: buildEmail
  };
})();
