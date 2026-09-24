/**
 * Clean UAE | تنظيف الفخامة — Staff Field App & Mobile Task Workflow
 * Mobile-first interface featuring GPS clock-in, 8-stage task workflow, mobile before/after photo upload, delay reporting, and chemical log.
 */

window.CLEAN_UAE_STAFF_PORTAL = {
  currentTaskStage: 'arrived', // assigned, accepted, departed, arrived, in_progress, finished, report_submitted
  beforePhotos: [],
  afterPhotos: [],

  render: function(root) {
    var store = window.CLEAN_UAE_STORE.get();
    var users = store.users || [];
    var staffUser = users.find(u => u.role === 'staff') || users[1];
    var bookings = store.bookings || [];
    var currentBooking = bookings.find(b => b.assignedStaff === staffUser.name || b.status === 'in_progress') || bookings[0];

    root.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto; padding: 16px;">
        <!-- Staff Shift & Attendance Banner -->
        <div class="card" style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color:#ffffff; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.8rem; color:#94a3b8;">TODAY'S SHIFT • CLEANER FIELD APP</div>
              <h3 style="font-size:1.2rem; font-weight:700;">${staffUser.name}</h3>
              <div style="font-size:0.8rem; color:#38bdf8; margin-top:2px;">
                <i class="ri-map-pin-user-line"></i> Location Verified — Demo GPS
              </div>
            </div>
            <button onclick="CLEAN_UAE_STAFF_PORTAL.toggleAttendance()" class="btn btn-sm btn-accent" id="btn-clock-toggle">
              <i class="ri-time-line"></i> Clock Out
            </button>
          </div>
        </div>

        <!-- Task Details & Stage Progress Bar -->
        <div class="card" style="margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span class="badge badge-primary">ACTIVE TASK #${currentBooking.id}</span>
            <span class="badge badge-warning" id="staff-task-stage-badge">${this.currentTaskStage.toUpperCase()}</span>
          </div>

          <h3 style="font-size:1.2rem; font-weight:700;">${currentBooking.serviceName}</h3>
          <div style="font-size:0.9rem; color:var(--text-muted); margin-top:4px;">
            <i class="ri-user-line"></i> Client: <strong>${currentBooking.customerName}</strong> (${currentBooking.customerPhone})
          </div>
          <div style="font-size:0.9rem; color:var(--text-muted); margin-top:4px;">
            <i class="ri-map-pin-line"></i> Address: <strong>${currentBooking.area}, ${currentBooking.address}</strong>
          </div>

          <!-- Workflow Action Buttons -->
          <div style="margin-top:16px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <button onclick="CLEAN_UAE_STAFF_PORTAL.updateTaskStage('departed')" class="btn btn-outline btn-sm"><i class="ri-car-line"></i> Departed</button>
            <button onclick="CLEAN_UAE_STAFF_PORTAL.updateTaskStage('arrived')" class="btn btn-primary btn-sm"><i class="ri-building-line"></i> Arrived</button>
            <button onclick="CLEAN_UAE_STAFF_PORTAL.updateTaskStage('in_progress')" class="btn btn-accent btn-sm"><i class="ri-play-line"></i> Start Work</button>
            <button onclick="CLEAN_UAE_STAFF_PORTAL.openDelayReportModal()" class="btn btn-secondary btn-sm"><i class="ri-alarm-warning-line"></i> Report Delay</button>
          </div>
        </div>

        <!-- Before & After Photos Module -->
        <div class="card" style="margin-bottom:16px;">
          <h4 style="font-weight:700; margin-bottom:12px;"><i class="ri-camera-lens-line" style="color:var(--primary);"></i> Mobile Job Photos & Checklist</h4>
          
          <!-- Before Photos -->
          <div style="margin-bottom:16px; background:var(--bg-main); padding:12px; border-radius:var(--border-radius-sm);">
            <div style="font-size:0.85rem; font-weight:700; margin-bottom:8px; display:flex; justify-content:space-between;">
              <span>BEFORE CLEANING (Damage & Stain Check)</span>
              <button onclick="CLEAN_UAE_STAFF_PORTAL.simulatePhotoUpload('before')" class="btn btn-outline btn-sm" style="padding:2px 8px; font-size:0.75rem;">+ Add Photo</button>
            </div>
            <div id="before-photo-preview" style="display:flex; gap:8px; overflow-x:auto;">
              <div style="width:70px; height:70px; background:#cbd5e1; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:#475569; text-align:center;">
                Sofa Stain
              </div>
            </div>
          </div>

          <!-- After Photos -->
          <div style="background:var(--bg-main); padding:12px; border-radius:var(--border-radius-sm);">
            <div style="font-size:0.85rem; font-weight:700; margin-bottom:8px; display:flex; justify-content:space-between;">
              <span>AFTER CLEANING (Final Completion)</span>
              <button onclick="CLEAN_UAE_STAFF_PORTAL.simulatePhotoUpload('after')" class="btn btn-outline btn-sm" style="padding:2px 8px; font-size:0.75rem;">+ Add Photo</button>
            </div>
            <div id="after-photo-preview" style="display:flex; gap:8px; overflow-x:auto;">
              <div style="width:70px; height:70px; background:#6ee7b7; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:#065f46; text-align:center;">
                Cleaned
              </div>
            </div>
          </div>
        </div>

        <!-- Chemical & Material Usage Log -->
        <div class="card" style="margin-bottom:16px;">
          <h4 style="font-weight:700; margin-bottom:10px;"><i class="ri-flask-line" style="color:var(--secondary);"></i> Material & Chemical Allowance</h4>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:10px;">Job Allowance: 500ml Disinfectant • 4 Microfiber Cloths</div>
          <div class="form-group">
            <label class="form-label" style="font-size:0.8rem;">Actual Chemical Used (ml)</label>
            <input type="text" id="staff-chem-used" class="form-control" value="500ml">
          </div>
          <button onclick="CLEAN_UAE_STAFF_PORTAL.requestExtraChemical()" class="btn btn-outline btn-sm" style="width:100%;">
            <i class="ri-add-circle-line"></i> Request Extra Chemical Approval
          </button>
        </div>

        <!-- Final Report Submit Button -->
        <button onclick="CLEAN_UAE_STAFF_PORTAL.submitCompletionReport('${currentBooking.id}')" class="btn btn-accent btn-lg" style="width:100%;">
          <i class="ri-checkbox-circle-line"></i> Submit Final Completion Report
        </button>
      </div>
    `;
  },

  toggleAttendance: function() {
    var btn = document.getElementById('btn-clock-toggle');
    if (btn.innerText.includes('Clock Out')) {
      btn.innerText = 'Clock In';
      btn.className = 'btn btn-sm btn-primary';
      window.CLEAN_UAE_NOTIFICATIONS.show('Clocked Out. Shift ended.', 'info');
    } else {
      btn.innerText = 'Clock Out';
      btn.className = 'btn btn-sm btn-accent';
      window.CLEAN_UAE_NOTIFICATIONS.show('Clocked In! Location verified — Demo GPS Ajman.', 'success');
    }
  },

  updateTaskStage: function(stage) {
    this.currentTaskStage = stage;
    var el = document.getElementById('staff-task-stage-badge');
    if (el) el.innerText = stage.toUpperCase();
    window.CLEAN_UAE_NOTIFICATIONS.show('Task status updated to: ' + stage, 'info');
  },

  simulatePhotoUpload: function(type) {
    var previewId = type === 'before' ? 'before-photo-preview' : 'after-photo-preview';
    var el = document.getElementById(previewId);
    if (el) {
      var photoDiv = document.createElement('div');
      photoDiv.style.cssText = 'width:70px; height:70px; background:var(--primary); color:#fff; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:0.65rem; text-align:center; padding:4px;';
      photoDiv.innerText = type === 'before' ? 'Before #' + (el.children.length + 1) : 'After #' + (el.children.length + 1);
      el.appendChild(photoDiv);
    }
    window.CLEAN_UAE_NOTIFICATIONS.show('Captured mobile ' + type + ' photo!', 'success');
  },

  openDelayReportModal: function() {
    var body = `
      <div class="form-group">
        <label class="form-label">Delay Reason</label>
        <select id="delay-reason-select" class="form-select">
          <option value="traffic">Severe Ajman Traffic / Road Closure</option>
          <option value="access">Access Gate Key Delayed</option>
          <option value="equipment">Specialized Steam Machine Preparation</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Revised Arrival Estimate (ETA)</label>
        <input type="time" id="delay-eta-input" class="form-control" value="09:30">
      </div>
    `;
    var footer = `
      <button onclick="CLEAN_UAE_STAFF_PORTAL.submitDelayReport()" class="btn btn-secondary">Notify Dispatcher & Customer</button>
      <button onclick="CLEAN_UAE_MODAL.close()" class="btn btn-outline">Cancel</button>
    `;
    window.CLEAN_UAE_MODAL.open('Report Unexpected Delay', body, footer, false);
  },

  submitDelayReport: function() {
    var reason = document.getElementById('delay-reason-select').value;
    var eta = document.getElementById('delay-eta-input').value;
    window.CLEAN_UAE_MODAL.close();
    window.CLEAN_UAE_NOTIFICATIONS.show('Delay Alert dispatched to Customer & Ops Desk! Revised ETA: ' + eta, 'warning', 6000);
  },

  requestExtraChemical: function() {
    window.CLEAN_UAE_NOTIFICATIONS.show('Extra Chemical Request sent to Supervisor Ahmad for approval.', 'info');
  },

  submitCompletionReport: function(bookingId) {
    var bookings = window.CLEAN_UAE_STORE.get('bookings') || [];
    var found = bookings.find(b => b.id === bookingId);
    if (found) {
      found.status = 'completed';
      window.CLEAN_UAE_STORE.update('bookings', bookings);
    }
    window.CLEAN_UAE_NOTIFICATIONS.show('Completion Report & Photos submitted! Job marked COMPLETED.', 'success', 6000);
  }
};
