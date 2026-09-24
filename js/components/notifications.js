/**
 * Clean UAE | تنظيف الفخامة — Notifications & Toast System
 */

window.CLEAN_UAE_NOTIFICATIONS = {
  show: function(message, type, duration) {
    var container = document.getElementById('toast-container');
    if (!container) return;

    var toastType = type || 'info'; // info, success, danger, warning
    var dur = duration || 4000;

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + toastType;

    var icon = 'ri-information-line';
    if (toastType === 'success') icon = 'ri-checkbox-circle-line';
    if (toastType === 'danger') icon = 'ri-error-warning-line';
    if (toastType === 'warning') icon = 'ri-alert-line';

    toast.innerHTML = `
      <i class="${icon}" style="font-size: 1.3rem;"></i>
      <div style="flex: 1; font-weight: 500; font-size: 0.9rem;">${message}</div>
      <button onclick="this.parentElement.remove()" style="background:none; border:none; color:inherit; cursor:pointer;"><i class="ri-close-line"></i></button>
    `;

    container.appendChild(toast);

    setTimeout(function() {
      if (toast.parentElement) {
        toast.remove();
      }
    }, dur);
  }
};
