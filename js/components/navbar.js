/**
 * Clean UAE | تنظيف الفخامة — Navbar Component
 */

window.CLEAN_UAE_NAVBAR = {
  render: function() {
    var headerEl = document.getElementById('main-header');
    if (!headerEl) return;

    var store = window.CLEAN_UAE_STORE.get();
    var currentRole = store.currentRole || 'public';
    var locations = store.locations || [];
    var activeEmirate = store.activeEmirate || 'ajman';

    var emirateOptions = locations.map(loc => {
      var isSel = loc.id === activeEmirate ? 'selected' : '';
      var statusBadge = loc.active ? '' : ' (' + (CLEAN_UAE_I18N.currentLang === 'ar' ? 'قريباً' : 'Coming Soon') + ')';
      return `<option value="${loc.id}" ${isSel} ${!loc.active ? 'disabled' : ''}>${CLEAN_UAE_I18N.currentLang === 'ar' ? loc.nameAr : loc.name}${statusBadge}</option>`;
    }).join('');

    headerEl.innerHTML = `
      <nav class="navbar">
        <a href="#home" class="brand-logo">
          <i class="ri-sparkling-fill"></i>
          <span>Clean UAE</span>
          <span class="brand-text-ar">تنظيف الفخامة</span>
        </a>

        <ul class="nav-links">
          <li><a href="#home" class="nav-link ${window.CLEAN_UAE_ROUTER.currentRoute === 'home' ? 'active' : ''}">${CLEAN_UAE_I18N.t('nav_home')}</a></li>
          <li><a href="#services" class="nav-link ${window.CLEAN_UAE_ROUTER.currentRoute === 'services' ? 'active' : ''}">${CLEAN_UAE_I18N.t('nav_services')}</a></li>
          <li><a href="#packages" class="nav-link ${window.CLEAN_UAE_ROUTER.currentRoute === 'packages' ? 'active' : ''}">${CLEAN_UAE_I18N.t('nav_packages')}</a></li>
          <li><a href="#offers" class="nav-link ${window.CLEAN_UAE_ROUTER.currentRoute === 'offers' ? 'active' : ''}">${CLEAN_UAE_I18N.t('nav_offers')}</a></li>
          <li><a href="#areas" class="nav-link ${window.CLEAN_UAE_ROUTER.currentRoute === 'areas' ? 'active' : ''}">${CLEAN_UAE_I18N.t('nav_areas')}</a></li>
          <li><a href="#reviews" class="nav-link ${window.CLEAN_UAE_ROUTER.currentRoute === 'reviews' ? 'active' : ''}">${CLEAN_UAE_I18N.t('nav_reviews')}</a></li>
          <li><a href="#contact" class="nav-link ${window.CLEAN_UAE_ROUTER.currentRoute === 'contact' ? 'active' : ''}">${CLEAN_UAE_I18N.t('nav_contact')}</a></li>
        </ul>

        <div class="nav-actions">
          <select id="header-emirate-select" class="emirate-selector" onchange="CLEAN_UAE_NAVBAR.changeEmirate(this.value)">
            ${emirateOptions}
          </select>

          <a href="tel:+97180025326" class="btn btn-outline btn-sm" title="Call Clean UAE Helpline">
            <i class="ri-phone-line"></i> 800-25326
          </a>

          <button onclick="CLEAN_UAE_BOOKING_MODAL.open()" class="btn btn-primary btn-sm">
            <i class="ri-calendar-check-line"></i> ${CLEAN_UAE_I18N.t('nav_book_now')}
          </button>

          <button onclick="CLEAN_UAE_MODAL.openOtpLogin()" class="btn btn-secondary btn-sm" title="Customer Login / OTP">
            <i class="ri-user-3-line"></i> ${CLEAN_UAE_I18N.t('nav_portal')}
          </button>
        </div>
      </nav>
    `;
  },

  changeEmirate: function(val) {
    window.CLEAN_UAE_STORE.update('activeEmirate', val);
    var locs = window.CLEAN_UAE_STORE.get('locations') || [];
    var found = locs.find(l => l.id === val);
    if (found) {
      window.CLEAN_UAE_NOTIFICATIONS.show('Active Emirate set to: ' + found.name, 'info');
    }
  }
};
