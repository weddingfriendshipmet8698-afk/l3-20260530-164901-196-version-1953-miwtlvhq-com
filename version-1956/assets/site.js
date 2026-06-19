(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function setupInlineFilter() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
      var input = form.querySelector('[data-filter-input]');
      var list = document.querySelector('[data-filter-list]');
      if (!input || !list) {
        return;
      }

      function runFilter() {
        var query = normalize(input.value);
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' '));
          card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
        });
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        runFilter();
      });
      input.addEventListener('input', runFilter);
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-card>',
      '<a class="movie-cover" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-badge">▶</span>',
      '</a>',
      '<div class="movie-info">',
      '<div class="movie-meta-line">',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.type) + '</span>',
      '</div>',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine || movie.summary || '') + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSiteSearch() {
    var form = document.querySelector('[data-site-search-form]');
    var input = document.querySelector('[data-site-search-input]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var data = window.MovieSearchIndex || [];
    if (!form || !input || !results || !data.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function search() {
      var query = normalize(input.value);
      if (!query) {
        results.innerHTML = data.slice(0, 24).map(createSearchCard).join('');
        if (title) {
          title.textContent = '精选推荐';
        }
        return;
      }
      var words = query.split(/\s+/).filter(Boolean);
      var matches = data.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.summary,
          movie.oneLine
        ].join(' '));
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 60);

      if (title) {
        title.textContent = matches.length ? '匹配内容' : '暂无匹配内容';
      }
      results.innerHTML = matches.length ? matches.map(createSearchCard).join('') : '<div class="empty-state">换一个关键词试试</div>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      search();
    });
    input.addEventListener('input', search);
    search();
  }

  window.initMoviePlayer = function (video, streamUrl) {
    if (!video || !streamUrl) {
      return;
    }
    if (video.getAttribute('data-loaded-url') === streamUrl) {
      var existingPlay = video.play();
      if (existingPlay && typeof existingPlay.catch === 'function') {
        existingPlay.catch(function () {});
      }
      return;
    }
    video.setAttribute('data-loaded-url', streamUrl);
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      if (video.hlsPlayer) {
        video.hlsPlayer.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
    } else {
      video.src = streamUrl;
    }
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {});
    }
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupInlineFilter();
    setupSiteSearch();
  });
}());
