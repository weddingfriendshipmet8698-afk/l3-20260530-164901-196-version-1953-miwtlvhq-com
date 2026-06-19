import { H as Hls } from './hls-vendor-dru42stk.js';

function initializePlayer(wrapper) {
  var video = wrapper.querySelector('video');
  var button = wrapper.querySelector('[data-play-button]');
  if (!video || !button) {
    return;
  }

  var source = video.getAttribute('data-src');
  var started = false;
  var hls = null;

  function start() {
    if (!source) {
      return;
    }
    if (!started) {
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    wrapper.classList.add('is-playing');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        wrapper.classList.remove('is-playing');
      });
    }
  }

  button.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function () {
    wrapper.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      wrapper.classList.remove('is-playing');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('[data-player]').forEach(initializePlayer);
