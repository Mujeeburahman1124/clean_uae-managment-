/**
 * Clean UAE | تنظيف الفخامة — Central Reactive Store
 * Manages reactive state across all components with pub/sub architecture and localStorage persistence.
 */

window.CLEAN_UAE_STORE = {
  state: null,
  listeners: [],

  init: function() {
    var savedState = window.CLEAN_UAE_STORAGE.getItem('state', null);
    if (!savedState) {
      this.seed();
    } else {
      this.state = savedState;
    }
  },

  seed: function() {
    var mock = window.CLEAN_UAE_MOCK;
    this.state = {
      settings: mock.settings,
      locations: mock.locations,
      services: mock.services,
      users: mock.users,
      bookings: mock.bookings,
      contracts: mock.contracts,
      inventory: mock.inventory,
      complaints: mock.complaints,
      reviews: mock.reviews,
      offers: mock.offers,
      cashCollections: mock.cashCollections,
      refunds: mock.refunds,
      
      // Default empty dynamic lists if not pre-seeded
      subscribers: [
        { email: 'client@dubai.ae', date: '2026-09-10', status: 'subscribed' }
      ],
      attendance: [
        { id: 'att-1', staffId: 'usr-staff-1', staffName: 'Rashid Khan', date: '2026-09-24', clockIn: '08:00 AM', clockOut: null, status: 'on_duty', locationVerified: true }
      ],
      leaveRequests: [
        { id: 'lve-1', staffName: 'Ahmad Team Leader', type: 'Annual Leave', dates: '2026-10-01 to 2026-10-10', status: 'pending', reason: 'Family vacation' }
      ],
      auditLogs: [
        { id: 'log-1', timestamp: new Date().toLocaleString(), user: 'System', action: 'Demo state initialized' }
      ],

      // Current active view session
      currentRole: 'public', // public, customer, staff, dispatcher, finance, admin
      activeEmirate: 'ajman'
    };
    this.persist();
    this.notify();
  },

  get: function(key) {
    if (!this.state) this.init();
    if (key) return this.state[key];
    return this.state;
  },

  set: function(newState) {
    this.state = Object.assign({}, this.state, newState);
    this.persist();
    this.notify();
  },

  update: function(key, value) {
    if (!this.state) this.init();
    this.state[key] = value;
    this.persist();
    this.notify();
  },

  subscribe: function(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify: function() {
    var stateCopy = this.state;
    this.listeners.forEach(function(listener) {
      try {
        listener(stateCopy);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  },

  persist: function() {
    window.CLEAN_UAE_STORAGE.setItem('state', this.state);
  },

  reset: function() {
    window.CLEAN_UAE_STORAGE.removeItem('state');
    this.seed();
    if (window.CLEAN_UAE_NOTIFICATIONS) {
      window.CLEAN_UAE_NOTIFICATIONS.show('Demo state successfully reset to default!', 'info');
    }
  },

  addAuditLog: function(user, action) {
    var logs = this.get('auditLogs') || [];
    logs.unshift({
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      user: user || 'Anonymous',
      action: action
    });
    this.update('auditLogs', logs.slice(0, 50)); // keep last 50 logs
  }
};
