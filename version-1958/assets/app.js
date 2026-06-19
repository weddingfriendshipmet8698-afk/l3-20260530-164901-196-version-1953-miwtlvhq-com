
(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      var icon = menuButton.querySelector('.menu-icon');
      if (icon) {
        icon.textContent = mobilePanel.classList.contains('is-open') ? '×' : '☰';
      }
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;
    var show = function (target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    var start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    };
    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    show(0);
    start();
  }

  var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
  if (lists.length) {
    var input = document.querySelector('.js-filter-input');
    var category = document.querySelector('.js-filter-category');
    var type = document.querySelector('.js-filter-type');
    var year = document.querySelector('.js-filter-year');
    var empty = document.querySelector('[data-empty-message]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }
    var apply = function () {
      var text = input ? input.value.trim().toLowerCase() : '';
      var cat = category ? category.value : '';
      var typ = type ? type.value : '';
      var yr = year ? year.value : '';
      var visible = 0;
      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search-card]'));
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-category') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var matched = true;
          if (text && haystack.indexOf(text) === -1) {
            matched = false;
          }
          if (cat && card.getAttribute('data-category') !== cat) {
            matched = false;
          }
          if (typ && card.getAttribute('data-type') !== typ) {
            matched = false;
          }
          if (yr && card.getAttribute('data-year') !== yr) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    [input, category, type, year].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
    apply();
  }

  var player = document.querySelector('.movie-player');
  if (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');
    var hls = null;
    var ready = false;
    var bind = function () {
      if (!video || !stream || ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };
    var play = function () {
      bind();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    };
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    video.addEventListener('error', function () {
      if (hls && hls.recoverMediaError) {
        hls.recoverMediaError();
      }
    });
  }
})();
