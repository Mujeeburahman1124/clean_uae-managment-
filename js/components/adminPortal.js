/**
 * Clean UAE | تنظيف الفخامة — Owner & Admin Control Center
 * Comprehensive management center covering KPIs, location expansion, staff approvals, chemical inventory, complaint SLAs, theme customizations, and demo reset.
 */

window.CLEAN_UAE_ADMIN_PORTAL = {
  activeTab: 'overview',

  render: function(root) {
    var store = window.CLEAN_UAE_STORE.get();
    var bookings = store.bookings || [];
    var locations = store.locations || [];
    var inventory = store.inventory || [];
    var complaints = store.complaints || [];
    var leaveRequests = store.leaveRequests || [];
    var settings = store.settings || {};

    // Calculate dynamic KPIs
    var totalRevenue = bookings.reduce((acc, b) => acc + (parseFloat(b.totalAmount) || 0), 0);
    var cashOutstanding = bookings.filter(b => b.paymentStatus === 'outstanding_cash').reduce((acc, b) => acc + (parseFloat(b.totalAmount) || 0), 0);

    root.innerHTML = `
      <div class="portal-layout">
        <!-- Sidebar Navigation -->
        <aside class="portal-sidebar">
          <div style="padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); margin-bottom:16px;">
            <div style="font-size:0.8rem; color:#38bdf8; font-weight:700;">ENTERPRISE HQ CONTROL</div>
            <h3 style="color:#ffffff; font-size:1.1rem; font-weight:800;">Clean UAE Admin</h3>
          </div>

          <ul class="portal-nav-menu">
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_ADMIN_PORTAL.switchTab('overview'); return false;" class="${this.activeTab === 'overview' ? 'active' : ''}"><i class="ri-dashboard-3-line"></i> Dashboard KPIs</a></li>
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_ADMIN_PORTAL.switchTab('locations'); return false;" class="${this.activeTab === 'locations' ? 'active' : ''}"><i class="ri-map-2-line"></i> Location Expansion</a></li>
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_ADMIN_PORTAL.switchTab('services'); return false;" class="${this.activeTab === 'services' ? 'active' : ''}"><i class="ri-sparkling-2-line"></i> Services & Pricing</a></li>
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_ADMIN_PORTAL.switchTab('staff'); return false;" class="${this.activeTab === 'staff' ? 'active' : ''}"><i class="ri-team-line"></i> Staff & Leave Approvals</a></li>
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_ADMIN_PORTAL.switchTab('inventory'); return false;" class="${this.activeTab === 'inventory' ? 'active' : ''}"><i class="ri-flask-line"></i> Chemical Inventory</a></li>
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_ADMIN_PORTAL.switchTab('complaints'); return false;" class="${this.activeTab === 'complaints' ? 'active' : ''}"><i class="ri-customer-service-2-line"></i> Complaint SLA Desk</a></li>
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_ADMIN_PORTAL.switchTab('theme'); return false;" class="${this.activeTab === 'theme' ? 'active' : ''}"><i class="ri-palette-line"></i> Theme Customization</a></li>
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_ADMIN_PORTAL.switchTab('settings'); return false;" class="${this.activeTab === 'settings' ? 'active' : ''}"><i class="ri-settings-3-line"></i> System Settings</a></li>
          </ul>
        </aside>

        <!-- Main Content View -->
        <main class="portal-content">
          ${this.renderTabContent(bookings, locations, inventory, complaints, leaveRequests, settings, totalRevenue, cashOutstanding)}
        </main>
      </div>
    `;
  },

  switchTab: function(tab) {
    this.activeTab = tab;
    this.render(document.getElementById('app-root'));
  },

  renderTabContent: function(bookings, locations, inventory, complaints, leaveRequests, settings, totalRevenue, cashOutstanding) {
    if (this.activeTab === 'overview') {
      return `
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:16px;">Executive Control Dashboard</h2>
        
        <!-- KPI Row -->
        <div class="grid grid-4" style="margin-bottom:24px;">
          <div class="card" style="border-inline-start:4px solid var(--primary);">
            <div style="font-size:0.8rem; color:var(--text-muted);">TOTAL REVENUE (DEMO)</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--primary);">AED ${totalRevenue.toFixed(2)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">5% VAT Included</div>
          </div>
          <div class="card" style="border-inline-start:4px solid var(--secondary);">
            <div style="font-size:0.8rem; color:var(--text-muted);">CASH OUTSTANDING</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--secondary);">AED ${cashOutstanding.toFixed(2)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Pay After Service Queue</div>
          </div>
          <div class="card" style="border-inline-start:4px solid var(--accent);">
            <div style="font-size:0.8rem; color:var(--text-muted);">TOTAL BOOKINGS</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--accent);">${bookings.length}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Ajman Operations</div>
          </div>
          <div class="card" style="border-inline-start:4px solid var(--danger);">
            <div style="font-size:0.8rem; color:var(--text-muted);">PENDING COMPLAINTS</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--danger);">${complaints.length}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">SLA Tracked</div>
          </div>
        </div>

        <!-- Recent Bookings Table -->
        <div class="card">
          <h3 style="font-weight:700; margin-bottom:16px;">Recent Bookings Overview</h3>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Emirate / Area</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${bookings.map(b => `
                  <tr>
                    <td style="font-weight:700;">${b.id}</td>
                    <td>${b.customerName}</td>
                    <td>${b.serviceName}</td>
                    <td>${b.emirate} • ${b.area}</td>
                    <td><strong>AED ${b.totalAmount}</strong></td>
                    <td>${window.CLEAN_UAE_COMMON.renderBadge(b.paymentStatus)}</td>
                    <td>${window.CLEAN_UAE_COMMON.renderBadge(b.status)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (this.activeTab === 'locations') {
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <div>
            <h2 style="font-size:1.8rem; font-weight:800;">Emirates & Location Expansion Control</h2>
            <p style="color:var(--text-muted);">Activate new Emirates and Neighborhoods without rebuilding the frontend system.</p>
          </div>
        </div>

        <div class="grid grid-2">
          ${locations.map(loc => `
            <div class="card" style="border-top:4px solid ${loc.active ? 'var(--accent)' : 'var(--warning)'};">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="font-weight:700;">${loc.name} (${loc.nameAr})</h3>
                <button onclick="CLEAN_UAE_ADMIN_PORTAL.toggleEmirate('${loc.id}')" class="btn btn-sm ${loc.active ? 'btn-secondary' : 'btn-accent'}">
                  ${loc.active ? 'Deactivate' : 'Activate Emirate'}
                </button>
              </div>
              <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">
                Travel Charge: <strong>AED ${loc.deliveryFee}</strong> • Status: ${window.CLEAN_UAE_COMMON.renderBadge(loc.active ? 'active' : 'pending')}
              </div>
              <div style="font-size:0.8rem; font-weight:700; margin-bottom:6px; color:var(--text-muted);">NEIGHBORHOODS:</div>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${(loc.areas || []).map(a => `<span class="badge badge-primary">${a.name}</span>`).join('') || '<span style="font-size:0.8rem; color:var(--text-muted);">No custom areas defined</span>'}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (this.activeTab === 'inventory') {
      return `
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:16px;">Chemical & Material Stock Controls</h2>
        <div class="card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Threshold</th>
                  <th>Unit</th>
                  <th>Alert Status</th>
                </tr>
              </thead>
              <tbody>
                ${inventory.map(item => `
                  <tr>
                    <td style="font-weight:700;">${item.name}</td>
                    <td><span class="badge badge-info">${item.category}</span></td>
                    <td style="font-size:1.1rem; font-weight:800;">${item.stock}</td>
                    <td>${item.minStock}</td>
                    <td>${item.unit}</td>
                    <td>
                      ${item.stock <= item.minStock ? '<span class="badge badge-danger">LOW STOCK ALERT</span>' : '<span class="badge badge-success">OK</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (this.activeTab === 'complaints') {
      return `
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:16px;">Customer Complaint SLA Workflow</h2>
        <div class="card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Booking</th>
                  <th>Status Workflow</th>
                  <th>Assigned QA Officer</th>
                  <th>Deadline</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${complaints.map(cmp => `
                  <tr>
                    <td style="font-weight:700;">${cmp.id}</td>
                    <td>${cmp.customerName}</td>
                    <td>${cmp.bookingId}</td>
                    <td>${window.CLEAN_UAE_COMMON.renderBadge(cmp.status)}</td>
                    <td>${cmp.assignedOfficer}</td>
                    <td>${cmp.deadline}</td>
                    <td>
                      <button onclick="CLEAN_UAE_ADMIN_PORTAL.advanceComplaint('${cmp.id}')" class="btn btn-primary btn-sm">Advance SLA Stage</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (this.activeTab === 'staff') {
      return `
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:16px;">Staff Leave Approvals</h2>
        <div class="card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Leave Type</th>
                  <th>Requested Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${leaveRequests.map(l => `
                  <tr>
                    <td style="font-weight:700;">${l.staffName}</td>
                    <td>${l.type}</td>
                    <td>${l.dates}</td>
                    <td>${l.reason}</td>
                    <td>${window.CLEAN_UAE_COMMON.renderBadge(l.status)}</td>
                    <td>
                      <button onclick="CLEAN_UAE_NOTIFICATIONS.show('Leave Approved for ${l.staffName}!', 'success')" class="btn btn-accent btn-sm">Approve</button>
                      <button onclick="CLEAN_UAE_NOTIFICATIONS.show('Leave Rejected', 'danger')" class="btn btn-outline btn-sm">Reject</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (this.activeTab === 'theme') {
      return `
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:16px;">Theme Customization Settings (Live Preview)</h2>
        <div class="card grid grid-2">
          <div>
            <div class="form-group">
              <label class="form-label">Primary Brand Color</label>
              <input type="color" class="form-control" value="${settings.theme ? settings.theme.primary : '#0284c7'}" onchange="document.documentElement.style.setProperty('--primary', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Secondary Color (Gold Accent)</label>
              <input type="color" class="form-control" value="${settings.theme ? settings.theme.secondary : '#d97706'}" onchange="document.documentElement.style.setProperty('--secondary', this.value)">
            </div>
          </div>
          <div style="background:var(--bg-main); padding:20px; border-radius:var(--border-radius); display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <h4>Live Customization Preview</h4>
            <button class="btn btn-primary" style="margin-top:10px;">Primary Button</button>
            <button class="btn btn-secondary" style="margin-top:10px;">Secondary Button</button>
          </div>
        </div>
      `;
    } else if (this.activeTab === 'settings') {
      return `
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:16px;">System Settings & Demo Reset</h2>
        <div class="card grid grid-2">
          <div>
            <div class="form-group">
              <label class="form-label">UAE VAT Rate (%)</label>
              <input type="number" class="form-control" value="${settings.vatRate || 5}" onchange="CLEAN_UAE_STORE.update('settings', Object.assign({}, window.CLEAN_UAE_STORE.get('settings'), {vatRate: parseFloat(this.value)}))">
            </div>
            <div class="form-group">
              <label class="form-label">Referral Reward (AED)</label>
              <input type="number" class="form-control" value="${settings.referralRewardAmount || 50}">
            </div>
          </div>

          <div style="border-inline-start:1px solid var(--border-color); padding-inline-start:20px;">
            <h4 style="color:var(--danger);">Admin Reset Control</h4>
            <p style="font-size:0.85rem; color:var(--text-muted); margin:10px 0;">Reset all demo localStorage state back to default seed data.</p>
            <button onclick="CLEAN_UAE_STORE.reset(); CLEAN_UAE_ADMIN_PORTAL.render(document.getElementById('app-root'));" class="btn btn-secondary">
              <i class="ri-refresh-line"></i> Confirm & Reset Demo Data
            </button>
          </div>
        </div>
      `;
    }
  },

  toggleEmirate: function(id) {
    var locations = window.CLEAN_UAE_STORE.get('locations') || [];
    var found = locations.find(l => l.id === id);
    if (found) {
      found.active = !found.active;
      window.CLEAN_UAE_STORE.update('locations', locations);
      window.CLEAN_UAE_NAVBAR.render();
      window.CLEAN_UAE_NOTIFICATIONS.show(found.name + ' coverage ' + (found.active ? 'ACTIVATED!' : 'Deactivated.'), found.active ? 'success' : 'warning');
      this.render(document.getElementById('app-root'));
    }
  },

  advanceComplaint: function(id) {
    var complaints = window.CLEAN_UAE_STORE.get('complaints') || [];
    var found = complaints.find(c => c.id === id);
    if (found) {
      var stages = ['open', 'under_review', 'action_scheduled', 'resolved', 'closed'];
      var idx = stages.indexOf(found.status);
      if (idx < stages.length - 1) {
        found.status = stages[idx + 1];
        window.CLEAN_UAE_STORE.update('complaints', complaints);
        window.CLEAN_UAE_NOTIFICATIONS.show('Complaint ' + id + ' SLA advanced to: ' + found.status, 'info');
        this.render(document.getElementById('app-root'));
      }
    }
  }
};
