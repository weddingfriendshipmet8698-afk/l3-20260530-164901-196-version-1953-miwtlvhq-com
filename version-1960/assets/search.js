(function () {
  var input = document.getElementById('searchInput');
  var result = document.getElementById('searchResults');
  var data = window.MOVIE_INDEX || [];
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function render(items) {
    if (!result) {
      return;
    }
    if (!items.length) {
      result.innerHTML = '<div class="empty-state">请输入剧名、地区、类型、年份或关键词。</div>';
      return;
    }
    result.innerHTML = items.slice(0, 120).map(function (item) {
      return '<article class="horizontal-card">'
        + '<a class="horizontal-cover" href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>'
        + '<div class="horizontal-body">'
        + '<a href="' + item.url + '"><h2>' + escapeHtml(item.title) + '</h2></a>'
        + '<p>' + escapeHtml(item.oneLine || '') + '</p>'
        + '<div class="meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + item.year + '年</span><span>' + escapeHtml(item.genre) + '</span></div>'
        + '<div class="tag-row">' + (item.tags || []).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>'
        + '</div>'
        + '</article>';
    }).join('');
  }

  function search(query) {
    var q = query.trim().toLowerCase();
    if (!q) {
      render(data.slice(0, 40));
      return;
    }
    render(data.filter(function (item) {
      var text = [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(' '), item.oneLine].join(' ').toLowerCase();
      return text.indexOf(q) !== -1;
    }));
  }

  if (input) {
    input.value = initial;
    input.addEventListener('input', function () {
      search(input.value);
    });
  }
  search(initial);
})();
