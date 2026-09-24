/**
 * Clean UAE | تنظيف الفخامة — Central Authentication & Session Management Service
 * Manages JWT/Bearer session tokens, user profiles, RBAC permissions, and real-time login states.
 */

window.CLEAN_UAE_AUTH = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'auth_user',

  currentUser: null,
  token: null,

  init: function() {
    this.token = window.CLEAN_UAE_STORAGE.getItem(this.TOKEN_KEY, null);
    this.currentUser = window.CLEAN_UAE_STORAGE.getItem(this.USER_KEY, null);

    if (this.token && this.currentUser) {
      // Sync with central reactive store
      window.CLEAN_UAE_STORE.update('currentRole', this.currentUser.role || 'customer');
      // Background verify token with server
      this.verifySession();
    }
  },

  verifySession: function() {
    if (!this.token) return;
    var self = this;
    fetch('api/index.php?route=auth&action=me', {
      headers: {
        'Authorization': 'Bearer ' + self.token,
        'X-Session-Token': self.token
      }
    })
    .then(function(res) {
      if (res.status === 401 || res.status === 403) {
        self.handleUnauthorized();
        return null;
      }
      return res.json();
    })
    .then(function(json) {
      if (json && json.success && json.data) {
        self.currentUser = json.data;
        window.CLEAN_UAE_STORAGE.setItem(self.USER_KEY, json.data);
      }
    })
    .catch(function() {
      // Offline fallback: maintain stored session
    });
  },

  login: function(email, password) {
    var self = this;
    return fetch('api/index.php?route=auth&action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    })
    .then(function(res) { return res.json(); })
    .then(function(json) {
      if (json.success && json.data && json.data.token) {
        self.setSession(json.data.token, json.data.user);
        return { success: true, user: json.data.user };
      }
      return { success: false, message: json.message || 'Login failed' };
    })
    .catch(function(err) {
      return { success: false, message: 'Network connection error: ' + err.message };
    });
  },

  sendEmailOtp: function(email) {
    return fetch('api/index.php?route=auth&action=send_email_otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    })
    .then(function(res) { return res.json(); })
    .catch(function(err) {
      return { success: false, message: 'Network connection error' };
    });
  },

  verifyEmailOtp: function(email, otp) {
    var self = this;
    return fetch('api/index.php?route=auth&action=verify_email_otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, otp: otp })
    })
    .then(function(res) { return res.json(); })
    .then(function(json) {
      if (json.success && json.data && json.data.token) {
        self.setSession(json.data.token, json.data.user);
        return { success: true, user: json.data.user };
      }
      return { success: false, message: json.message || 'Invalid verification code' };
    })
    .catch(function(err) {
      return { success: false, message: 'Network connection error' };
    });
  },

  register: function(data) {
    var self = this;
    return fetch('api/index.php?route=auth&action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function(res) { return res.json(); })
    .then(function(json) {
      if (json.success && json.data && json.data.token) {
        self.setSession(json.data.token, json.data.user);
        return { success: true, user: json.data.user };
      }
      return { success: false, message: json.message || 'Registration failed' };
    })
    .catch(function(err) {
      return { success: false, message: 'Network error: ' + err.message };
    });
  },

  logout: function() {
    var self = this;
    if (this.token) {
      fetch('api/index.php?route=auth&action=logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + self.token,
          'X-Session-Token': self.token
        }
      }).catch(function() {});
    }

    this.clearSession();
    window.CLEAN_UAE_ROUTER.navigate('home');
    if (window.CLEAN_UAE_NOTIFICATIONS) {
      window.CLEAN_UAE_NOTIFICATIONS.show('Logged out successfully.', 'info');
    }
  },

  setSession: function(token, user) {
    this.token = token;
    this.currentUser = user;
    window.CLEAN_UAE_STORAGE.setItem(this.TOKEN_KEY, token);
    window.CLEAN_UAE_STORAGE.setItem(this.USER_KEY, user);

    var role = user.role || 'customer';
    window.CLEAN_UAE_STORE.update('currentRole', role);

    if (window.CLEAN_UAE_NAVBAR) {
      window.CLEAN_UAE_NAVBAR.render();
    }
  },

  clearSession: function() {
    this.token = null;
    this.currentUser = null;
    window.CLEAN_UAE_STORAGE.removeItem(this.TOKEN_KEY);
    window.CLEAN_UAE_STORAGE.removeItem(this.USER_KEY);
    window.CLEAN_UAE_STORE.update('currentRole', 'public');

    if (window.CLEAN_UAE_NAVBAR) {
      window.CLEAN_UAE_NAVBAR.render();
    }
  },

  handleUnauthorized: function() {
    this.clearSession();
    if (window.CLEAN_UAE_NOTIFICATIONS) {
      window.CLEAN_UAE_NOTIFICATIONS.show('Session expired. Please log in again.', 'warning');
    }
  },

  isAuthenticated: function() {
    return !!this.token && !!this.currentUser;
  },

  getUser: function() {
    return this.currentUser;
  },

  getToken: function() {
    return this.token;
  },

  hasRole: function(role) {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'owner') return true;
    return this.currentUser.role === role;
  },

  hasPermission: function(perm) {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'owner') return true;
    var perms = this.currentUser.permissions || [];
    return perms.indexOf(perm) !== -1;
  }
};
