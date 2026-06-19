(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var wrap = qs('[data-hero]');
        if (!wrap) {
            return;
        }
        var slides = qsa('.hero-slide', wrap);
        var dots = qsa('[data-hero-dot]', wrap);
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
    }

    function normalize(text) {
        return (text || '').toString().toLowerCase().trim();
    }

    function initFilters() {
        var grid = qs('.filter-grid');
        if (!grid) {
            return;
        }
        var input = qs('[data-filter-input]');
        var year = qs('[data-filter-year]');
        var type = qs('[data-filter-type]');
        var cards = qsa('.movie-card', grid);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }
        function apply() {
            var term = normalize(input ? input.value : '');
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.type,
                    card.dataset.year,
                    card.textContent
                ].join(' '));
                var okTerm = !term || haystack.indexOf(term) !== -1;
                var okYear = !yearValue || card.dataset.year === yearValue;
                var okType = !typeValue || card.dataset.type === typeValue;
                card.classList.toggle('is-filtered-out', !(okTerm && okYear && okType));
            });
        }
        [input, year, type].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });
        apply();
    }

    function initPlayer() {
        var video = qs('[data-player]');
        var start = qs('[data-start]');
        if (!video || !start) {
            return;
        }
        var source = start.getAttribute('data-video');
        var hlsInstance = null;
        function attach() {
            if (video.dataset.ready === '1') {
                return Promise.resolve();
            }
            video.dataset.ready = '1';
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                    window.setTimeout(resolve, 1300);
                });
            }
            video.src = source;
            return Promise.resolve();
        }
        function play() {
            start.classList.add('is-hidden');
            attach().then(function () {
                var run = video.play();
                if (run && typeof run.catch === 'function') {
                    run.catch(function () {});
                }
            });
        }
        start.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
