document.addEventListener('DOMContentLoaded', function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobileNav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const opened = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;
  let heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === heroIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  }

  function startHero() {
    if (heroTimer || slides.length < 2) {
      return;
    }
    heroTimer = window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const index = Number(dot.getAttribute('data-hero-dot') || 0);
      showHero(index);
      if (heroTimer) {
        window.clearInterval(heroTimer);
        heroTimer = null;
      }
      startHero();
    });
  });

  startHero();

  const searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    const params = new URLSearchParams(window.location.search);
    const keywordInput = document.getElementById('searchKeyword');
    const categoryFilter = document.getElementById('categoryFilter');
    const typeFilter = document.getElementById('typeFilter');
    const yearFilter = document.getElementById('yearFilter');
    const countBox = document.getElementById('searchCount');
    const cards = Array.from(document.querySelectorAll('#searchResults .movie-card'));
    const initialKeyword = params.get('q') || '';

    if (keywordInput) {
      keywordInput.value = initialKeyword;
    }

    function filterCards() {
      const keyword = (keywordInput ? keywordInput.value : '').trim().toLowerCase();
      const category = categoryFilter ? categoryFilter.value : '';
      const type = typeFilter ? typeFilter.value : '';
      const year = yearFilter ? yearFilter.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.innerText
        ].join(' ').toLowerCase();
        const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchCategory = !category || card.getAttribute('data-category') === category;
        const matchType = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1;
        const matchYear = !year || card.getAttribute('data-year') === year;
        const matched = matchKeyword && matchCategory && matchType && matchYear;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (countBox) {
        const hasFilter = Boolean(keyword || category || type || year);
        countBox.textContent = visible ? (hasFilter ? '已匹配 ' + visible + ' 部作品' : '当前显示完整片库') : '没有匹配结果';
      }
    }

    [keywordInput, categoryFilter, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  }
});
