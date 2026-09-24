/**
 * Clean UAE | تنظيف الفخامة — Public Website Pages Component
 * Renders Home, Services, Packages, Offers, Areas, About, Reviews, Contact views.
 */

window.CLEAN_UAE_PUBLIC_PAGES = {
  renderHome: function(root) {
    var store = window.CLEAN_UAE_STORE.get();
    var services = store.services || [];
    var reviews = store.reviews || [];

    root.innerHTML = `
      <!-- Hero Section -->
      <section class="hero">
        <div class="container hero-content">
          <div>
            <span class="badge badge-secondary" style="margin-bottom:12px; padding:6px 12px; font-size:0.85rem;">
              <i class="ri-map-pin-2-fill"></i> Launched in Ajman — Expanding Across UAE
            </span>
            <h1 class="hero-title">
              ${CLEAN_UAE_I18N.t('hero_title_1')} <span>${CLEAN_UAE_I18N.t('hero_title_2')}</span>
            </h1>
            <p class="hero-subtitle">${CLEAN_UAE_I18N.t('hero_subtitle')}</p>
            <div class="hero-actions">
              <button onclick="CLEAN_UAE_BOOKING_MODAL.open()" class="btn btn-primary btn-lg">
                <i class="ri-calendar-check-line"></i> ${CLEAN_UAE_I18N.t('hero_cta_book')}
              </button>
              <a href="#services" class="btn btn-outline btn-lg">
                <i class="ri-search-line"></i> ${CLEAN_UAE_I18N.t('hero_cta_services')}
              </a>
              <a href="tel:+97180025326" class="btn btn-secondary btn-lg">
                <i class="ri-phone-line"></i> ${CLEAN_UAE_I18N.t('hero_call_us')}
              </a>
            </div>
          </div>

          <div class="hero-image-card">
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80" alt="Clean UAE Service Team">
            <div style="position:absolute; bottom:16px; left:16px; right:16px; background:var(--glass-bg); backdrop-filter:blur(8px); padding:14px; border-radius:var(--border-radius); border:1px solid var(--glass-border); display:flex; align-items:center; gap:12px;">
              <i class="ri-shield-check-fill" style="font-size:2rem; color:var(--accent);"></i>
              <div>
                <strong style="display:block; font-size:0.95rem;">Municipality Approved & Insured</strong>
                <span style="font-size:0.8rem; color:var(--text-muted);">100% Eco-Friendly Detergents & Guaranteed Hygiene</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Service Highlights -->
      <section class="section container">
        <div style="text-align:center; max-width:700px; margin:0 auto 40px;">
          <h2 style="font-size:2.2rem; font-weight:800;">${CLEAN_UAE_I18N.t('services_heading')}</h2>
          <p style="color:var(--text-muted);">${CLEAN_UAE_I18N.t('services_subheading')}</p>
        </div>

        <div class="grid grid-4">
          ${services.slice(0, 8).map(s => `
            <div class="card card-hover" style="padding:0; overflow:hidden; display:flex; flex-direction:column;">
              <img src="${s.image}" alt="${s.name}" style="width:100%; height:180px; object-fit:cover;">
              <div style="padding:20px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <span class="badge badge-primary" style="margin-bottom:8px;">${s.category}</span>
                  <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:8px;">${CLEAN_UAE_I18N.currentLang === 'ar' ? s.nameAr : s.name}</h3>
                  <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">${CLEAN_UAE_I18N.currentLang === 'ar' ? s.descriptionAr : s.description}</p>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="font-size:0.8rem; color:var(--text-muted);">Starting</span>
                    <strong style="font-size:1.2rem; color:var(--primary);">AED ${s.price}</strong>
                  </div>
                  <button onclick="CLEAN_UAE_BOOKING_MODAL.open('${s.id}')" class="btn btn-primary" style="width:100%;">Book Now</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Trust & Features Section -->
      <section class="section" style="background:var(--bg-surface); border-top:1px solid var(--border-color); border-bottom:1px solid var(--border-color);">
        <div class="container">
          <div class="grid grid-4" style="text-align:center;">
            <div>
              <i class="ri-user-star-line" style="font-size:2.8rem; color:var(--primary); margin-bottom:12px; display:inline-block;"></i>
              <h4 style="font-size:1.1rem; font-weight:700;">${CLEAN_UAE_I18N.t('trust_1_title')}</h4>
              <p style="font-size:0.85rem; color:var(--text-muted);">${CLEAN_UAE_I18N.t('trust_1_desc')}</p>
            </div>
            <div>
              <i class="ri-timer-flash-line" style="font-size:2.8rem; color:var(--secondary); margin-bottom:12px; display:inline-block;"></i>
              <h4 style="font-size:1.1rem; font-weight:700;">${CLEAN_UAE_I18N.t('trust_2_title')}</h4>
              <p style="font-size:0.85rem; color:var(--text-muted);">${CLEAN_UAE_I18N.t('trust_2_desc')}</p>
            </div>
            <div>
              <i class="ri-award-line" style="font-size:2.8rem; color:var(--accent); margin-bottom:12px; display:inline-block;"></i>
              <h4 style="font-size:1.1rem; font-weight:700;">${CLEAN_UAE_I18N.t('trust_3_title')}</h4>
              <p style="font-size:0.85rem; color:var(--text-muted);">${CLEAN_UAE_I18N.t('trust_3_desc')}</p>
            </div>
            <div>
              <i class="ri-leaf-line" style="font-size:2.8rem; color:var(--info); margin-bottom:12px; display:inline-block;"></i>
              <h4 style="font-size:1.1rem; font-weight:700;">${CLEAN_UAE_I18N.t('trust_4_title')}</h4>
              <p style="font-size:0.85rem; color:var(--text-muted);">${CLEAN_UAE_I18N.t('trust_4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Before & After Showcase -->
      <section class="section container">
        <div style="text-align:center; max-width:700px; margin:0 auto 30px;">
          <h2 style="font-size:2rem; font-weight:800;">Before & After Quality Showcase</h2>
          <p style="color:var(--text-muted);">Real results delivered by Clean UAE teams across Ajman villas and apartments.</p>
        </div>

        <div class="grid grid-2">
          <div class="card" style="padding:16px;">
            <div style="position:relative; border-radius:var(--border-radius); overflow:hidden;">
              <img src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80" style="width:100%; height:260px; object-fit:cover;">
              <span class="badge badge-secondary" style="position:absolute; top:12px; left:12px;">BEFORE (Stained Sofa)</span>
              <span class="badge badge-success" style="position:absolute; bottom:12px; right:12px;">AFTER (Steam Sanitized)</span>
            </div>
            <h4 style="margin-top:14px; font-weight:700;">Living Room Sofa & Carpet Steam Extraction</h4>
          </div>

          <div class="card" style="padding:16px;">
            <div style="position:relative; border-radius:var(--border-radius); overflow:hidden;">
              <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80" style="width:100%; height:260px; object-fit:cover;">
              <span class="badge badge-secondary" style="position:absolute; top:12px; left:12px;">BEFORE (Greasy Tiles)</span>
              <span class="badge badge-success" style="position:absolute; bottom:12px; right:12px;">AFTER (Deep Scrubbed)</span>
            </div>
            <h4 style="margin-top:14px; font-weight:700;">Kitchen Grout & Appliance Degreasing</h4>
          </div>
        </div>
      </section>

      <!-- Statistics Banner -->
      <section class="section" style="background:linear-gradient(90deg, #0f172a 0%, #1e293b 100%); color:#ffffff;">
        <div class="container grid grid-4" style="text-align:center;">
          <div>
            <div style="font-size:2.8rem; font-weight:800; color:var(--primary-light);">1,240+</div>
            <div style="color:#94a3b8; font-size:0.9rem;">${CLEAN_UAE_I18N.t('stat_completed')}</div>
          </div>
          <div>
            <div style="font-size:2.8rem; font-weight:800; color:#fde047;">98.5%</div>
            <div style="color:#94a3b8; font-size:0.9rem;">${CLEAN_UAE_I18N.t('stat_customers')}</div>
          </div>
          <div>
            <div style="font-size:2.8rem; font-weight:800; color:#6ee7b7;">35+</div>
            <div style="color:#94a3b8; font-size:0.9rem;">${CLEAN_UAE_I18N.t('stat_staff')}</div>
          </div>
          <div>
            <div style="font-size:2.8rem; font-weight:800; color:#cbd5e1;">6</div>
            <div style="color:#94a3b8; font-size:0.9rem;">${CLEAN_UAE_I18N.t('stat_areas')}</div>
          </div>
        </div>
      </section>

      <!-- Reviews & Google Review Placeholder -->
      <section class="section container">
        <div style="text-align:center; max-width:700px; margin:0 auto 30px;">
          <h2 style="font-size:2rem; font-weight:800;">Genuine Customer Reviews</h2>
          <div style="margin-top:8px; display:inline-flex; align-items:center; gap:8px; background:var(--bg-surface); border:1px solid var(--border-color); padding:6px 14px; border-radius:9999px;">
            <i class="ri-google-fill" style="color:#ea4335;"></i> <strong>4.9 / 5.0 Rating</strong> on Google Reviews (Simulated)
          </div>
        </div>

        <div class="grid grid-2">
          ${reviews.map(r => `
            <div class="card">
              <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <strong>${r.author}</strong>
                <div>${window.CLEAN_UAE_COMMON.renderStars(r.rating)}</div>
              </div>
              <p style="font-size:0.9rem; color:var(--text-muted); font-style:italic;">"${r.text}"</p>
              <div style="margin-top:12px; font-size:0.75rem; color:var(--text-muted);"><i class="ri-checkbox-circle-fill" style="color:var(--accent);"></i> Verified Ajman Booking • ${r.date}</div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  },

  renderServices: function(root) {
    var services = window.CLEAN_UAE_STORE.get('services') || [];
    root.innerHTML = `
      <section class="section container">
        <h1 style="font-size:2.5rem; font-weight:800; margin-bottom:10px;">All Cleaning Services</h1>
        <p style="color:var(--text-muted); margin-bottom:30px;">Explore our complete catalog of home and commercial cleaning solutions in Ajman.</p>
        
        <div class="grid grid-3">
          ${services.map(s => `
            <div class="card card-hover" style="padding:0; overflow:hidden;">
              <img src="${s.image}" style="width:100%; height:200px; object-fit:cover;">
              <div style="padding:20px;">
                <span class="badge badge-primary">${s.category}</span>
                <h3 style="font-size:1.2rem; font-weight:700; margin:10px 0 6px;">${CLEAN_UAE_I18N.currentLang === 'ar' ? s.nameAr : s.name}</h3>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">${s.description}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:1.2rem; color:var(--primary);">AED ${s.price}</strong>
                  <button onclick="CLEAN_UAE_BOOKING_MODAL.open('${s.id}')" class="btn btn-primary btn-sm">Book Service</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  },

  renderPackages: function(root) {
    root.innerHTML = `
      <section class="section container">
        <h1 style="font-size:2.5rem; font-weight:800; margin-bottom:10px;">Monthly & Annual Contracts</h1>
        <p style="color:var(--text-muted); margin-bottom:30px;">Save up to 25% with custom recurring housekeeping schedules in Ajman.</p>

        <div class="grid grid-3">
          <div class="card" style="border-top:4px solid var(--primary); text-align:center;">
            <h3>Weekly Maid Visit</h3>
            <div style="font-size:2rem; font-weight:800; color:var(--primary); margin:14px 0;">AED 480 <span style="font-size:0.9rem; font-weight:400; color:var(--text-muted);">/ month</span></div>
            <ul style="list-style:none; margin-bottom:20px; font-size:0.9rem; color:var(--text-muted); display:flex; flex-direction:column; gap:8px;">
              <li>4 Visits per month</li>
              <li>3 Hours per visit</li>
              <li>Dedicated Cleaner Assigned</li>
              <li>Free Detergents Included</li>
            </ul>
            <button onclick="CLEAN_UAE_BOOKING_MODAL.open('cleaning-contract')" class="btn btn-primary" style="width:100%;">Subscribe Package</button>
          </div>

          <div class="card" style="border-top:4px solid var(--secondary); text-align:center; transform:scale(1.03); box-shadow:var(--shadow-lg);">
            <span class="badge badge-secondary" style="margin-bottom:8px;">MOST POPULAR</span>
            <h3>Bi-Weekly Deep Clean</h3>
            <div style="font-size:2rem; font-weight:800; color:var(--secondary); margin:14px 0;">AED 850 <span style="font-size:0.9rem; font-weight:400; color:var(--text-muted);">/ month</span></div>
            <ul style="list-style:none; margin-bottom:20px; font-size:0.9rem; color:var(--text-muted); display:flex; flex-direction:column; gap:8px;">
              <li>8 Visits per month</li>
              <li>4 Hours per visit</li>
              <li>2 Cleaners per visit</li>
              <li>Includes Sofa & Grout Treatment</li>
            </ul>
            <button onclick="CLEAN_UAE_BOOKING_MODAL.open('cleaning-contract')" class="btn btn-secondary" style="width:100%;">Subscribe Package</button>
          </div>

          <div class="card" style="border-top:4px solid var(--accent); text-align:center;">
            <h3>Annual Villa Care</h3>
            <div style="font-size:2rem; font-weight:800; color:var(--accent); margin:14px 0;">AED 7,800 <span style="font-size:0.9rem; font-weight:400; color:var(--text-muted);">/ year</span></div>
            <ul style="list-style:none; margin-bottom:20px; font-size:0.9rem; color:var(--text-muted); display:flex; flex-direction:column; gap:8px;">
              <li>52 Scheduled Visits</li>
              <li>Includes Water Tank Sanitization</li>
              <li>Pest Control Coverage Included</li>
              <li>Priority Rescheduling</li>
            </ul>
            <button onclick="CLEAN_UAE_BOOKING_MODAL.open('cleaning-contract')" class="btn btn-accent" style="width:100%;">Subscribe Package</button>
          </div>
        </div>
      </section>
    `;
  },

  renderOffers: function(root) {
    var offers = window.CLEAN_UAE_STORE.get('offers') || [];
    root.innerHTML = `
      <section class="section container">
        <h1 style="font-size:2.5rem; font-weight:800; margin-bottom:10px;">Promotional Offers & Promo Codes</h1>
        <p style="color:var(--text-muted); margin-bottom:30px;">Use promo codes at checkout for instant discounts on Clean UAE services.</p>

        <div class="grid grid-2">
          ${offers.map(o => `
            <div class="card" style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, rgba(2, 132, 199, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%);">
              <div>
                <span class="badge badge-secondary" style="font-size:1.1rem; padding:6px 14px; letter-spacing:1px; margin-bottom:8px; border:1px dashed var(--secondary);">${o.code}</span>
                <h3 style="font-weight:700; margin:6px 0;">${o.discount}</h3>
                <p style="font-size:0.85rem; color:var(--text-muted);">${o.description}</p>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px;">Expires: ${o.expiry}</div>
              </div>
              <button onclick="navigator.clipboard.writeText('${o.code}'); CLEAN_UAE_NOTIFICATIONS.show('Promo code ${o.code} copied!', 'success');" class="btn btn-outline btn-sm">Copy Code</button>
            </div>
          `).join('')}
        </div>

        <div class="card" style="margin-top:40px; padding:32px; text-align:center;">
          <h3>Subscribe for Exclusive Ajman Offers</h3>
          <p style="color:var(--text-muted); margin-bottom:16px;">Get seasonal deals and discount codes directly to your inbox.</p>
          <div style="max-width:500px; margin:0 auto; display:flex; gap:10px;">
            <input type="email" id="newsletter-email-input" class="form-control" placeholder="Enter your email address...">
            <button onclick="CLEAN_UAE_PUBLIC_PAGES.subscribeNewsletter()" class="btn btn-primary">Subscribe</button>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:10px;">
            By subscribing, you agree to receive Clean UAE promotional updates. You can unsubscribe anytime.
          </div>
        </div>
      </section>
    `;
  },

  subscribeNewsletter: function() {
    var email = document.getElementById('newsletter-email-input').value;
    if (!window.CLEAN_UAE_VALIDATION.isValidEmail(email)) {
      window.CLEAN_UAE_NOTIFICATIONS.show('Please enter a valid email address.', 'danger');
      return;
    }
    var subs = window.CLEAN_UAE_STORE.get('subscribers') || [];
    subs.push({ email: email, date: new Date().toISOString().split('T')[0], status: 'subscribed' });
    window.CLEAN_UAE_STORE.update('subscribers', subs);
    window.CLEAN_UAE_NOTIFICATIONS.show('Thank you for subscribing to Clean UAE offers!', 'success');
    document.getElementById('newsletter-email-input').value = '';
  },

  renderAreas: function(root) {
    var locations = window.CLEAN_UAE_STORE.get('locations') || [];
    var ajman = locations.find(l => l.id === 'ajman') || { areas: [] };
    root.innerHTML = `
      <section class="section container">
        <h1 style="font-size:2.5rem; font-weight:800; margin-bottom:10px;">Areas We Serve</h1>
        <p style="color:var(--text-muted); margin-bottom:30px;">Currently operating with full team availability across all major Ajman neighborhoods.</p>

        <div class="card" style="margin-bottom:30px;">
          <h3 style="margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            <i class="ri-map-pin-2-fill" style="color:var(--primary);"></i> Ajman Active Neighborhoods
          </h3>
          <div class="grid grid-3">
            ${ajman.areas.map(a => `
              <div style="background:var(--bg-main); border:1px solid var(--border-color); padding:14px; border-radius:var(--border-radius-sm); font-weight:600; display:flex; justify-content:space-between; align-items:center;">
                <span>${a.name} (${a.nameAr})</span>
                <span class="badge badge-success">Active</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card" style="background:rgba(0,0,0,0.02);">
          <h3 style="margin-bottom:16px; color:var(--text-muted);">Future UAE Emirates Expansion</h3>
          <div class="grid grid-3">
            ${locations.filter(l => l.id !== 'ajman').map(l => `
              <div style="background:var(--bg-surface); border:1px solid var(--border-color); padding:14px; border-radius:var(--border-radius-sm); opacity:0.75; display:flex; justify-content:space-between; align-items:center;">
                <span>${l.name} (${l.nameAr})</span>
                <span class="badge badge-warning">Coming Soon</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  },

  renderAbout: function(root) {
    root.innerHTML = `
      <section class="section container">
        <h1 style="font-size:2.5rem; font-weight:800; margin-bottom:10px;">About Clean UAE (تنظيف الفخامة)</h1>
        <p style="color:var(--text-muted); margin-bottom:30px;">Your trusted partner for home and commercial hygiene operating under our company's brand in the United Arab Emirates.</p>
        <div class="card">
          <p style="line-height:1.8;">
            Clean UAE was established to deliver world-class cleaning services with 100% transparency, instant online slot booking, and flexible cash after service options. Operating primarily in Ajman, our trained team of cleaners adheres to strict municipality sanitization protocols, utilizing eco-friendly chemicals and state-of-the-art steam extraction machinery.
          </p>
        </div>
      </section>
    `;
  },

  renderReviews: function(root) {
    this.renderHome(root);
  },

  renderContact: function(root) {
    root.innerHTML = `
      <section class="section container">
        <h1 style="font-size:2.5rem; font-weight:800; margin-bottom:10px;">Contact Customer Care</h1>
        <div class="grid grid-2" style="margin-top:20px;">
          <div class="card">
            <h3>Get in Touch</h3>
            <p style="color:var(--text-muted); margin-bottom:20px;">Our customer support team is available 7 days a week.</p>
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div><strong>Helpline:</strong> 800-CLEAN-UAE (+971 800 25326)</div>
              <div><strong>WhatsApp:</strong> +971 50 123 4567</div>
              <div><strong>Email:</strong> support@cleanuae.ae</div>
              <div><strong>HQ Office:</strong> Al Rashidiya 1, Ajman, UAE</div>
            </div>
          </div>
          <div class="card" style="background:var(--bg-main); text-align:center; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:40px;">
            <i class="ri-map-pin-user-line" style="font-size:3.5rem; color:var(--primary);"></i>
            <h4 style="margin-top:14px;">Google Maps Location</h4>
            <p style="color:var(--text-muted); font-size:0.85rem;">Ajman Headquarters Map Coordinates (Simulated)</p>
          </div>
        </div>
      </section>
    `;
  }
};
