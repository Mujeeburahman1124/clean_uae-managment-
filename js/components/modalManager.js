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
        <h4 style="margin: 10px 0 6px;">Secure Portal Authentication</h4>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Log in using your registered email address or staff credentials.</p>

        <!-- Login Tabs: Email OTP vs Password -->
        <div style="display:flex; justify-content:center; gap:8px; margin: 16px 0;">
          <button id="auth-tab-otp" class="btn btn-sm btn-primary" onclick="CLEAN_UAE_MODAL.switchAuthTab('otp')">Email OTP Code</button>
          <button id="auth-tab-pass" class="btn btn-sm btn-outline" onclick="CLEAN_UAE_MODAL.switchAuthTab('pass')">Password Login</button>
        </div>

        <!-- OTP Section -->
        <div id="auth-section-otp">
          <div class="form-group" style="text-align: start;">
            <label class="form-label">Email Address</label>
            <input type="email" id="auth-email-input" class="form-control" placeholder="sara@example.ae" value="sara@example.ae">
          </div>
          <button class="btn btn-primary" style="width:100%; margin-top: 6px;" onclick="CLEAN_UAE_MODAL.sendOtpCode()">Send Verification Code</button>
          
          <div id="otp-code-section" style="display:none; margin-top: 16px; text-align: start;">
            <div class="form-group">
              <label class="form-label">Enter 6-Digit One-Time Code</label>
              <input type="text" id="otp-code-input" class="form-control" placeholder="1 2 3 4 5 6" maxlength="6" style="letter-spacing: 6px; font-weight: bold; text-align: center; font-size: 1.2rem;">
            </div>
            <button class="btn btn-accent" style="width:100%;" onclick="CLEAN_UAE_MODAL.verifyOtpCode()">Verify & Sign In</button>
          </div>
        </div>

        <!-- Password Section -->
        <div id="auth-section-pass" style="display:none; text-align: start;">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="pass-email-input" class="form-control" placeholder="owner@cleanuae.ae" value="owner@cleanuae.ae">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="pass-password-input" class="form-control" placeholder="••••••••" value="CleanUAE2026!">
          </div>
          <button class="btn btn-primary" style="width:100%; margin-top: 6px;" onclick="CLEAN_UAE_MODAL.submitPasswordLogin()">Sign In with Password</button>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:10px; text-align:center;">
            Default Staff/Admin password: <code>CleanUAE2026!</code>
          </div>
        </div>
      </div>
    `;
    this.open('Account Authentication', body, null, false);
  },

  switchAuthTab: function(tab) {
    var otpSec = document.getElementById('auth-section-otp');
    var passSec = document.getElementById('auth-section-pass');
    var otpBtn = document.getElementById('auth-tab-otp');
    var passBtn = document.getElementById('auth-tab-pass');

    if (tab === 'otp') {
      if (otpSec) otpSec.style.display = 'block';
      if (passSec) passSec.style.display = 'none';
      if (otpBtn) otpBtn.className = 'btn btn-sm btn-primary';
      if (passBtn) passBtn.className = 'btn btn-sm btn-outline';
    } else {
      if (otpSec) otpSec.style.display = 'none';
      if (passSec) passSec.style.display = 'block';
      if (otpBtn) otpBtn.className = 'btn btn-sm btn-outline';
      if (passBtn) passBtn.className = 'btn btn-sm btn-primary';
    }
  },

  sendOtpCode: function() {
    var email = document.getElementById('auth-email-input').value.trim();
    if (!window.CLEAN_UAE_VALIDATION.isValidEmail(email)) {
      window.CLEAN_UAE_NOTIFICATIONS.show('Please enter a valid email address.', 'danger');
      return;
    }

    window.CLEAN_UAE_AUTH.sendEmailOtp(email).then(function(res) {
      if (res && res.success) {
        document.getElementById('otp-code-section').style.display = 'block';
        var devNotice = res.data && res.data.dev_otp ? ' [DEV CODE: ' + res.data.dev_otp + ']' : '';
        window.CLEAN_UAE_NOTIFICATIONS.show('Verification code sent to ' + email + devNotice, 'success', 8000);
      } else {
        window.CLEAN_UAE_NOTIFICATIONS.show(res.message || 'Failed to send OTP code.', 'danger');
      }
    });
  },

  verifyOtpCode: function() {
    var email = document.getElementById('auth-email-input').value.trim();
    var code = document.getElementById('otp-code-input').value.trim();

    if (!code || code.length < 6) {
      window.CLEAN_UAE_NOTIFICATIONS.show('Please enter the 6-digit code sent to your email.', 'warning');
      return;
    }

    var self = this;
    window.CLEAN_UAE_AUTH.verifyEmailOtp(email, code).then(function(res) {
      if (res && res.success) {
        self.close();
        var user = res.user;
        window.CLEAN_UAE_NOTIFICATIONS.show('Welcome back, ' + user.name + '!', 'success');
        var targetRoute = user.role === 'customer' ? 'customer' : (user.role === 'public' ? 'home' : user.role);
        window.CLEAN_UAE_ROUTER.navigate(targetRoute);
      } else {
        window.CLEAN_UAE_NOTIFICATIONS.show(res.message || 'Invalid or expired code.', 'danger');
      }
    });
  },

  submitPasswordLogin: function() {
    var email = document.getElementById('pass-email-input').value.trim();
    var password = document.getElementById('pass-password-input').value;

    if (!email || !password) {
      window.CLEAN_UAE_NOTIFICATIONS.show('Email and password are required.', 'warning');
      return;
    }

    var self = this;
    window.CLEAN_UAE_AUTH.login(email, password).then(function(res) {
      if (res && res.success) {
        self.close();
        var user = res.user;
        window.CLEAN_UAE_NOTIFICATIONS.show('Signed in as ' + user.name + ' (' + user.role + ')', 'success');
        var targetRoute = user.role === 'customer' ? 'customer' : (user.role === 'public' ? 'home' : user.role);
        window.CLEAN_UAE_ROUTER.navigate(targetRoute);
      } else {
        window.CLEAN_UAE_NOTIFICATIONS.show(res.message || 'Invalid credentials.', 'danger');
      }
    });
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
