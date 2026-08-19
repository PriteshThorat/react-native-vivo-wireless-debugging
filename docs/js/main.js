/* ========================================
   Main JS - Sidebar, Dark Mode, Copy
   ======================================== */

(function () {
  'use strict';

  // --- Theme Toggle ---
  function initTheme() {
    var saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon();
    rerenderMermaid();
  }

  function rerenderMermaid() {
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
        themeVariables: { fontSize: '15px' },
        flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' }
      });
      mermaid.run();
    }
  }

  function updateThemeIcon() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.querySelector('.theme-label').textContent = isDark ? 'Light mode' : 'Dark mode';
    btn.querySelector('.theme-icon-light').style.display = isDark ? 'none' : 'block';
    btn.querySelector('.theme-icon-dark').style.display = isDark ? 'block' : 'none';
  }

  // --- Mobile Sidebar ---
  function initMobileSidebar() {
    var btn = document.querySelector('.mobile-menu-btn');
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.querySelector('.sidebar-overlay');
    if (!btn || !sidebar || !overlay) return;

    btn.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
      document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    });

    overlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
      document.body.style.overflow = '';
    });
  }

  // --- Active Page ---
  function setActivePage() {
    var links = document.querySelectorAll('.nav-link');
    var current = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === current) {
        link.classList.add('active');
      }
    });
  }

  // --- Copy Code ---
  function initCopyButtons() {
    document.querySelectorAll('.code-block-copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var block = btn.closest('.code-block');
        var code = block.querySelector('code');
        var text = code.textContent;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            showCopied(btn);
          });
        } else {
          // Fallback
          var textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          showCopied(btn);
        }
      });
    });
  }

  function showCopied(btn) {
    var label = btn.querySelector('.copy-label');
    var original = label.textContent;
    label.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(function () {
      label.textContent = original;
      btn.classList.remove('copied');
    }, 1500);
  }

  // --- Search ---
  function initSearch() {
    var input = document.querySelector('.search-input');
    var results = document.querySelector('.search-results');
    if (!input || !results) return;

    var pages = window.__searchIndex || [];
    var debounceTimer;

    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        performSearch(input.value.trim(), results, pages);
      }, 200);
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) {
        performSearch(input.value.trim(), results, pages);
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-container')) {
        results.classList.remove('visible');
      }
    });
  }

  function performSearch(query, container, pages) {
    if (!query || query.length < 2) {
      container.classList.remove('visible');
      return;
    }

    var lower = query.toLowerCase();
    var matches = [];

    pages.forEach(function (page) {
      var titleMatch = page.title.toLowerCase().indexOf(lower) !== -1;
      var contentMatch = page.content.toLowerCase().indexOf(lower) !== -1;

      if (titleMatch || contentMatch) {
        var snippet = '';
        if (contentMatch) {
          var idx = page.content.toLowerCase().indexOf(lower);
          var start = Math.max(0, idx - 60);
          var end = Math.min(page.content.length, idx + lower.length + 60);
          snippet = (start > 0 ? '...' : '') +
            escapeHtml(page.content.substring(start, end)) +
            (end < page.content.length ? '...' : '');
          snippet = snippet.replace(
            new RegExp('(' + escapeRegex(escapeHtml(query)) + ')', 'gi'),
            '<mark>$1</mark>'
          );
        }

        matches.push({
          title: page.title,
          url: page.url,
          snippet: snippet || page.title,
          titleMatch: titleMatch
        });
      }
    });

    // Sort: title matches first
    matches.sort(function (a, b) {
      return b.titleMatch - a.titleMatch;
    });

    if (matches.length === 0) {
      container.innerHTML = '<div class="search-no-results">No results found</div>';
    } else {
      container.innerHTML = matches.slice(0, 10).map(function (m) {
        return '<a class="search-result-item" href="' + m.url + '">' +
          '<div class="search-result-title">' + escapeHtml(m.title) + '</div>' +
          '<div class="search-result-snippet">' + m.snippet + '</div>' +
          '</a>';
      }).join('');
    }

    container.classList.add('visible');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // --- Init ---
  initTheme();
  initMobileSidebar();
  setActivePage();
  initCopyButtons();
  initSearch();
  updateThemeIcon();

  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      updateThemeIcon();
    }
  });
})();
