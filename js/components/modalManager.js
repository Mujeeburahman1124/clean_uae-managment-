/**
 * Clean UAE | تنظيف الفخامة — Modal Manager Component
 */

window.CLEAN_UAE_MODAL = {
  open: function(title, bodyHtml, footerHtml, isLarge) {
    var root = document.getElementById('modal-root');
    if (!root) return;

    var lgClass = isLarge ? 'modal-lg' : '';

    root.innerHTML = `
      <div class="modal-backdrop" id="active-modal-backdrop">
        <div class="modal-dialog ${lgClass}">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close" onclick="CLEAN_UAE_MODAL.close()">&times;</button>
          </div>
          <div class="modal-body">${bodyHtml}</div>
          ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
        </div>
      </div>
    `;

    document.addEventListener('keydown', this.handleEsc);
  },

  close: function() {
    var root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
    document.removeEventListener('keydown', this.handleEsc);
  },

  handleEsc: function(e) {
    if (e.key === 'Escape') {
      window.CLEAN_UAE_MODAL.close();
    }
  },

  // Specialized Modals
  openOtpLogin: function() {
    var body = `
      <div style="text-align: center; padding: 10px 0;">
        <i class="ri-shield-keyhole-line" style="font-size: 3rem; color: var(--primary);"></i>
        <p style="margin-top: 10px; color: var(--text-muted);">Enter your UAE Mobile Number to receive a 4-digit verification SMS code.</p>
        <div class="form-group" style="margin-top: 20px; text-align: start;">
          <label class="form-label">UAE Mobile Number</label>
          <input type="text" id="otp-mobile-input" class="form-control" placeholder="+971 50 123 4567" value="+971501234567">
        </div>
        <button class="btn btn-primary" style="width:100%; margin-top: 10px;" onclick="CLEAN_UAE_MODAL.sendOtpCode()">Send Verification Code</button>
        <div id="otp-code-section" style="display:none; margin-top: 20px; text-align: start;">
          <div class="form-group">
            <label class="form-label">Enter 4-Digit One-Time Code</label>
            <input type="text" id="otp-code-input" class="form-control" placeholder="1 2 3 4" maxlength="4" style="letter-spacing: 6px; font-weight: bold; text-align: center;">
          </div>
          <button class="btn btn-accent" style="width:100%;" onclick="CLEAN_UAE_MODAL.verifyOtpCode()">Verify & Login</button>
        </div>
      </div>
    `;
    this.open('OTP Mobile Verification', body, null, false);
  },

  sendOtpCode: function() {
    var phone = document.getElementById('otp-mobile-input').value;
    if (!window.CLEAN_UAE_VALIDATION.isValidUAEMobile(phone)) {
      window.CLEAN_UAE_NOTIFICATIONS.show('Please enter a valid UAE mobile number (+971 5x xxx xxxx)', 'danger');
      return;
    }
    document.getElementById('otp-code-section').style.display = 'block';
    window.CLEAN_UAE_NOTIFICATIONS.show('Demo SMS Code sent to ' + phone + ': [ 1234 ]', 'success', 6000);
  },

  verifyOtpCode: function() {
    var code = document.getElementById('otp-code-input').value;
    if (code === '1234' || code.length === 4) {
      this.close();
      window.CLEAN_UAE_STORE.update('currentRole', 'customer');
      window.CLEAN_UAE_ROUTER.navigate('customer');
      window.CLEAN_UAE_NOTIFICATIONS.show('Successfully logged in as Sara Al-Nuaimi!', 'success');
    } else {
      window.CLEAN_UAE_NOTIFICATIONS.show('Invalid verification code! Try entering 1234.', 'danger');
    }
  },

  openRescheduleCareInfo: function(bookingId) {
    var body = `
      <div style="text-align: center;">
        <i class="ri-phone-find-line" style="font-size: 3.5rem; color: var(--secondary);"></i>
        <h4 style="margin: 14px 0;">Contact Customer Care to Change Booking</h4>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          To ensure staff schedule optimization and travel buffer safety, booking changes, cancellations, and rescheduling for <strong>${bookingId}</strong> are handled directly by Customer Care.
        </p>
        <div style="background: rgba(217, 119, 6, 0.1); border: 1px solid var(--secondary); padding: 16px; border-radius: var(--border-radius); margin: 20px 0; display:flex; align-items:center; justify-content:center; gap: 14px;">
          <i class="ri-phone-fill" style="font-size: 2rem; color: var(--secondary);"></i>
          <div style="text-align:start;">
            <div style="font-size:0.8rem; color: var(--text-muted);">Dedicated UAE Helpline:</div>
            <a href="tel:+97180025326" style="font-size: 1.3rem; font-weight:800; color: var(--text-main); text-decoration:none;">800-CLEAN-UAE (+971 800 25326)</a>
          </div>
        </div>
        <p style="font-size:0.85rem; color: var(--text-muted);">Operating Hours: 7:00 AM – 10:00 PM (GST)</p>
      </div>
    `;
    var footer = `
      <a href="https://wa.me/971501234567" target="_blank" class="btn btn-accent"><i class="ri-whatsapp-line"></i> Chat on WhatsApp</a>
      <button class="btn btn-outline" onclick="CLEAN_UAE_MODAL.close()">Close</button>
    `;
    this.open('Booking Change Request', body, footer, false);
  }
};
