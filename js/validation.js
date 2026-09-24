/**
 * Clean UAE | تنظيف الفخامة — Validation Helpers
 */

window.CLEAN_UAE_VALIDATION = {
  isValidEmail: function(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  isValidUAEMobile: function(phone) {
    // Matches UAE format +971 5x xxx xxxx or 05x xxx xxxx
    var cleaned = String(phone).replace(/\s+/g, '');
    return /^(\+971|00971|0)?5[0245689]\d{7}$/.test(cleaned);
  },

  validateBookingForm: function(data) {
    var errors = [];
    if (!data.serviceId) errors.push('Please select a service.');
    if (!data.emirate) errors.push('Please select an Emirate.');
    if (!data.area) errors.push('Please select an area.');
    if (!data.address) errors.push('Address details are required.');
    if (!data.date) errors.push('Please choose a preferred date.');
    if (!data.timeSlot) errors.push('Please select a time slot.');
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
};
