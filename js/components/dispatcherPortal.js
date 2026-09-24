/**
 * Clean UAE | تنظيف الفخامة — Dispatcher Portal & Schedule Matrix
 * Interactive operations dispatch timeline, staff assignment matrix, and unassigned job queue.
 */

window.CLEAN_UAE_DISPATCHER_PORTAL = {
  render: function(root) {
    var store = window.CLEAN_UAE_STORE.get();
    var bookings = store.bookings || [];
    var users = store.users || [];
    var cleaners = users.filter(u => u.role === 'staff' || u.staffRole);

    root.innerHTML = `
      <div class="container" style="padding: 24px 0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <div>
            <h2 style="font-size:1.8rem; font-weight:800;">Dispatcher Operations Matrix</h2>
            <p style="color:var(--text-muted);">Real-time dispatch control for Ajman cleaner schedules, travel buffers, and team assignments.</p>
          </div>
          <div style="display:flex; gap:10px;">
            <button onclick="CLEAN_UAE_NOTIFICATIONS.show('Auto-dispatch optimizer applied!', 'success')" class="btn btn-primary btn-sm"><i class="ri-magic-line"></i> Auto-Optimize Route</button>
          </div>
        </div>

        <!-- Dispatch Matrix Schedule Table -->
        <div class="card" style="margin-bottom:24px; padding:0; overflow:hidden;">
          <div style="padding:16px; background:var(--bg-main); border-bottom:1px solid var(--border-color); font-weight:700;">
            <i class="ri-calendar-event-line" style="color:var(--primary);"></i> Today's Schedule Timeline — Thursday, 24 Sept 2026
          </div>
          
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Cleaner / Team</th>
                  <th>08:00 AM – 11:00 AM</th>
                  <th>11:00 AM – 02:00 PM</th>
                  <th>02:00 PM – 05:00 PM</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${cleaners.map(c => {
                  var assignedJobs = bookings.filter(b => b.assignedStaff === c.name);
                  return `
                    <tr>
                      <td style="font-weight:700;">
                        <div>${c.name}</div>
                        <div style="font-size:0.75rem; color:var(--text-muted);">${c.staffRole || 'Cleaner'}</div>
                      </td>
                      <td>
                        ${assignedJobs.find(b => b.timeSlot.includes('08:00 AM') || b.timeSlot.includes('09:00 AM')) ? `
                          <div style="background:rgba(2, 132, 199, 0.15); border:1px solid var(--primary); padding:6px 10px; border-radius:6px; font-size:0.8rem;">
                            <strong>${assignedJobs[0].id}</strong> • ${assignedJobs[0].serviceName}<br>
                            <span style="color:var(--text-muted);">${assignedJobs[0].area}</span>
                          </div>
                        ` : `<span style="color:var(--text-muted); font-size:0.8rem;">Available Slot</span>`}
                      </td>
                      <td>
                        <span style="color:var(--text-muted); font-size:0.8rem;">Travel & Lunch Buffer</span>
                      </td>
                      <td>
                        ${assignedJobs.find(b => b.timeSlot.includes('02:00 PM')) ? `
                          <div style="background:rgba(245, 158, 11, 0.15); border:1px solid var(--warning); padding:6px 10px; border-radius:6px; font-size:0.8rem;">
                            <strong>${assignedJobs.find(b => b.timeSlot.includes('02:00 PM')).id}</strong> • Sofa Clean<br>
                            <span style="color:var(--text-muted);">${assignedJobs.find(b => b.timeSlot.includes('02:00 PM')).area}</span>
                          </div>
                        ` : `<span style="color:var(--text-muted); font-size:0.8rem;">Available Slot</span>`}
                      </td>
                      <td><span class="badge badge-success">ON DUTY</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- All Active Bookings Queue -->
        <div class="card">
          <h3 style="font-weight:700; margin-bottom:16px;">Active Dispatch Queue & Re-Assignment</h3>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Service</th>
                  <th>Location</th>
                  <th>Time Slot</th>
                  <th>Assigned Staff</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${bookings.map(b => `
                  <tr>
                    <td style="font-weight:700;">${b.id}</td>
                    <td>${b.serviceName}</td>
                    <td>${b.area}, Ajman</td>
                    <td>${b.timeSlot}</td>
                    <td><strong>${b.assignedStaff || 'Unassigned'}</strong></td>
                    <td>${window.CLEAN_UAE_COMMON.renderBadge(b.status)}</td>
                    <td>
                      <button onclick="CLEAN_UAE_NOTIFICATIONS.show('Reassigned ${b.id} to Cleaner Team B', 'info')" class="btn btn-outline btn-sm">Re-assign</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
};
