/**
 * Clean UAE | تنظيف الفخامة — Seed Demo Data
 * Contains realistic default state for locations, services, staff, bookings, contracts, inventory, complaints, offers.
 */

window.CLEAN_UAE_MOCK = {
  settings: {
    companyName: 'Clean UAE',
    companyNameAr: 'تنظيف الفخامة',
    vatEnabled: true,
    vatRate: 5, // 5% UAE VAT
    currency: 'AED',
    referralRewardAmount: 50,
    refundSlaDays: 14,
    theme: {
      primary: '#0284c7',
      secondary: '#d97706',
      accent: '#10b981',
      sidebar: '#0f172a',
      borderRadius: '12px',
      density: 'comfortable'
    }
  },

  locations: [
    {
      id: 'ajman',
      name: 'Ajman',
      nameAr: 'عجمان',
      active: true,
      deliveryFee: 0,
      areas: [
        { id: 'al-nuaimia', name: 'Al Nuaimia', nameAr: 'النعيمية', active: true },
        { id: 'al-rashidiya', name: 'Al Rashidiya', nameAr: 'الراشدية', active: true },
        { id: 'al-mowaihat', name: 'Al Mowaihat', nameAr: 'المويحات', active: true },
        { id: 'al-jurf', name: 'Al Jurf', nameAr: 'الجرف', active: true },
        { id: 'al-rawda', name: 'Al Rawda', nameAr: 'الروضة', active: true },
        { id: 'al-hamidiyah', name: 'Al Hamidiyah', nameAr: 'الحميدية', active: true }
      ]
    },
    {
      id: 'dubai',
      name: 'Dubai',
      nameAr: 'دبي',
      active: false,
      deliveryFee: 30,
      areas: [
        { id: 'dubai-marina', name: 'Dubai Marina', nameAr: 'دبي مارينا', active: false },
        { id: 'downtown-dubai', name: 'Downtown Dubai', nameAr: 'وسط مدينة دبي', active: false },
        { id: 'jbr', name: 'JBR', nameAr: 'جميرا بيتش ريزيدنس', active: false }
      ]
    },
    {
      id: 'abu-dhabi',
      name: 'Abu Dhabi',
      nameAr: 'أبوظبي',
      active: false,
      deliveryFee: 50,
      areas: [
        { id: 'al-reem', name: 'Al Reem Island', nameAr: 'جزيرة الريم', active: false },
        { id: 'corniche', name: 'Corniche', nameAr: 'الكورنيش', active: false }
      ]
    },
    {
      id: 'sharjah',
      name: 'Sharjah',
      nameAr: 'الشارقة',
      active: false,
      deliveryFee: 15,
      areas: [
        { id: 'al-majaz', name: 'Al Majaz', nameAr: 'المجاز', active: false },
        { id: 'al-nahda', name: 'Al Nahda', nameAr: 'النهدة', active: false }
      ]
    },
    { id: 'uaq', name: 'Umm Al Quwain', nameAr: 'أم القيوين', active: false, deliveryFee: 25, areas: [] },
    { id: 'rak', name: 'Ras Al Khaimah', nameAr: 'رأس الخيمة', active: false, deliveryFee: 40, areas: [] },
    { id: 'fujairah', name: 'Fujairah', nameAr: 'الفجيرة', active: false, deliveryFee: 45, areas: [] }
  ],

  services: [
    {
      id: 'residential-deep',
      name: 'Residential & Deep Cleaning',
      nameAr: 'التنظيف السكني والشامل',
      category: 'residential',
      price: 180,
      duration: 3, // hours
      description: 'Comprehensive sanitization and deep cleaning for villas and apartments.',
      descriptionAr: 'تنظيف وتعقيم شامل للشقق والفلل مع أحدث الأجهزة والمواد.',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      allowance: { chemicalQty: '500ml Disinfectant', cloths: 4 }
    },
    {
      id: 'sofa-carpet-mattress',
      name: 'Sofa, Carpet & Mattress Cleaning',
      nameAr: 'تنظيف الكنب والسجاد والمفارش',
      category: 'specialized',
      price: 150,
      duration: 2,
      description: 'Steam extraction and stain removal for living room furniture and rugs.',
      descriptionAr: 'تنظيف وغسيل بالبخار لإزالة البقع المستعصية والروائح من الكنب والسجاد.',
      image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80',
      allowance: { chemicalQty: '300ml Fabric Shampoo', cloths: 2 }
    },
    {
      id: 'move-in-out',
      name: 'Move-In / Move-Out Cleaning',
      nameAr: 'تنظيف الانتقال والسكن الجديد',
      category: 'residential',
      price: 250,
      duration: 4,
      description: 'Thorough vacant property sanitization, cabinet cleaning, and floor scrubbing.',
      descriptionAr: 'تنظيف المنازل الفارغة قبل السكن أو بعد الانتقال لتكون جاهزة تماماً.',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
      allowance: { chemicalQty: '800ml Heavy Degreaser', cloths: 6 }
    },
    {
      id: 'kitchen-bathroom',
      name: 'Kitchen & Bathroom Sanitization',
      nameAr: 'تعقيم المطبخ والحمامات',
      category: 'specialized',
      price: 120,
      duration: 2,
      description: 'High-temp steam treatment for tiles, ovens, grout, and sanitary fixtures.',
      descriptionAr: 'تنظيف وتطهير الأسطح والأفران والأحواض والسيراميك بالبخار.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
      allowance: { chemicalQty: '400ml Tile & Grout Cleaner', cloths: 4 }
    },
    {
      id: 'water-tank',
      name: 'Water Tank Cleaning',
      nameAr: 'تنظيف وتعقيم خزان المياه',
      category: 'commercial',
      price: 300,
      duration: 3,
      description: 'Municipality-approved eco-friendly water reservoir cleaning and testing.',
      descriptionAr: 'تنظيف وغسيل خزانات المياه مع التعقيم واختبار النقاء المعتمد.',
      image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80',
      allowance: { chemicalQty: '1L Eco Chlorine Disinfectant', cloths: 2 }
    },
    {
      id: 'pest-control',
      name: 'Pest Control Services',
      nameAr: 'خدمات مكافحة الحشرات',
      category: 'specialized',
      price: 200,
      duration: 2,
      description: 'Odorless and safe pest elimination for crawling insects, rodents, and bed bugs.',
      descriptionAr: 'إبادة ومكافحة الحشرات والقوارض بمواد آمنة وبدون رائحة.',
      image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=600&q=80',
      allowance: { chemicalQty: '250ml Eco Insecticide Spray', cloths: 0 }
    },
    {
      id: 'maid-housekeeping',
      name: 'Hourly Maid & Housekeeping',
      nameAr: 'خدمة العاملات بالساعة',
      category: 'maid',
      price: 35, // per hour
      duration: 4,
      description: 'Trained, background-checked professional maids for daily home keeping.',
      descriptionAr: 'عاملات تنظيف مدربات ومحترفات بالساعة للترتيب والتنظيف اليومي.',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      allowance: { chemicalQty: 'Standard General Spray', cloths: 3 }
    },
    {
      id: 'cleaning-contract',
      name: 'Monthly & Annual Cleaning Contracts',
      nameAr: 'عقود التنظيف الشهرية والسنوية',
      category: 'contract',
      price: 600, // per month starting
      duration: 4,
      description: 'Custom recurring cleaning schedules (weekly/bi-weekly) with dedicated team.',
      descriptionAr: 'عقود دورية منتظمة (أسبوعية أو شهرية) بأسعار خاصة وخطة زيارات المحددة.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      allowance: { chemicalQty: 'Full Monthly Supply Kit', cloths: 10 }
    }
  ],

  users: [
    {
      id: 'usr-customer-1',
      name: 'Sara Al-Nuaimi',
      email: 'sara@example.ae',
      phone: '+971501234567',
      role: 'customer',
      referralCode: 'CUAE-SARA88',
      referralBalance: 100,
      savedAddresses: [
        { id: 'addr-1', emirate: 'Ajman', area: 'Al Nuaimia', building: 'Villa 14', street: 'Street 12', notes: 'Gate 2 entrance' }
      ]
    },
    {
      id: 'usr-staff-1',
      name: 'Rashid Khan',
      email: 'rashid@cleanuae.ae',
      phone: '+971559876543',
      role: 'staff',
      staffRole: 'Cleaner',
      supervisor: 'Ahmad Team Leader',
      activeStatus: true,
      todayShift: '08:00 AM - 05:00 PM'
    },
    {
      id: 'usr-dispatcher-1',
      name: 'Tariq Al-Mansoori',
      email: 'tariq@cleanuae.ae',
      phone: '+971523334455',
      role: 'dispatcher'
    },
    {
      id: 'usr-finance-1',
      name: 'Mariam Hassan',
      email: 'mariam@cleanuae.ae',
      phone: '+971547778899',
      role: 'finance'
    },
    {
      id: 'usr-admin-1',
      name: 'Clean UAE Owner',
      email: 'owner@cleanuae.ae',
      phone: '+971500000000',
      role: 'admin'
    }
  ],

  bookings: [
    {
      id: 'CUAE-8492',
      customerName: 'Sara Al-Nuaimi',
      customerPhone: '+971501234567',
      serviceId: 'residential-deep',
      serviceName: 'Residential & Deep Cleaning',
      emirate: 'Ajman',
      area: 'Al Nuaimia',
      address: 'Villa 14, Street 12',
      date: '2026-09-25',
      timeSlot: '09:00 AM - 12:00 PM',
      cleanersCount: 2,
      price: 180,
      vat: 9,
      totalAmount: 189,
      paymentMethod: 'card', // 'card' or 'cash'
      paymentStatus: 'paid', // 'paid' or 'outstanding_cash'
      status: 'assigned', // booked, confirmed, assigned, in_progress, completed, cancelled
      assignedStaff: 'Rashid Khan',
      holdExpiresAt: null
    },
    {
      id: 'CUAE-9104',
      customerName: 'Mohammed Rashid',
      customerPhone: '+971569991122',
      serviceId: 'sofa-carpet-mattress',
      serviceName: 'Sofa, Carpet & Mattress Cleaning',
      emirate: 'Ajman',
      area: 'Al Rashidiya',
      address: 'Tower A, Apt 402',
      date: '2026-09-24',
      timeSlot: '02:00 PM - 04:00 PM',
      cleanersCount: 1,
      price: 150,
      vat: 7.5,
      totalAmount: 157.5,
      paymentMethod: 'cash',
      paymentStatus: 'outstanding_cash',
      status: 'in_progress',
      assignedStaff: 'Rashid Khan',
      holdExpiresAt: null
    },
    {
      id: 'CUAE-7721',
      customerName: 'Fatima Al-Ali',
      customerPhone: '+971504445566',
      serviceId: 'move-in-out',
      serviceName: 'Move-In / Move-Out Cleaning',
      emirate: 'Ajman',
      area: 'Al Mowaihat',
      address: 'Villa 88',
      date: '2026-09-20',
      timeSlot: '10:00 AM - 02:00 PM',
      cleanersCount: 3,
      price: 250,
      vat: 12.5,
      totalAmount: 262.5,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      status: 'completed',
      assignedStaff: 'Rashid Khan',
      holdExpiresAt: null
    }
  ],

  contracts: [
    {
      id: 'CNT-2026-01',
      customerName: 'Sara Al-Nuaimi',
      serviceName: 'Weekly Villa Housekeeping',
      frequency: 'Monthly',
      totalVisits: 12,
      completedVisits: 4,
      remainingVisits: 8,
      startDate: '2026-08-01',
      endDate: '2026-11-01',
      monthlyPrice: 600,
      status: 'active'
    }
  ],

  inventory: [
    { id: 'inv-1', name: 'Eco Disinfectant Detergent 5L', category: 'Chemicals', stock: 45, minStock: 10, unit: 'Bottles' },
    { id: 'inv-2', name: 'Steam Carpet Shampoo 2L', category: 'Chemicals', stock: 8, minStock: 12, unit: 'Bottles' },
    { id: 'inv-3', name: 'Microfiber Cleaning Cloth Pack', category: 'Supplies', stock: 120, minStock: 25, unit: 'Packs' },
    { id: 'inv-4', name: 'Heavy Duty Degreaser Spray', category: 'Chemicals', stock: 30, minStock: 15, unit: 'Cans' },
    { id: 'inv-5', name: 'Commercial Steam Cleaner Machine', category: 'Equipment', stock: 6, minStock: 2, unit: 'Units' }
  ],

  complaints: [
    {
      id: 'CMP-102',
      customerName: 'Aisha Al-Hassan',
      bookingId: 'CUAE-7721',
      serviceName: 'Move-In Cleaning',
      priority: 'high',
      status: 'under_review', // open, under_review, action_scheduled, resolved, closed
      assignedOfficer: 'Mariam QA Officer',
      deadline: '2026-09-26',
      customerMessage: 'Water marks remained on the balcony glass window after cleaning.',
      internalNotes: 'Contacted cleaner Rashid. Scheduled touch-up visit for Friday.'
    }
  ],

  reviews: [
    {
      id: 'rev-1',
      author: 'Khalid Al-Nuaimi',
      rating: 5,
      date: '2026-09-18',
      text: 'Extremely professional team in Ajman! The deep cleaning of our villa was flawless. Will definitely subscribe to their annual contract.',
      verified: true
    },
    {
      id: 'rev-2',
      author: 'Emily Watson',
      rating: 5,
      date: '2026-09-15',
      text: 'Super easy booking and pay cash option. The sofa steam cleaning made our living room look brand new.',
      verified: true
    }
  ],

  offers: [
    { id: 'off-1', code: 'WELCOME10', discount: '10% OFF', description: '10% discount on first residential cleaning', expiry: '2026-12-31' },
    { id: 'off-2', code: 'AJMAN50', discount: '50 AED OFF', description: 'Flat AED 50 discount for Ajman residents on bookings over 200 AED', expiry: '2026-10-31' }
  ],

  cashCollections: [
    {
      id: 'CASH-991',
      bookingId: 'CUAE-9104',
      collectorName: 'Rashid Khan',
      amountCollected: 157.5,
      collectedAt: '2026-09-24 04:15 PM',
      receiptRef: 'RCP-00918',
      status: 'pending_handover' // pending_handover, reconciled
    }
  ],

  refunds: [
    {
      id: 'RFD-304',
      bookingId: 'CUAE-6610',
      customerName: 'Hassan Al-Mowaihat',
      amount: 189,
      cancellationDate: '2026-09-22',
      expectedDeadline: '2026-10-06',
      workingDaysRemaining: 10,
      status: 'processing' // processing, completed, rejected
    }
  ]
};
