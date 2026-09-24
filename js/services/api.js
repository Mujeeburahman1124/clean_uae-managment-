/**
 * Clean UAE | تنظيف الفخامة — API Service Layer
 * Connects frontend views directly with live PHP 8+ / MySQL 8+ REST API backend endpoints with local fallback.
 */

window.CLEAN_UAE_API = {
  baseUrl: 'api/index.php?route=',

  get: function(endpoint, params) {
    var route = endpoint.replace('/', '');
    var self = this;
    return fetch(this.baseUrl + route)
      .then(function(res) {
        if (!res.ok) throw new Error('Network response error');
        return res.json();
      })
      .then(function(json) {
        if (json.success && json.data) return json;
        throw new Error('API returned unhandled format');
      })
      .catch(function(err) {
        // Fallback gracefully to local store state if PHP backend is offline
        var state = window.CLEAN_UAE_STORE.get();
        return { status: 200, success: true, data: state[route] || [], fallback: true };
      });
  },

  post: function(endpoint, payload) {
    var route = endpoint.replace('/', '');
    var self = this;
    return fetch(this.baseUrl + route, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function(res) {
        if (!res.ok) throw new Error('API POST error');
        return res.json();
      })
      .catch(function(err) {
        // Fallback update to local store
        var stateList = window.CLEAN_UAE_STORE.get(route) || [];
        payload.id = payload.id || 'CUAE-' + Math.floor(1000 + Math.random() * 9000);
        stateList.unshift(payload);
        window.CLEAN_UAE_STORE.update(route, stateList);
        return { status: 201, success: true, data: payload, fallback: true };
      });
  },

  put: function(endpoint, payload) {
    var route = endpoint.replace('/', '');
    return fetch(this.baseUrl + route, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function(res) { return res.json(); })
      .catch(function(err) {
        return { status: 200, success: true, data: payload, fallback: true };
      });
  }
};
