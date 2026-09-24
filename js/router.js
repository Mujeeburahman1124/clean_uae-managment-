/**
 * Clean UAE | تنظيف الفخامة — SPA Hash Router
 * Directs view rendering based on URL hash or active navigation role.
 */

window.CLEAN_UAE_ROUTER = {
  currentRoute: 'home',

  init: function() {
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });
    this.handleHashChange();
  },

  handleHashChange: function() {
    var hash = window.location.hash.replace('#', '') || 'home';
    this.currentRoute = hash;
    this.renderRoute(hash);
  },

  navigate: function(route) {
    window.location.hash = route;
  },

  renderRoute: function(route) {
    var store = window.CLEAN_UAE_STORE;
    var root = document.getElementById('app-root');
    if (!root) return;

    // Check if route matches portal roles directly
    if (['customer', 'staff', 'dispatcher', 'finance', 'admin'].includes(route)) {
      store.update('currentRole', route);
    } else {
      store.update('currentRole', 'public');
    }

    // Render corresponding component
    if (route === 'home' || route === 'public') {
      window.CLEAN_UAE_PUBLIC_PAGES.renderHome(root);
    } else if (route === 'services') {
      window.CLEAN_UAE_PUBLIC_PAGES.renderServices(root);
    } else if (route === 'packages') {
      window.CLEAN_UAE_PUBLIC_PAGES.renderPackages(root);
    } else if (route === 'offers') {
      window.CLEAN_UAE_PUBLIC_PAGES.renderOffers(root);
    } else if (route === 'areas') {
      window.CLEAN_UAE_PUBLIC_PAGES.renderAreas(root);
    } else if (route === 'about') {
      window.CLEAN_UAE_PUBLIC_PAGES.renderAbout(root);
    } else if (route === 'reviews') {
      window.CLEAN_UAE_PUBLIC_PAGES.renderReviews(root);
    } else if (route === 'contact') {
      window.CLEAN_UAE_PUBLIC_PAGES.renderContact(root);
    } else if (route === 'customer') {
      window.CLEAN_UAE_CUSTOMER_PORTAL.render(root);
    } else if (route === 'staff') {
      window.CLEAN_UAE_STAFF_PORTAL.render(root);
    } else if (route === 'dispatcher') {
      window.CLEAN_UAE_DISPATCHER_PORTAL.render(root);
    } else if (route === 'finance') {
      window.CLEAN_UAE_FINANCE_PORTAL.render(root);
    } else if (route === 'admin') {
      window.CLEAN_UAE_ADMIN_PORTAL.render(root);
    } else {
      window.CLEAN_UAE_PUBLIC_PAGES.renderHome(root);
    }

    window.scrollTo(0, 0);
  }
};
