(function () {
  var mobileToggle = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var backTop = document.querySelector("[data-back-top]");

  if (backTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 480) {
        backTop.classList.add("is-visible");
      } else {
        backTop.classList.remove("is-visible");
      }
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      play();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    play();
  }

  function openSearchPanel(box, results) {
    var panel = box.querySelector("[data-search-panel]");

    if (!panel) {
      return;
    }

    panel.innerHTML = "";

    if (!results.length) {
      var empty = document.createElement("div");
      empty.className = "search-empty";
      empty.textContent = "没有匹配影片";
      panel.appendChild(empty);
      panel.classList.add("is-open");
      return;
    }

    results.slice(0, 10).forEach(function (item) {
      var link = document.createElement("a");
      link.className = "search-result";
      link.href = item.url;

      var image = document.createElement("img");
      image.src = item.cover;
      image.alt = item.title;
      image.loading = "lazy";

      var text = document.createElement("div");
      var title = document.createElement("strong");
      title.textContent = item.title;
      var meta = document.createElement("span");
      meta.textContent = item.meta;
      var line = document.createElement("span");
      line.textContent = item.text;

      text.appendChild(title);
      text.appendChild(meta);
      text.appendChild(line);
      link.appendChild(image);
      link.appendChild(text);
      panel.appendChild(link);
    });

    panel.classList.add("is-open");
  }

  function closeSearchPanel(box) {
    var panel = box.querySelector("[data-search-panel]");

    if (panel) {
      panel.classList.remove("is-open");
    }
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-search-box]")).forEach(function (box) {
    var input = box.querySelector("input");
    var index = window.MOVIE_SEARCH_INDEX || [];

    if (!input) {
      return;
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();

      if (!query) {
        closeSearchPanel(box);
        return;
      }

      var results = index.filter(function (item) {
        return item.searchText.indexOf(query) !== -1;
      });

      openSearchPanel(box, results);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") {
        return;
      }

      var query = input.value.trim().toLowerCase();
      var first = index.find(function (item) {
        return item.searchText.indexOf(query) !== -1;
      });

      if (first) {
        window.location.href = first.url;
      }
    });

    document.addEventListener("click", function (event) {
      if (!box.contains(event.target)) {
        closeSearchPanel(box);
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]")).forEach(function (filterPanel) {
    var input = filterPanel.querySelector("[data-card-search]");
    var buttons = Array.prototype.slice.call(filterPanel.querySelectorAll("[data-filter-button]"));
    var activeFilter = "all";
    var container = filterPanel.parentElement;
    var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";

      cards.forEach(function (card) {
        var values = (card.getAttribute("data-filter-values") || "").toLowerCase();
        var matchedText = !query || values.indexOf(query) !== -1;
        var matchedButton = activeFilter === "all" || values.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden", !(matchedText && matchedButton));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter-button") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });
  });
})();
