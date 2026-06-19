(function () {
  var navButton = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;

    var show = function (target) {
      if (!slides.length) return;
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    if (prev) prev.addEventListener('click', function () { show(index - 1); });
    if (next) next.addEventListener('click', function () { show(index + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); });
    });
    window.setInterval(function () { show(index + 1); }, 5000);
  }

  var localInput = document.querySelector('.local-filter');
  var yearSelect = document.querySelector('.year-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.category-movie-grid .movie-card'));
  var filterCards = function () {
    var term = localInput ? localInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    cards.forEach(function (card) {
      var haystack = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.category, card.dataset.year].join(' ').toLowerCase();
      var okTerm = !term || haystack.indexOf(term) !== -1;
      var okYear = !year || card.dataset.year === year;
      card.classList.toggle('is-hidden-by-filter', !(okTerm && okYear));
    });
  };
  if (localInput) localInput.addEventListener('input', filterCards);
  if (yearSelect) yearSelect.addEventListener('change', filterCards);

  var searchInput = document.querySelector('.global-search');
  var panel = document.querySelector('.search-panel');
  var data = window.SEARCH_DATA || [];
  var renderHits = function (items) {
    if (!panel) return;
    if (!items.length) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }
    panel.innerHTML = items.slice(0, 8).map(function (item) {
      return '<a class="search-hit" href="./' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '"><span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.category) + '</span></span></a>';
    }).join('');
    panel.hidden = false;
  };
  var escapeHtml = function (value) {
    return String(value).replace(/[&<>"]/g, function (c) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c];
    });
  };
  if (searchInput && panel) {
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim().toLowerCase();
      if (!q) {
        renderHits([]);
        return;
      }
      var hits = data.filter(function (item) {
        return (item.title + ' ' + item.year + ' ' + item.category + ' ' + item.genre).toLowerCase().indexOf(q) !== -1;
      });
      renderHits(hits);
    });
    document.addEventListener('click', function (event) {
      if (!panel.contains(event.target) && event.target !== searchInput) {
        panel.hidden = true;
      }
    });
  }
})();
