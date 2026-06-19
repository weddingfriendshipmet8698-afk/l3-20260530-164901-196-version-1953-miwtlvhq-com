(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return (text || '').toString().toLowerCase().trim();
  }

  function initMenu() {
    var toggle = qs('.menu-toggle');
    var menu = qs('.mobile-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var shell = qs('[data-hero]');
    if (!shell) {
      return;
    }
    var slides = qsa('.hero-slide', shell);
    var dots = qsa('[data-hero-dot]', shell);
    var prev = qs('[data-hero-prev]', shell);
    var next = qs('[data-hero-next]', shell);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    shell.addEventListener('mouseenter', stop);
    shell.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-live-search]', scope);
      var buttons = qsa('[data-filter-value]', scope);
      var container = scope.nextElementSibling || document;
      var cards = qsa('[data-title]', container);
      var active = 'all';

      function apply() {
        var query = normalize(input ? input.value : '');
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-category'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesFilter = active === 'all' || haystack.indexOf(normalize(active)) !== -1;
          card.classList.toggle('is-hidden-by-filter', !(matchesQuery && matchesFilter));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          active = button.getAttribute('data-filter-value') || 'all';
          buttons.forEach(function (btn) {
            btn.classList.toggle('is-active', btn === button);
          });
          apply();
        });
      });

      apply();
    });
  }

  function initPlayerBox(box) {
    var video = qs('video', box);
    var overlay = qs('.player-overlay', box);
    var src = box.getAttribute('data-video-src');
    var ready = false;
    var hlsInstance = null;

    if (!video || !src) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initPlayers() {
    qsa('.player-box[data-video-src]').forEach(initPlayerBox);
    qsa('[data-play-current]').forEach(function (button) {
      button.addEventListener('click', function () {
        var box = qs('.player-box[data-video-src]');
        var overlay = box ? qs('.player-overlay', box) : null;
        if (overlay) {
          overlay.click();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
