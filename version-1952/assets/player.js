(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (box) {
    var video = box.querySelector('.movie-video');
    var cover = box.querySelector('.player-cover');
    var playButton = box.querySelector('.player-play');
    var muteButton = box.querySelector('.player-mute');
    var fullButton = box.querySelector('.player-full');
    var errorBox = box.querySelector('.player-error');
    var hls = null;
    var loaded = false;

    var showError = function () {
      if (errorBox) errorBox.hidden = false;
    };

    var load = function () {
      if (!video || loaded) return;
      loaded = true;
      var src = video.dataset.stream;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({enableWorker: true, lowLatencyMode: true, backBufferLength: 90});
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showError();
          }
        });
      } else {
        showError();
      }
    };

    var start = function () {
      if (!video) return;
      load();
      if (cover) cover.classList.add('is-hidden');
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (cover) cover.classList.remove('is-hidden');
        });
      }
    };

    var toggle = function () {
      if (!video) return;
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    };

    if (cover) cover.addEventListener('click', start);
    if (playButton) playButton.addEventListener('click', toggle);
    if (video) {
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
        if (playButton) playButton.textContent = 'Ⅱ';
      });
      video.addEventListener('pause', function () {
        box.classList.remove('is-playing');
        if (playButton) playButton.textContent = '▶';
      });
      video.addEventListener('click', toggle);
    }
    if (muteButton && video) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '静' : '音';
      });
    }
    if (fullButton) {
      fullButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (box.requestFullscreen) {
          box.requestFullscreen();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls) hls.destroy();
    });
  });
})();
