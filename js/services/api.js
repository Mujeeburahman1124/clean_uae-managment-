/**
 * Clean UAE | تنظيف الفخامة — API Service Layer
 * Connects frontend views directly with live PHP 8+ / MySQL 8+ REST API backend endpoints with Bearer token authentication and robust error interception.
 */

window.CLEAN_UAE_API = {
  baseUrl: 'api/index.php?route=',

  getHeaders: function(customHeaders) {
    var headers = Object.assign({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }, customHeaders || {});

    if (window.CLEAN_UAE_AUTH && window.CLEAN_UAE_AUTH.getToken()) {
      var token = window.CLEAN_UAE_AUTH.getToken();
      headers['Authorization'] = 'Bearer ' + token;
      headers['X-Session-Token'] = token;
    }

    return headers;
  },

  handleResponse: function(res) {
    if (res.status === 401) {
      if (window.CLEAN_UAE_AUTH) {
        window.CLEAN_UAE_AUTH.handleUnauthorized();
      }
      throw new Error('Authentication required');
    }
    return res.json().then(function(json) {
      if (!res.ok) {
        throw new Error(json.message || 'API request failed with status ' + res.status);
      }
      return json;
    });
  },

  get: function(endpoint, params) {
    var route = endpoint.replace('/', '');
    if (params) {
      var query = new URLSearchParams(params).toString();
      route += (route.indexOf('?') === -1 ? '&' : '&') + query;
    }

    var self = this;
    return fetch(this.baseUrl + route, {
      method: 'GET',
      headers: this.getHeaders()
    })
      .then(function(res) { return self.handleResponse(res); })
      .catch(function(err) {
        // Fallback to local store state if offline
        var baseKey = route.split('&')[0];
        var state = window.CLEAN_UAE_STORE ? window.CLEAN_UAE_STORE.get() : {};
        return { status: 200, success: true, data: state[baseKey] || [], fallback: true, error: err.message };
      });
  },

  post: function(endpoint, payload) {
    var route = endpoint.replace('/', '');
    var self = this;
    return fetch(this.baseUrl + route, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    })
      .then(function(res) { return self.handleResponse(res); })
      .catch(function(err) {
        // Fallback update to local store
        var baseKey = route.split('&')[0];
        if (window.CLEAN_UAE_STORE) {
          var stateList = window.CLEAN_UAE_STORE.get(baseKey) || [];
          payload.id = payload.id || 'CUAE-' + Math.floor(1000 + Math.random() * 9000);
          stateList.unshift(payload);
          window.CLEAN_UAE_STORE.update(baseKey, stateList);
        }
        return { status: 201, success: true, data: payload, fallback: true, error: err.message };
      });
  },

  put: function(endpoint, payload) {
    var route = endpoint.replace('/', '');
    var self = this;
    return fetch(this.baseUrl + route, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    })
      .then(function(res) { return self.handleResponse(res); })
      .catch(function(err) {
        return { status: 200, success: true, data: payload, fallback: true, error: err.message };
      });
  },

  delete: function(endpoint) {
    var route = endpoint.replace('/', '');
    var self = this;
    return fetch(this.baseUrl + route, {
      method: 'DELETE',
      headers: this.getHeaders()
    })
      .then(function(res) { return self.handleResponse(res); });
  }
};
