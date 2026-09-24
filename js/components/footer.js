/**
 * Clean UAE | تنظيف الفخامة — Footer Component
 */

window.CLEAN_UAE_FOOTER = {
  render: function() {
    var footerEl = document.getElementById('main-footer');
    if (!footerEl) return;

    footerEl.innerHTML = `
      <div style="background: var(--bg-sidebar); color: var(--text-sidebar); padding: 60px 0 20px; border-top: 1px solid var(--border-color);">
        <div class="container grid grid-4">
          <div>
            <a href="#home" class="brand-logo" style="color:#ffffff; margin-bottom:16px;">
              <i class="ri-sparkling-fill" style="color:var(--primary);"></i> Clean UAE
            </a>
            <p style="font-size:0.875rem; color:#94a3b8; margin-bottom: 20px;">
              The premier professional cleaning services platform operating under Clean UAE brand. Launched in Ajman, serving home and business contracts across the UAE.
            </p>
            <div style="display:flex; gap:12px; font-size:1.2rem;">
              <a href="#" style="color:#38bdf8;"><i class="ri-instagram-line"></i></a>
              <a href="#" style="color:#38bdf8;"><i class="ri-facebook-box-line"></i></a>
              <a href="#" style="color:#38bdf8;"><i class="ri-whatsapp-line"></i></a>
            </div>
          </div>

          <div>
            <h4 style="color:#ffffff; margin-bottom:16px;">Our Services</h4>
            <ul style="list-style:none; display:flex; flex-direction:column; gap:8px; font-size:0.875rem; color:#94a3b8;">
              <li><a href="#services" style="color:inherit; text-decoration:none;">Residential & Deep Cleaning</a></li>
              <li><a href="#services" style="color:inherit; text-decoration:none;">Sofa & Carpet Steam Wash</a></li>
              <li><a href="#services" style="color:inherit; text-decoration:none;">Move-In / Move-Out Cleaning</a></li>
              <li><a href="#services" style="color:inherit; text-decoration:none;">Water Tank Sanitization</a></li>
              <li><a href="#services" style="color:inherit; text-decoration:none;">Pest Control Services</a></li>
              <li><a href="#services" style="color:inherit; text-decoration:none;">Hourly Maid Services</a></li>
            </ul>
          </div>

          <div>
            <h4 style="color:#ffffff; margin-bottom:16px;">Ajman Coverage Areas</h4>
            <ul style="list-style:none; display:flex; flex-direction:column; gap:8px; font-size:0.875rem; color:#94a3b8;">
              <li>Al Nuaimia • Al Rashidiya</li>
              <li>Al Mowaihat • Al Jurf</li>
              <li>Al Rawda • Al Hamidiyah</li>
              <li style="margin-top:10px; color:#38bdf8; font-weight:600;">Expanding soon to Dubai & Sharjah!</li>
            </ul>
          </div>

          <div>
            <h4 style="color:#ffffff; margin-bottom:16px;">Headquarters & Contact</h4>
            <div style="font-size:0.875rem; color:#94a3b8; display:flex; flex-direction:column; gap:10px;">
              <div><i class="ri-map-pin-line" style="color:var(--primary);"></i> Clean UAE HQ, Al Rashidya 1, Ajman, UAE</div>
              <div><i class="ri-phone-line" style="color:var(--primary);"></i> Toll-Free: 800-CLEAN-UAE (+971 800 25326)</div>
              <div><i class="ri-mail-send-line" style="color:var(--primary);"></i> support@cleanuae.ae</div>
              <div><i class="ri-time-line" style="color:var(--primary);"></i> 7:00 AM – 10:00 PM GST (Mon – Sun)</div>
            </div>
          </div>
        </div>

        <div class="container" style="margin-top:40px; padding-top:20px; border-top: 1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; font-size:0.8rem; color:#64748b;">
          <div>© 2026 Clean UAE (تنظيف الفخامة). All rights reserved. Registered under UAE Commercial Law.</div>
          <div>5% UAE VAT Included on all Tax Invoices.</div>
        </div>
      </div>
    `;
  }
};
