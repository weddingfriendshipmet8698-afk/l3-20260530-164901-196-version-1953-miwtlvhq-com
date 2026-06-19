(function () {
  function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var button = document.querySelector(config.triggerSelector);
    var frame = video ? video.closest(".player-frame") : null;
    var message = frame ? frame.querySelector("[data-player-message]") : null;
    var loaded = false;
    var hls = null;

    if (!video || !config.source) {
      return;
    }

    function showMessage(text) {
      if (!message) {
        return;
      }

      message.textContent = text;
      message.classList.add("is-visible");
      window.setTimeout(function () {
        message.classList.remove("is-visible");
      }, 2600);
    }

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
      video.controls = true;
    }

    function attach() {
      if (loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(config.source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
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

          showMessage("暂时无法播放，请稍后重试");
        });

        loaded = true;
        return;
      }

      showMessage("暂时无法播放，请稍后重试");
    }

    function play() {
      attach();
      hideButton();

      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          showMessage("点击播放按钮开始观看");
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", hideButton);

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
