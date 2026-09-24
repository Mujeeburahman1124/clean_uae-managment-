/**
 * Clean UAE | تنظيف الفخامة — Main Application Entry Point
 * Bootstraps store, router, navbar, theme toggles, and event listeners.
 */

document.addEventListener('DOMContentLoaded', function() {
  // 1. Initialize Reactive Central Store & Auth Session
  window.CLEAN_UAE_STORE.init();
  if (window.CLEAN_UAE_AUTH) {
    window.CLEAN_UAE_AUTH.init();
  }

  // 2. Set up Language Toggle Listener
  var langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', function() {
      var nextLang = window.CLEAN_UAE_I18N.currentLang === 'en' ? 'ar' : 'en';
      window.CLEAN_UAE_I18N.setLang(nextLang);
      window.CLEAN_UAE_NAVBAR.render();
      window.CLEAN_UAE_ROUTER.handleHashChange();
    });
  }

  // 3. Set up Theme Toggle Listener
  var themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function() {
      var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      var nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', nextTheme);
      window.CLEAN_UAE_STORAGE.setItem('theme', nextTheme);
      var icon = document.getElementById('theme-icon');
      if (icon) icon.className = nextTheme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
    });
  }

  // 4. Set up Quick Role Switcher Listener
  var roleSelect = document.getElementById('demo-role-select');
  if (roleSelect) {
    roleSelect.addEventListener('change', function(e) {
      var selectedRole = e.target.value;
      if (selectedRole === 'public') {
        window.CLEAN_UAE_ROUTER.navigate('home');
      } else {
        window.CLEAN_UAE_ROUTER.navigate(selectedRole);
      }
    });
  }

  // 5. Set up Reset Demo Button Listener
  var resetBtn = document.getElementById('reset-demo-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to reset all demo state to defaults?')) {
        window.CLEAN_UAE_STORE.reset();
        window.CLEAN_UAE_ROUTER.handleHashChange();
      }
    });
  }

  // 6. Subscribe Navbar to Store Updates
  window.CLEAN_UAE_STORE.subscribe(function() {
    window.CLEAN_UAE_NAVBAR.render();
  });

  // 7. Render Navigation and Initialize Router
  window.CLEAN_UAE_NAVBAR.render();
  window.CLEAN_UAE_FOOTER.render();
  window.CLEAN_UAE_ROUTER.init();
});
