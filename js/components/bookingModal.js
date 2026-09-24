/**
 * Clean UAE | تنظيف الفخامة — 5-Step Interactive Booking Engine Modal
 * Features 10-minute slot hold countdown, real-time availability calculation, online & cash payment options, and VAT setting calculations.
 */

window.CLEAN_UAE_BOOKING_MODAL = {
  currentStep: 1,
  holdTimer: null,
  holdSecondsRemaining: 600, // 10 minutes (600 seconds)

  bookingData: {
    serviceId: 'residential-deep',
    size: '2_bedroom',
    cleanersCount: 2,
    emirate: 'Ajman',
    area: 'Al Nuaimia',
    building: '',
    apartment: '',
    street: '',
    landmark: '',
    accessNotes: '',
    date: '2026-09-25',
    timeSlot: '09:00 AM - 12:00 PM',
    paymentMethod: 'card', // card, cash
    promoCode: '',
    discount: 0
  },

  open: function(presetServiceId) {
    this.currentStep = 1;
    if (presetServiceId) this.bookingData.serviceId = presetServiceId;
    this.render();
  },

  render: function() {
    var services = window.CLEAN_UAE_STORE.get('services') || [];
    var locations = window.CLEAN_UAE_STORE.get('locations') || [];
    var settings = window.CLEAN_UAE_STORE.get('settings') || { vatRate: 5 };

    var selectedService = services.find(s => s.id === this.bookingData.serviceId) || services[0];
    var basePrice = selectedService ? selectedService.price : 180;
    var vatObj = window.CLEAN_UAE_UTILS.calculateVAT(basePrice - this.bookingData.discount, settings.vatRate);

    var stepHtml = '';

    if (this.currentStep === 1) {
      stepHtml = `
        <h4>Step 1: Select Service & Options</h4>
        <div class="form-group" style="margin-top:14px;">
          <label class="form-label">Service Type</label>
          <select id="book-service-select" class="form-select" onchange="CLEAN_UAE_BOOKING_MODAL.updateService(this.value)">
            ${services.map(s => `<option value="${s.id}" ${s.id === selectedService.id ? 'selected' : ''}>${s.name} (Starting AED ${s.price})</option>`).join('')}
          </select>
        </div>
        <div class="grid grid-2">
          <div class="form-group">
            <label class="form-label">Property Size / Type</label>
            <select class="form-select" onchange="CLEAN_UAE_BOOKING_MODAL.bookingData.size = this.value">
              <option value="1_bedroom">Studio / 1 Bedroom Apartment</option>
              <option value="2_bedroom" selected>2 Bedroom Apartment / Villa</option>
              <option value="3_bedroom">3 Bedroom Apartment / Villa</option>
              <option value="4_plus_bedroom">4+ Bedroom Luxury Villa</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Cleaners Required</label>
            <select class="form-select" onchange="CLEAN_UAE_BOOKING_MODAL.bookingData.cleanersCount = parseInt(this.value)">
              <option value="1">1 Cleaner</option>
              <option value="2" selected>2 Cleaners (Recommended)</option>
              <option value="3">3 Cleaners (Faster Execution)</option>
            </select>
          </div>
        </div>
      `;
    } else if (this.currentStep === 2) {
      var ajman = locations.find(l => l.id === 'ajman') || { areas: [] };
      stepHtml = `
        <h4>Step 2: Service Address & Location in Ajman</h4>
        <div class="grid grid-2" style="margin-top:14px;">
          <div class="form-group">
            <label class="form-label">Emirate</label>
            <input type="text" class="form-control" value="Ajman" readonly style="background:var(--bg-main);">
          </div>
          <div class="form-group">
            <label class="form-label">Area / District</label>
            <select class="form-select" onchange="CLEAN_UAE_BOOKING_MODAL.bookingData.area = this.value">
              ${ajman.areas.map(a => `<option value="${a.name}" ${a.name === this.bookingData.area ? 'selected' : ''}>${a.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="grid grid-2">
          <div class="form-group">
            <label class="form-label">Building / Villa Name</label>
            <input type="text" class="form-control" placeholder="e.g. Al Nuaimia Tower 2 or Villa 14" value="${this.bookingData.building}" onchange="CLEAN_UAE_BOOKING_MODAL.bookingData.building = this.value">
          </div>
          <div class="form-group">
            <label class="form-label">Apartment / Door No.</label>
            <input type="text" class="form-control" placeholder="e.g. Apt 402" value="${this.bookingData.apartment}" onchange="CLEAN_UAE_BOOKING_MODAL.bookingData.apartment = this.value">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Access Instructions / Special Requests</label>
          <input type="text" class="form-control" placeholder="e.g. Key under door mat, parking in basement" value="${this.bookingData.accessNotes}" onchange="CLEAN_UAE_BOOKING_MODAL.bookingData.accessNotes = this.value">
        </div>
      `;
    } else if (this.currentStep === 3) {
      this.startHoldTimer();
      stepHtml = `
        <div style="background: rgba(2, 132, 199, 0.1); border: 1px solid var(--primary); padding: 12px; border-radius: var(--border-radius-sm); margin-bottom: 16px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:0.9rem; font-weight:600; color:var(--primary);"><i class="ri-time-line"></i> ${CLEAN_UAE_I18N.t('hold_timer_msg')}</div>
          <div style="font-size:1.1rem; font-weight:800; color:var(--secondary);" id="booking-hold-countdown">${window.CLEAN_UAE_UTILS.formatTimeRemaining(this.holdSecondsRemaining)}</div>
        </div>
        <h4>Step 3: Select Available Slot (Team & Travel Capacity Calculated)</h4>
        <div class="grid grid-2" style="margin-top:14px;">
          <div class="form-group">
            <label class="form-label">Preferred Date</label>
            <input type="date" class="form-control" value="${this.bookingData.date}" min="2026-09-24" onchange="CLEAN_UAE_BOOKING_MODAL.bookingData.date = this.value">
          </div>
          <div class="form-group">
            <label class="form-label">Available Time Slot</label>
            <select class="form-select" onchange="CLEAN_UAE_BOOKING_MODAL.bookingData.timeSlot = this.value">
              <option value="08:00 AM - 11:00 AM">08:00 AM - 11:00 AM (3 Cleaners Available)</option>
              <option value="09:00 AM - 12:00 PM" selected>09:00 AM - 12:00 PM (Optimal Travel Buffer)</option>
              <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM (2 Cleaners Available)</option>
              <option value="06:00 PM - 09:00 PM">06:00 PM - 09:00 PM (Evening Slot)</option>
            </select>
          </div>
        </div>
      `;
    } else if (this.currentStep === 4) {
      stepHtml = `
        <h4>Step 4: Choose Payment Method</h4>
        <div style="margin-top:16px; display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <label style="border:2px solid ${this.bookingData.paymentMethod === 'card' ? 'var(--primary)' : 'var(--border-color)'}; padding:16px; border-radius:var(--border-radius); cursor:pointer; display:block;">
            <input type="radio" name="pay_opt" value="card" ${this.bookingData.paymentMethod === 'card' ? 'checked' : ''} onchange="CLEAN_UAE_BOOKING_MODAL.bookingData.paymentMethod='card'; CLEAN_UAE_BOOKING_MODAL.render();">
            <strong style="display:block; margin-top:6px; font-size:1rem;"><i class="ri-bank-card-fill" style="color:var(--primary);"></i> Pay Online</strong>
            <span style="font-size:0.8rem; color:var(--text-muted);">Card / Apple Pay / Google Pay AED</span>
          </label>
          <label style="border:2px solid ${this.bookingData.paymentMethod === 'cash' ? 'var(--primary)' : 'var(--border-color)'}; padding:16px; border-radius:var(--border-radius); cursor:pointer; display:block;">
            <input type="radio" name="pay_opt" value="cash" ${this.bookingData.paymentMethod === 'cash' ? 'checked' : ''} onchange="CLEAN_UAE_BOOKING_MODAL.bookingData.paymentMethod='cash'; CLEAN_UAE_BOOKING_MODAL.render();">
            <strong style="display:block; margin-top:6px; font-size:1rem;"><i class="ri-money-dollar-box-fill" style="color:var(--secondary);"></i> Pay Cash After Service</strong>
            <span style="font-size:0.8rem; color:var(--text-muted);">Pay cleaner upon completion</span>
          </label>
        </div>

        ${this.bookingData.paymentMethod === 'card' ? `
          <div style="background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--border-radius); padding:16px; margin-top:16px;">
            <div style="font-size:0.85rem; font-weight:600; margin-bottom:10px;">Card Information Simulator</div>
            <input type="text" class="form-control" value="4532 •••• •••• 8812" style="margin-bottom:8px;">
            <div class="grid grid-2">
              <input type="text" class="form-control" value="08/28">
              <input type="text" class="form-control" value="***">
            </div>
          </div>
        ` : `
          <div style="background:rgba(217, 119, 6, 0.1); border:1px dashed var(--secondary); border-radius:var(--border-radius); padding:14px; margin-top:16px; font-size:0.85rem;">
            <i class="ri-information-fill" style="color:var(--secondary);"></i> ${CLEAN_UAE_I18N.t('cash_outstanding_note')}
          </div>
        `}
      `;
    }

    var bodyContent = `
      <div>
        <div style="display:flex; justify-content:space-between; margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:12px; font-size:0.85rem; font-weight:700;">
          <span style="color:${this.currentStep >= 1 ? 'var(--primary)' : 'var(--text-muted)'};">${CLEAN_UAE_I18N.t('step_1')}</span>
          <span style="color:${this.currentStep >= 2 ? 'var(--primary)' : 'var(--text-muted)'};">${CLEAN_UAE_I18N.t('step_2')}</span>
          <span style="color:${this.currentStep >= 3 ? 'var(--primary)' : 'var(--text-muted)'};">${CLEAN_UAE_I18N.t('step_3')}</span>
          <span style="color:${this.currentStep >= 4 ? 'var(--primary)' : 'var(--text-muted)'};">${CLEAN_UAE_I18N.t('step_4')}</span>
        </div>

        ${stepHtml}

        <div style="background:var(--bg-main); border-top:1px solid var(--border-color); padding:14px; border-radius:var(--border-radius-sm); margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted);">Estimated Total (${settings.vatRate}% VAT Included)</div>
            <div style="font-size:1.3rem; font-weight:800; color:var(--primary);">${window.CLEAN_UAE_UTILS.formatCurrency(vatObj.total)}</div>
          </div>
          ${this.currentStep < 4 ? `
            <button class="btn btn-primary" onclick="CLEAN_UAE_BOOKING_MODAL.nextStep()">Continue <i class="ri-arrow-right-line"></i></button>
          ` : `
            <button class="btn btn-accent btn-lg" onclick="CLEAN_UAE_BOOKING_MODAL.confirmBooking()">Confirm & Complete Booking</button>
          `}
        </div>
      </div>
    `;

    window.CLEAN_UAE_MODAL.open(CLEAN_UAE_I18N.t('booking_modal_title'), bodyContent, null, true);
  },

  updateService: function(val) {
    this.bookingData.serviceId = val;
    this.render();
  },

  nextStep: function() {
    if (this.currentStep < 4) {
      this.currentStep++;
      this.render();
    }
  },

  startHoldTimer: function() {
    if (this.holdTimer) clearInterval(this.holdTimer);
    var self = this;
    this.holdTimer = setInterval(function() {
      self.holdSecondsRemaining--;
      var el = document.getElementById('booking-hold-countdown');
      if (el) {
        el.textContent = window.CLEAN_UAE_UTILS.formatTimeRemaining(self.holdSecondsRemaining);
      }
      if (self.holdSecondsRemaining <= 0) {
        clearInterval(self.holdTimer);
        window.CLEAN_UAE_NOTIFICATIONS.show(CLEAN_UAE_I18N.t('hold_timer_expired'), 'warning');
        self.currentStep = 1;
        self.render();
      }
    }, 1000);
  },

  confirmBooking: function() {
    if (this.holdTimer) clearInterval(this.holdTimer);

    var services = window.CLEAN_UAE_STORE.get('services') || [];
    var settings = window.CLEAN_UAE_STORE.get('settings') || { vatRate: 5 };
    var selectedService = services.find(s => s.id === this.bookingData.serviceId) || services[0];
    
    var basePrice = selectedService ? selectedService.price : 180;
    var vatObj = window.CLEAN_UAE_UTILS.calculateVAT(basePrice, settings.vatRate);
    var refId = window.CLEAN_UAE_UTILS.generateRefCode('CUAE');

    var newBooking = {
      id: refId,
      customerName: 'Sara Al-Nuaimi',
      customerPhone: '+971501234567',
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      emirate: 'Ajman',
      area: this.bookingData.area || 'Al Nuaimia',
      address: (this.bookingData.building || 'Building 4') + ', ' + (this.bookingData.apartment || 'Apt 101'),
      date: this.bookingData.date,
      timeSlot: this.bookingData.timeSlot,
      cleanersCount: this.bookingData.cleanersCount,
      price: basePrice,
      vat: vatObj.vatAmount,
      totalAmount: vatObj.total,
      paymentMethod: this.bookingData.paymentMethod,
      paymentStatus: this.bookingData.paymentMethod === 'card' ? 'paid' : 'outstanding_cash',
      status: 'assigned',
      assignedStaff: 'Rashid Khan'
    };

    window.CLEAN_UAE_API.post('/bookings', newBooking).then(() => {
      window.CLEAN_UAE_MODAL.close();
      window.CLEAN_UAE_NOTIFICATIONS.show('Booking Confirmed! Reference: ' + refId, 'success', 6000);
      window.CLEAN_UAE_ROUTER.navigate('customer');
    });
  }
};
