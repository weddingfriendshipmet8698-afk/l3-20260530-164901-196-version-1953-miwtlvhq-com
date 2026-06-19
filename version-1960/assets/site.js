(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  var nextButton = document.querySelector('.hero-next');
  var prevButton = document.querySelector('.hero-prev');
  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(current + 1);
    });
  }
  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(current - 1);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  var localFilter = document.querySelector('[data-local-filter]');
  if (localFilter) {
    localFilter.addEventListener('input', function () {
      var query = localFilter.value.trim().toLowerCase();
      document.querySelectorAll('.movie-card').forEach(function (card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
        card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
      });
    });
  }
})();
