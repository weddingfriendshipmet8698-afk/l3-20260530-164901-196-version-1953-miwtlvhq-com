function bindPlayer(shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play-layer]');
  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var started = false;
  var hls = null;
  var Hls = window.Hls;

  function prepare() {
    if (started || !source) {
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    prepare();
    if (button) {
      button.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });
  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.classList.remove('is-hidden');
    }
  });
  video.addEventListener('error', function () {
    if (hls) {
      hls.destroy();
      hls = null;
      started = false;
    }
  });
}

document.querySelectorAll('[data-player-shell]').forEach(bindPlayer);
