/* midnight fm: three tiny loops made with the Web Audio API */

(function () {
  "use strict";

  var tracks = [
    {
      title: "plastic moon",
      subtitle: "original loop 001 / browser synth",
      bpm: 82,
      duration: 32,
      root: 130.81,
      notes: [261.63, 329.63, 392.0, 493.88, 392.0, 329.63, 293.66, 392.0,
              440.0, 523.25, 392.0, 329.63, 293.66, 261.63, 220.0, 329.63]
    },
    {
      title: "memory card lullaby",
      subtitle: "original loop 002 / browser synth",
      bpm: 72,
      duration: 32,
      root: 110.0,
      notes: [220.0, 261.63, 329.63, 392.0, 329.63, 261.63, 246.94, 293.66,
              369.99, 440.0, 369.99, 293.66, 220.0, 261.63, 329.63, 261.63]
    },
    {
      title: "dial-up daydream",
      subtitle: "original loop 003 / browser synth",
      bpm: 94,
      duration: 32,
      root: 146.83,
      notes: [293.66, 369.99, 440.0, 587.33, 440.0, 369.99, 329.63, 415.3,
              493.88, 659.25, 493.88, 415.3, 293.66, 349.23, 440.0, 349.23]
    }
  ];

  var playButton = document.getElementById("play-toggle");
  if (!playButton) return;

  var discWrap = document.getElementById("disc-wrap");
  var discNumber = document.getElementById("disc-number");
  var label = document.getElementById("player-label");
  var title = document.getElementById("track-title");
  var subtitle = document.getElementById("track-subtitle");
  var playIcon = document.getElementById("play-icon");
  var previousButton = document.getElementById("previous-track");
  var nextButton = document.getElementById("next-track");
  var timeReadout = document.getElementById("time-readout");
  var seek = document.getElementById("seek");
  var muteButton = document.getElementById("mute-toggle");
  var volumeIcon = document.getElementById("volume-icon");
  var volumeSlider = document.getElementById("volume");
  var volumeReadout = document.getElementById("volume-readout");
  var errorLabel = document.getElementById("player-error");
  var trackButtons = Array.prototype.slice.call(
    document.querySelectorAll(".track-list button[data-track]")
  );

  var trackIndex = 0;
  var isPlaying = false;
  var position = 0;
  var volume = readVolume();
  var context = null;
  var gain = null;
  var source = null;
  var anchor = 0;
  var ticker = 0;
  var buffers = {};

  function readVolume() {
    try {
      var saved = localStorage.getItem("secret-room-volume");
      if (saved === null) return 0.55;
      var parsed = Number(saved);
      return parsed >= 0 && parsed <= 1 ? parsed : 0.55;
    } catch (error) {
      return 0.55;
    }
  }

  function storeVolume() {
    try {
      localStorage.setItem("secret-room-volume", String(volume));
    } catch (error) {
      /* the volume still works for this visit */
    }
  }

  function formatTime(value) {
    if (!isFinite(value)) return "0:00";
    var minutes = Math.floor(value / 60);
    var seconds = Math.floor(value % 60);
    return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
  }

  function makeLoop(track) {
    var sampleRate = context.sampleRate;
    var size = Math.floor(sampleRate * track.duration);
    var buffer = context.createBuffer(1, size, sampleRate);
    var channel = buffer.getChannelData(0);
    var stepLength = 60 / track.bpm / 2;

    for (var i = 0; i < size; i += 1) {
      var time = i / sampleRate;
      var step = Math.floor(time / stepLength);
      var phase = (time - step * stepLength) / stepLength;
      var frequency = track.notes[step % track.notes.length];
      var envelope = Math.exp(-phase * 5.4) * (1 - Math.exp(-phase * 90));
      var vibrato = 1 + Math.sin(time * Math.PI * 8) * 0.0015;
      var bell =
        Math.sin(Math.PI * 2 * frequency * vibrato * time) * 0.13 +
        Math.sin(Math.PI * 4 * frequency * time) * 0.022;
      var pad =
        Math.sin(Math.PI * 2 * track.root * time) * 0.022 +
        Math.sin(Math.PI * 3 * track.root * time) * 0.014;
      var fade = Math.max(
        0,
        Math.min(1, time / 0.05, (track.duration - time) / 0.05)
      );
      channel[i] = (bell * envelope + pad) * fade;
    }

    return buffer;
  }

  function stopSource() {
    window.clearInterval(ticker);
    if (source) {
      try {
        source.stop();
      } catch (error) {
        /* it may already be stopped */
      }
      source.disconnect();
      source = null;
    }
  }

  function startSource() {
    stopSource();

    var track = tracks[trackIndex];
    source = context.createBufferSource();
    source.buffer = buffers[trackIndex];
    source.loop = true;
    source.connect(gain);
    source.start(0, position % track.duration);

    anchor = context.currentTime - position;
    ticker = window.setInterval(function () {
      position = (context.currentTime - anchor) % track.duration;
      renderTime();
    }, 100);
  }

  function play() {
    if (!context) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        showError("audio does not work in this browser");
        return;
      }
      context = new AudioContextClass();
      gain = context.createGain();
      gain.gain.value = volume;
      gain.connect(context.destination);
    }

    if (typeof context.resume === "function") context.resume();

    if (!buffers[trackIndex]) buffers[trackIndex] = makeLoop(tracks[trackIndex]);

    try {
      startSource();
      isPlaying = true;
      showError("");
      render();
    } catch (error) {
      showError("audio could not start in this browser");
      isPlaying = false;
      render();
    }
  }

  function pause() {
    stopSource();
    isPlaying = false;
    render();
  }

  function showError(message) {
    if (!errorLabel) return;
    errorLabel.textContent = message;
    errorLabel.hidden = !message;
  }

  function renderTime() {
    var track = tracks[trackIndex];
    if (timeReadout) {
      timeReadout.textContent =
        formatTime(position) + " / " + formatTime(track.duration);
    }
    if (seek) seek.value = String(Math.min(position, track.duration));
  }

  function render() {
    var track = tracks[trackIndex];

    if (title) title.textContent = track.title;
    if (subtitle) subtitle.textContent = track.subtitle;
    if (discNumber) discNumber.textContent = "0" + (trackIndex + 1);
    if (label) label.textContent = "now " + (isPlaying ? "playing" : "paused");
    if (playIcon) playIcon.textContent = isPlaying ? "❚❚" : "▶";
    playButton.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
    if (discWrap) discWrap.classList.toggle("playing", isPlaying);
    if (seek) seek.max = String(track.duration);

    trackButtons.forEach(function (button, index) {
      var current = index === trackIndex;
      button.classList.toggle("current", current);
      button.setAttribute("aria-pressed", String(current));
    });

    renderTime();
    renderVolume();
  }

  function renderVolume() {
    if (volumeSlider) volumeSlider.value = String(volume);
    if (volumeReadout) volumeReadout.textContent = Math.round(volume * 100) + "%";
    if (volumeIcon) volumeIcon.textContent = volume > 0 ? "♪" : "✕";
    if (muteButton) {
      muteButton.setAttribute("aria-label", volume > 0 ? "Mute music" : "Unmute music");
    }
  }

  function setVolume(next) {
    volume = Math.max(0, Math.min(1, next));
    storeVolume();
    if (gain && context) {
      gain.gain.setTargetAtTime(volume, context.currentTime, 0.02);
    }
    renderVolume();
  }

  function selectTrack(index) {
    var next = (index + tracks.length) % tracks.length;
    var wasPlaying = isPlaying;
    position = 0;
    trackIndex = next;
    if (wasPlaying) {
      if (buffers[trackIndex] === undefined) buffers[trackIndex] = makeLoop(tracks[trackIndex]);
      startSource();
    }
    render();
  }

  playButton.addEventListener("click", function () {
    if (isPlaying) pause();
    else play();
  });

  if (previousButton) {
    previousButton.addEventListener("click", function () {
      selectTrack(trackIndex - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      selectTrack(trackIndex + 1);
    });
  }

  trackButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectTrack(Number(button.getAttribute("data-track")));
    });
  });

  if (seek) {
    seek.addEventListener("input", function () {
      position = Number(seek.value);
      if (isPlaying) startSource();
      renderTime();
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener("input", function () {
      setVolume(Number(volumeSlider.value));
    });
  }

  if (muteButton) {
    muteButton.addEventListener("click", function () {
      setVolume(volume > 0 ? 0 : 0.55);
    });
  }

  window.addEventListener("pagehide", function () {
    stopSource();
    if (context) context.close();
  });

  render();
})();
