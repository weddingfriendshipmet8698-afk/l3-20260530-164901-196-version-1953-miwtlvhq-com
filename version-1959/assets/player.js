(function () {
  function initializePlayer(video) {
    var source = video.getAttribute('data-src');
    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        hls.destroy();
      });
      video._hls = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    video.insertAdjacentHTML(
      'afterend',
      '<p class="player-message">当前浏览器不支持 HLS 播放，请使用最新版 Chrome、Edge 或 Safari。</p>'
    );
  }

  function setupStartButton(button) {
    var targetId = button.getAttribute('data-target');
    var video = targetId ? document.getElementById(targetId) : null;
    if (!video) {
      return;
    }

    function hideButton() {
      button.classList.add('is-hidden');
    }

    button.addEventListener('click', function () {
      hideButton();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    });

    video.addEventListener('play', hideButton);
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.js-hls-player'), initializePlayer);
    Array.prototype.forEach.call(document.querySelectorAll('.js-player-start'), setupStartButton);
  });
})();
