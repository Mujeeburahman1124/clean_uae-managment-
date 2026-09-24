/**
 * Clean UAE | تنظيف الفخامة — Common UI Elements Helper
 */

window.CLEAN_UAE_COMMON = {
  renderBadge: function(status) {
    var s = (status || '').toLowerCase();
    var label = s;
    var badgeClass = 'badge-primary';

    if (s === 'paid' || s === 'completed' || s === 'active' || s === 'reconciled' || s === 'resolved') {
      badgeClass = 'badge-success';
    } else if (s === 'outstanding_cash' || s === 'pending' || s === 'under_review' || s === 'in_progress') {
      badgeClass = 'badge-warning';
    } else if (s === 'cancelled' || s === 'rejected') {
      badgeClass = 'badge-danger';
    } else if (s === 'assigned' || s === 'confirmed') {
      badgeClass = 'badge-info';
    }

    // Translated labels
    var i18nKey = 'status_' + s;
    label = window.CLEAN_UAE_I18N.t(i18nKey) || s.replace('_', ' ');

    return `<span class="badge ${badgeClass}">${label}</span>`;
  },

  renderStars: function(rating) {
    var r = Math.round(rating || 5);
    var stars = '';
    for (var i = 1; i <= 5; i++) {
      if (i <= r) {
        stars += '<i class="ri-star-fill" style="color: #f59e0b;"></i>';
      } else {
        stars += '<i class="ri-star-line" style="color: #cbd5e1;"></i>';
      }
    }
    return stars;
  }
};
