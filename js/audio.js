/*
 * Short tones made with the Web Audio API, so the app needs no sound files.
 * Call unlock() from a click before the first note.
 */
(function () {
  var audioCtx = null;

  function context() {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(ctx, freq, start, duration, type, volume) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function play(notes) {
    var ctx = context();
    if (!ctx) return;
    notes.forEach(function (note) {
      tone(ctx, note.freq, ctx.currentTime + note.at, note.dur, note.type, note.volume);
    });
  }

  window.Imla.Audio = {
    unlock: function () { context(); },
    playCorrect: function () {
      play([
        { freq: 523, at: 0, dur: 0.16, type: "triangle", volume: 0.08 },
        { freq: 659, at: 0.12, dur: 0.16, type: "triangle", volume: 0.08 },
        { freq: 784, at: 0.24, dur: 0.28, type: "triangle", volume: 0.09 }
      ]);
    },
    playRetry: function () {
      play([
        { freq: 392, at: 0, dur: 0.16, type: "sine", volume: 0.05 },
        { freq: 330, at: 0.14, dur: 0.22, type: "sine", volume: 0.05 }
      ]);
    },
    playCelebrate: function () {
      play([
        { freq: 523, at: 0, dur: 0.18, type: "triangle", volume: 0.08 },
        { freq: 659, at: 0.16, dur: 0.18, type: "triangle", volume: 0.08 },
        { freq: 784, at: 0.32, dur: 0.18, type: "triangle", volume: 0.08 },
        { freq: 1047, at: 0.48, dur: 0.36, type: "triangle", volume: 0.09 },
        { freq: 1319, at: 0.78, dur: 0.22, type: "sine", volume: 0.04 }
      ]);
    }
  };
})();
