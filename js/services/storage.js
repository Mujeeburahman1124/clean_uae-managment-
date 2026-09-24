/**
 * Clean UAE | تنظيف الفخامة — Storage Service
 * Handles localStorage persistence, corrupted JSON safeguards, namespaces, and resets.
 */

window.CLEAN_UAE_STORAGE = {
  PREFIX: 'cleanUAE_',

  getItem: function(key, defaultValue) {
    try {
      var raw = localStorage.getItem(this.PREFIX + key);
      if (!raw) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Storage read error for key:', key, e);
      return defaultValue;
    }
  },

  setItem: function(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error for key:', key, e);
    }
  },

  removeItem: function(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (e) {
      console.error('Storage remove error:', e);
    }
  },

  clearAll: function() {
    try {
      var keysToRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(this.PREFIX) === 0) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(function(k) { localStorage.removeItem(k); });
    } catch (e) {
      console.error('Storage clear error:', e);
    }
  }
};
