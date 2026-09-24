/**
 * Clean UAE | تنظيف الفخامة — General Utility Helper Functions
 */

window.CLEAN_UAE_UTILS = {
  formatCurrency: function(amount, currency) {
    var c = currency || 'AED';
    var val = parseFloat(amount || 0).toFixed(2);
    return c + ' ' + val;
  },

  calculateVAT: function(price, vatRate) {
    var rate = parseFloat(vatRate !== undefined ? vatRate : 5);
    var p = parseFloat(price || 0);
    var vat = p * (rate / 100);
    return {
      vatAmount: parseFloat(vat.toFixed(2)),
      total: parseFloat((p + vat).toFixed(2))
    };
  },

  generateRefCode: function(prefix) {
    var p = prefix || 'CUAE';
    var num = Math.floor(1000 + Math.random() * 9000);
    return p + '-' + num;
  },

  formatTimeRemaining: function(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  },

  addWorkingDays: function(startDateStr, daysToAdd) {
    var date = new Date(startDateStr || Date.now());
    var added = 0;
    while (added < daysToAdd) {
      date.setDate(date.getDate() + 1);
      var day = date.getDay();
      // Skip Friday (5) and Saturday (6) in UAE business calendar
      if (day !== 5 && day !== 6) {
        added++;
      }
    }
    return date.toISOString().split('T')[0];
  }
};
