/**
 * Clean UAE | تنظيف الفخامة — Centralized Bilingual Translation System
 * Provides seamless English (LTR) & Arabic (RTL) dictionary and helper methods.
 */

window.CLEAN_UAE_I18N = {
  currentLang: 'en',

  translations: {
    en: {
      company_name: 'Clean UAE',
      company_name_ar: 'تنظيف الفخامة',
      tagline: 'Professional Cleaning Services You Can Trust',
      demo_mode: 'DEMO MODE — Clean UAE Frontend',
      quick_role_switch: 'Switch View / Role:',
      reset_data: 'Reset Data',
      
      // Nav
      nav_home: 'Home',
      nav_services: 'Services',
      nav_packages: 'Packages & Contracts',
      nav_offers: 'Offers',
      nav_areas: 'Areas We Serve',
      nav_about: 'About Us',
      nav_reviews: 'Reviews',
      nav_contact: 'Contact',
      nav_book_now: 'Book Now',
      nav_portal: 'My Account',

      // Hero
      hero_title_1: 'Professional Cleaning Services',
      hero_title_2: 'You Can Trust in Ajman & UAE',
      hero_subtitle: 'Residential, sofa, carpet, water tank, and pest control services. Book online in seconds with instant confirmation and cash after service.',
      hero_cta_book: 'Book Service Now',
      hero_cta_services: 'Explore Services',
      hero_call_us: 'Call Customer Care',

      // Services Highlights
      services_heading: 'Our Premium Services',
      services_subheading: 'Tailored hygiene and cleaning solutions operated entirely under Clean UAE brand.',
      cat_residential: 'Residential & Deep',
      cat_specialized: 'Sofa, Carpet & Mattress',
      cat_maid: 'Maid & Housekeeping',
      cat_contract: 'Contracts & Commercial',

      // Trust Section
      trust_1_title: 'Professional Staff',
      trust_1_desc: 'Trained, vetted, and background-checked cleaners.',
      trust_2_title: 'Reliable Scheduling',
      trust_2_desc: 'Real-time slot calculation based on actual availability.',
      trust_3_title: 'Quality Service',
      trust_3_desc: '100% satisfaction guarantee with before & after photo proof.',
      trust_4_title: 'Safe Materials',
      trust_4_desc: 'Eco-friendly and municipality-approved sanitizers.',

      // Stats
      stat_completed: 'Services Completed',
      stat_customers: 'Happy Customers',
      stat_staff: 'Active Cleaners',
      stat_areas: 'Ajman Areas',

      // Booking Engine
      booking_modal_title: 'Book a Cleaning Service',
      step_1: '1. Service & Options',
      step_2: '2. Location & Address',
      step_3: '3. Choose Time Slot',
      step_4: '4. Payment Method',
      step_5: '5. Confirmation',
      
      pay_online: 'Pay Online (Card / Digital Wallet)',
      pay_cash: 'Pay Cash After Service',
      cash_outstanding_note: 'Payment will be marked as Outstanding Cash upon booking submission.',
      hold_timer_msg: 'Your selected slot is temporarily reserved.',
      hold_timer_expired: 'Hold expired! Please re-select a slot.',
      
      // Portals & Roles
      role_public: 'Public Visitor',
      role_customer: 'Customer Portal',
      role_staff: 'Staff Field App',
      role_dispatcher: 'Dispatcher Schedule Matrix',
      role_finance: 'Finance & Cash Portal',
      role_admin: 'Admin & Owner Control Center',

      // General Buttons
      btn_save: 'Save Changes',
      btn_cancel: 'Cancel',
      btn_submit: 'Submit',
      btn_close: 'Close',
      btn_details: 'View Details',
      btn_reschedule: 'Contact Care to Reschedule',
      btn_clock_in: 'Clock In (GPS Verified)',
      btn_clock_out: 'Clock Out',

      // Labels & Statuses
      status_booked: 'Booked',
      status_confirmed: 'Confirmed',
      status_assigned: 'Staff Assigned',
      status_in_progress: 'In Progress',
      status_completed: 'Completed',
      status_cancelled: 'Cancelled',
      status_paid: 'Paid Online',
      status_outstanding_cash: 'Outstanding Cash',

      // Refunds & SLA
      refund_sla_title: '14 Working Days Refund SLA Tracker',
      complaint_sla_title: 'Customer Complaint SLA Workflow'
    },

    ar: {
      company_name: 'تنظيف الفخامة',
      company_name_ar: 'Clean UAE',
      tagline: 'خدمات تنظيف احترافية تثق بها في عجمان والإمارات',
      demo_mode: 'وضع العرض التوضيحي — واجهة تنظيف الفخامة',
      quick_role_switch: 'تبديل الدور / الواجهة:',
      reset_data: 'إعادة ضبط البيانات',

      // Nav
      nav_home: 'الرئيسية',
      nav_services: 'خدماتنا',
      nav_packages: 'الباقات والعقود',
      nav_offers: 'العروض',
      nav_areas: 'المناطق والمدن',
      nav_about: 'من نحن',
      nav_reviews: 'تقييمات العملاء',
      nav_contact: 'اتصل بنا',
      nav_book_now: 'احجز الآن',
      nav_portal: 'حسابي',

      // Hero
      hero_title_1: 'خدمات تنظيف احترافية',
      hero_title_2: 'تثق بها في عجمان وجميع الإمارات',
      hero_subtitle: 'خدمات تنظيف المنازل، الكنب، السجاد، خزانات المياه ومكافحة الحشرات. احجز أونلاين في ثوانٍ مع تأكيد فوري وخيار الدفع نقداً بعد الخدمة.',
      hero_cta_book: 'احجز خدمتك الآن',
      hero_cta_services: 'استكشف الخدمات',
      hero_call_us: 'اتصل بخدمة العملاء',

      // Services Highlights
      services_heading: 'خدماتنا المتميزة',
      services_subheading: 'حلول نضافة وتعقيم متكاملة تدار بالكامل تحت علامة تنظيف الفخامة.',
      cat_residential: 'التنظيف السكني والشامل',
      cat_specialized: 'الكنب والسجاد والمفارش',
      cat_maid: 'خدمة العاملات بالساعة',
      cat_contract: 'العقود الدورية والتجارية',

      // Trust Section
      trust_1_title: 'كادر احترافي مدرب',
      trust_1_desc: 'عمالة موثوقة ومفحوصة بالكامل مع خبرة عالية.',
      trust_2_title: 'مواعيد دقيقة وصارمة',
      trust_2_desc: 'حساب فوري للمواعيد بناءً على توفر الفريق ووقت التنقل.',
      trust_3_title: 'جودة استثنائية',
      trust_3_desc: 'ضمان رضا 100% مع صور ما قبل وبعد الخدمة.',
      trust_4_title: 'مواد آمنة ومصرحة',
      trust_4_desc: 'منظفات صديقة للبيئة ومعتمدة من البلدية.',

      // Stats
      stat_completed: 'خدمة مكتملة',
      stat_customers: 'عميل سعيد',
      stat_staff: 'عامل تنظيف محترف',
      stat_areas: 'مناطق عجمان المغطاة',

      // Booking Engine
      booking_modal_title: 'حجز خدمة تنظيف',
      step_1: '1. الخدمة والخيارات',
      step_2: '2. الموقع والعنوان',
      step_3: '3. اختيار الموعد',
      step_4: '4. طريقة الدفع',
      step_5: '5. تأكيد الحجز',

      pay_online: 'الدفع أونلاين (بطاقة / محفظة رقمية)',
      pay_cash: 'الدفع نقداً بعد الخدمة',
      cash_outstanding_note: 'سيتم تسجيل الدفع كـ "مبلغ نقدي معلق" فور تأكيد الحجز.',
      hold_timer_msg: 'الموعد المحدد محجوز لك مؤقتاً.',
      hold_timer_expired: 'انتهت مهلة الحجز المؤقت! يرجى إعادة اختيار الموعد.',

      // Portals & Roles
      role_public: 'زائر الموقع',
      role_customer: 'بوابة العميل',
      role_staff: 'تطبيق فريق العمل',
      role_dispatcher: 'جدول المنسق والعمليات',
      role_finance: 'بوابة المالية والنقد',
      role_admin: 'مركز التحكم والإدارة HQ',

      // General Buttons
      btn_save: 'حفظ التغييرات',
      btn_cancel: 'إلغاء',
      btn_submit: 'إرسال',
      btn_close: 'إغلاق',
      btn_details: 'عرض التفاصيل',
      btn_reschedule: 'تواصل مع خدمة العملاء للتأجيل',
      btn_clock_in: 'تسجيل الحضور (GPS)',
      btn_clock_out: 'تسجيل الانصراف',

      // Labels & Statuses
      status_booked: 'موجوز',
      status_confirmed: 'مؤكد',
      status_assigned: 'تم تعيين الفريق',
      status_in_progress: 'قيد التنفيذ',
      status_completed: 'مكتمل',
      status_cancelled: 'ملغي',
      status_paid: 'مدفوع أونلاين',
      status_outstanding_cash: 'نقدي معلق',

      // Refunds & SLA
      refund_sla_title: 'متبع الاسترداد (14 يوم عمل)',
      complaint_sla_title: 'مسار معالجة الشكاوى SLA'
    }
  },

  t: function(key) {
    var lang = this.currentLang || 'en';
    if (this.translations[lang] && this.translations[lang][key]) {
      return this.translations[lang][key];
    }
    return this.translations['en'][key] || key;
  },

  setLang: function(lang) {
    this.currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update current lang text button if exists
    var textEl = document.getElementById('current-lang-text');
    if (textEl) {
      textEl.textContent = lang === 'ar' ? 'English' : 'العربية';
    }

    // Trigger re-render of text elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var k = el.getAttribute('data-i18n');
      if (k) el.textContent = CLEAN_UAE_I18N.t(k);
    });
  }
};
