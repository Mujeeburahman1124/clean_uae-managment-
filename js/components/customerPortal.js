/**
 * Clean UAE | تنظيف الفخامة — Customer Portal Component
 * Features booking tracker, contracts, referral wallet, customer care reschedule button, and 14-working-day refund tracker.
 */

window.CLEAN_UAE_CUSTOMER_PORTAL = {
  activeTab: 'bookings',

  render: function(root) {
    var store = window.CLEAN_UAE_STORE.get();
    var bookings = store.bookings || [];
    var contracts = store.contracts || [];
    var refunds = store.refunds || [];
    var users = store.users || [];
    var currentUser = users.find(u => u.role === 'customer') || users[0];

    root.innerHTML = `
      <div class="portal-layout">
        <!-- Sidebar Navigation -->
        <aside class="portal-sidebar">
          <div style="text-align:center; padding-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.1); margin-bottom:20px;">
            <div style="width:64px; height:64px; border-radius:50%; background:var(--primary); color:#ffffff; display:inline-flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:800; margin-bottom:10px;">
              ${currentUser.name.charAt(0)}
            </div>
            <h4 style="color:#ffffff; font-size:1rem;">${currentUser.name}</h4>
            <div style="font-size:0.8rem; color:#94a3b8;">${currentUser.email}</div>
            <span class="badge badge-secondary" style="margin-top:8px;">Referral Code: ${currentUser.referralCode}</span>
          </div>

          <ul class="portal-nav-menu">
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_CUSTOMER_PORTAL.switchTab('bookings'); return false;" class="${this.activeTab === 'bookings' ? 'active' : ''}"><i class="ri-calendar-event-line"></i> My Bookings</a></li>
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_CUSTOMER_PORTAL.switchTab('contracts'); return false;" class="${this.activeTab === 'contracts' ? 'active' : ''}"><i class="ri-file-paper-2-line"></i> Active Contracts</a></li>
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_CUSTOMER_PORTAL.switchTab('refunds'); return false;" class="${this.activeTab === 'refunds' ? 'active' : ''}"><i class="ri-refund-2-line"></i> Refund Tracker</a></li>
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_CUSTOMER_PORTAL.switchTab('referral'); return false;" class="${this.activeTab === 'referral' ? 'active' : ''}"><i class="ri-gift-line"></i> Referral Wallet</a></li>
            <li class="portal-nav-item"><a href="#" onclick="CLEAN_UAE_CUSTOMER_PORTAL.switchTab('addresses'); return false;" class="${this.activeTab === 'addresses' ? 'active' : ''}"><i class="ri-map-pin-line"></i> Saved Addresses</a></li>
          </ul>
        </aside>

        <!-- Main Content View -->
        <main class="portal-content">
          ${this.renderTabContent(bookings, contracts, refunds, currentUser)}
        </main>
      </div>
    `;
  },

  switchTab: function(tab) {
    this.activeTab = tab;
    this.render(document.getElementById('app-root'));
  },

  renderTabContent: function(bookings, contracts, refunds, user) {
    if (this.activeTab === 'bookings') {
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <h2 style="font-size:1.8rem; font-weight:800;">My Bookings & Tracker</h2>
            <p style="color:var(--text-muted);">Manage upcoming and completed cleaning appointments in Ajman.</p>
          </div>
          <button onclick="CLEAN_UAE_BOOKING_MODAL.open()" class="btn btn-primary"><i class="ri-add-line"></i> New Booking</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
          ${bookings.map(b => `
            <div class="card">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--border-color); padding-bottom:14px; margin-bottom:14px;">
                <div>
                  <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">REF: ${b.id}</span>
                  <h3 style="font-size:1.2rem; font-weight:700; margin-top:2px;">${b.serviceName}</h3>
                </div>
                <div>
                  ${window.CLEAN_UAE_COMMON.renderBadge(b.status)}
                  ${window.CLEAN_UAE_COMMON.renderBadge(b.paymentStatus)}
                </div>
              </div>

              <!-- Visual Status Progress Tracker -->
              <div style="margin:20px 0; background:var(--bg-main); padding:16px; border-radius:var(--border-radius-sm); border:1px solid var(--border-color);">
                <div style="font-size:0.8rem; font-weight:700; margin-bottom:10px; color:var(--text-muted);">LIVE SERVICE PROGRESS</div>
                <div style="display:flex; justify-content:space-between; position:relative;">
                  <div style="text-align:center; flex:1;">
                    <div style="width:28px; height:28px; border-radius:50%; background:var(--primary); color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold;">✓</div>
                    <div style="font-size:0.75rem; font-weight:600; margin-top:4px;">Booked</div>
                  </div>
                  <div style="text-align:center; flex:1;">
                    <div style="width:28px; height:28px; border-radius:50%; background:var(--primary); color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold;">✓</div>
                    <div style="font-size:0.75rem; font-weight:600; margin-top:4px;">Confirmed</div>
                  </div>
                  <div style="text-align:center; flex:1;">
                    <div style="width:28px; height:28px; border-radius:50%; background:${['assigned', 'in_progress', 'completed'].includes(b.status) ? 'var(--primary)' : '#cbd5e1'}; color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold;">${['assigned', 'in_progress', 'completed'].includes(b.status) ? '✓' : '3'}</div>
                    <div style="font-size:0.75rem; font-weight:600; margin-top:4px;">Staff Assigned</div>
                  </div>
                  <div style="text-align:center; flex:1;">
                    <div style="width:28px; height:28px; border-radius:50%; background:${['in_progress', 'completed'].includes(b.status) ? 'var(--accent)' : '#cbd5e1'}; color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold;">${['in_progress', 'completed'].includes(b.status) ? '✓' : '4'}</div>
                    <div style="font-size:0.75rem; font-weight:600; margin-top:4px;">In Progress</div>
                  </div>
                  <div style="text-align:center; flex:1;">
                    <div style="width:28px; height:28px; border-radius:50%; background:${b.status === 'completed' ? 'var(--accent)' : '#cbd5e1'}; color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold;">${b.status === 'completed' ? '✓' : '5'}</div>
                    <div style="font-size:0.75rem; font-weight:600; margin-top:4px;">Completed</div>
                  </div>
                </div>
              </div>

              <div class="grid grid-3" style="font-size:0.875rem; margin-bottom:16px;">
                <div><i class="ri-calendar-line" style="color:var(--primary);"></i> <strong>Date:</strong> ${b.date}</div>
                <div><i class="ri-time-line" style="color:var(--primary);"></i> <strong>Time:</strong> ${b.timeSlot}</div>
                <div><i class="ri-map-pin-line" style="color:var(--primary);"></i> <strong>Address:</strong> ${b.area}, ${b.address}</div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:14px;">
                <div>
                  <span style="font-size:0.8rem; color:var(--text-muted);">Total Amount (5% VAT Included):</span>
                  <strong style="font-size:1.2rem; color:var(--primary); margin-inline-start:6px;">${window.CLEAN_UAE_UTILS.formatCurrency(b.totalAmount)}</strong>
                </div>
                
                <div style="display:flex; gap:10px;">
                  <button onclick="CLEAN_UAE_MODAL.openRescheduleCareInfo('${b.id}')" class="btn btn-outline btn-sm">
                    <i class="ri-phone-line"></i> Reschedule / Cancel
                  </button>
                  <button onclick="CLEAN_UAE_NOTIFICATIONS.show('Tax Invoice for ${b.id} generated! (5% VAT Included)', 'success')" class="btn btn-primary btn-sm">
                    <i class="ri-download-2-line"></i> Tax Invoice
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (this.activeTab === 'contracts') {
      return `
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:16px;">Active Cleaning Contracts</h2>
        ${contracts.map(c => `
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <div>
                <span style="font-size:0.8rem; color:var(--text-muted);">CONTRACT REF: ${c.id}</span>
                <h3 style="font-size:1.3rem; font-weight:700;">${c.serviceName}</h3>
              </div>
              <span class="badge badge-success">${c.status.toUpperCase()}</span>
            </div>

            <div class="grid grid-3" style="margin-bottom:20px; text-align:center; background:var(--bg-main); padding:16px; border-radius:var(--border-radius-sm);">
              <div>
                <div style="font-size:1.6rem; font-weight:800; color:var(--primary);">${c.completedVisits}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">Visits Completed</div>
              </div>
              <div>
                <div style="font-size:1.6rem; font-weight:800; color:var(--secondary);">${c.remainingVisits}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">Visits Remaining</div>
              </div>
              <div>
                <div style="font-size:1.6rem; font-weight:800; color:var(--accent);">${c.totalVisits}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">Total Contract Visits</div>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.875rem;">
              <div>Schedule: <strong>${c.frequency}</strong> • Valid until <strong>${c.endDate}</strong></div>
              <div>Monthly Billing: <strong>AED ${c.monthlyPrice}</strong></div>
            </div>
          </div>
        `).join('')}
      `;
    } else if (this.activeTab === 'refunds') {
      return `
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:8px;">Refund Status Tracker</h2>
        <p style="color:var(--text-muted); margin-bottom:24px;">Track cancellations and online payment refunds under our 14-working-day SLA policy.</p>

        ${refunds.map(r => `
          <div class="card" style="border-inline-start:4px solid var(--secondary);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <div>
                <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">REFUND CASE: ${r.id}</span>
                <h3 style="font-size:1.1rem; font-weight:700;">Online Booking ${r.bookingId} Cancellation</h3>
              </div>
              <span class="badge badge-warning">IN PROGRESS (14 Working Days SLA)</span>
            </div>

            <div class="grid grid-4" style="background:var(--bg-main); padding:14px; border-radius:var(--border-radius-sm); font-size:0.85rem; margin-bottom:12px;">
              <div><strong>Amount:</strong> AED ${r.amount}</div>
              <div><strong>Cancelled On:</strong> ${r.cancellationDate}</div>
              <div><strong>Deadline:</strong> ${r.expectedDeadline}</div>
              <div><strong style="color:var(--secondary);">${r.workingDaysRemaining} Working Days</strong> Remaining</div>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted);">
              <i class="ri-information-line"></i> Refunds are calculated using the configured UAE business calendar (excluding Friday/Saturday).
            </div>
          </div>
        `).join('')}
      `;
    } else if (this.activeTab === 'referral') {
      return `
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:8px;">Referral Wallet & Credits</h2>
        <p style="color:var(--text-muted); margin-bottom:24px;">Share Clean UAE with friends in Ajman and earn AED 50 for every completed booking.</p>

        <div class="card" style="background:linear-gradient(135deg, #0284c7 0%, #0f172a 100%); color:#ffffff; margin-bottom:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.9rem; opacity:0.8;">YOUR AVAILABLE REFERRAL BALANCE</div>
              <div style="font-size:3rem; font-weight:800; color:#38bdf8;">AED ${user.referralBalance}</div>
              <div style="font-size:0.8rem; opacity:0.9;">Automatically applied at checkout on future bookings</div>
            </div>
            <div style="background:rgba(255,255,255,0.1); backdrop-filter:blur(6px); padding:16px 24px; border-radius:var(--border-radius); text-align:center;">
              <div style="font-size:0.8rem; opacity:0.8;">YOUR REFERRAL CODE</div>
              <div style="font-size:1.3rem; font-weight:800; letter-spacing:1px; color:#fde047; margin:4px 0;">${user.referralCode}</div>
              <button onclick="navigator.clipboard.writeText('${user.referralCode}'); CLEAN_UAE_NOTIFICATIONS.show('Referral code copied!', 'success');" class="btn btn-sm btn-secondary">Copy Code</button>
            </div>
          </div>
        </div>
      `;
    } else if (this.activeTab === 'addresses') {
      return `
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:16px;">Saved Addresses</h2>
        <div class="grid grid-2">
          ${(user.savedAddresses || []).map(a => `
            <div class="card">
              <h4 style="font-weight:700;"><i class="ri-map-pin-2-fill" style="color:var(--primary);"></i> ${a.emirate} — ${a.area}</h4>
              <p style="font-size:0.9rem; color:var(--text-muted); margin:8px 0;">${a.building}, ${a.street}</p>
              <div style="font-size:0.8rem; color:var(--text-muted);">Access Notes: ${a.notes}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }
};
