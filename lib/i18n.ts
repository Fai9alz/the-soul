// ─── The Soul — i18n Translation Dictionary ───────────────────────────────────
// Two locales: "en" (LTR) and "ar" (RTL).
//
// Usage:
//   const { t } = useLanguage();
//   t.nav.locations       → "Locations" / "المواقع"
//   t.faq.items[0].q      → first FAQ question in current locale
//
// To add a new string:
//   1. Add the English key + value under `en`
//   2. Add the Arabic translation under `ar` at the same path
// ─────────────────────────────────────────────────────────────────────────────

export type Locale = "en" | "ar";

export const translations = {
  en: {

    // ── Navigation ────────────────────────────────────────────────────────────
    nav: {
      locations:       "Locations",
      about:           "About",
      faq:             "FAQ",
      residences:      "Residences",
      apply:           "Apply to Live",
      soulHittinUnits: "Soul Hittin Units",
      soulAlWadiUnits: "Soul Al Wadi Units",
      comingSoon:      "Coming Soon",
    },

    // ── Hero section ──────────────────────────────────────────────────────────
    hero: {
      eyebrow:     "Riyadh",
      description: "A curated long-term living community\nfor those who live with intention.",
      scroll:      "Scroll",
    },

    // ── Locations section ─────────────────────────────────────────────────────
    locations: {
      sectionLabel:      "Our Locations",
      exploreResidences: "Explore Residences",
      comingSoon:        "Coming Soon",
    },

    // ── Features section (12-feature carousel) ────────────────────────────────
    features: {
      sectionLabel: "Experience",
      heading:      "Every detail",
      headingEm:    "considered.",
      items: [
        { number: "01", title: "Curated Furnishings",  body: "Refined pieces selected for comfort and longevity." },
        { number: "02", title: "Housekeeping",          body: "Scheduled cleaning, quietly handled." },
        { number: "03", title: "Maintenance",           body: "Preventative, not reactive." },
        { number: "04", title: "Smart Access",          body: "Seamless entry and resident control." },
        { number: "05", title: "Wellness Spaces",       body: "Access to curated fitness areas." },
        { number: "06", title: "Community Lounges",     body: "Shared areas that feel private." },
        { number: "07", title: "Concierge",             body: "On-call support, always available." },
        { number: "08", title: "High-Speed Internet",   body: "Reliable connectivity, room to room." },
        { number: "09", title: "Climate Control",       body: "Tailored comfort in every room." },
        { number: "10", title: "Premium Appliances",    body: "Equipped from day one." },
        { number: "11", title: "Secure Parking",        body: "Resident-only, monitored access." },
        { number: "12", title: "Quiet Architecture",    body: "Built for stillness and privacy." },
      ],
    },

    // ── About slider ──────────────────────────────────────────────────────────
    about: {
      sectionLabel: "About",
      heading:      "A different way",
      headingEm:    "to live.",
      slides: [
        {
          number: "01",
          title:  "Why The Soul",
          body:   "Most residences offer space. The Soul offers an environment — curated for people who believe where you live shapes how you live. Every detail is considered, every space intentional.",
        },
        {
          number: "02",
          title:  "Add-Ons",
          body:   "Enhancements that complete the experience.\nA curated selection of add-ons offering greater flexibility to tailor your space—practical details, seamlessly integrated to keep the experience balanced and prepared around you.",
        },
        {
          number: "03",
          title:  "The Lifestyle",
          body:   "Life at The Soul moves at its own pace — unhurried, refined, and deeply comfortable. Shared spaces feel private. Common areas feel like your own. This is long-term living reimagined.",
        },
      ],
    },

    // ── FAQ section ───────────────────────────────────────────────────────────
    faq: {
      sectionLabel:  "Questions",
      heading:       "Things you may wonder.",
      readyLabel:    "Ready?",
      readyHeading:  "Apply to live at",
      readySubtext:  "We review every application personally.\nTell us a little about yourself.",
      ctaButton:     "Start Your Application",
      items: [
        {
          q: "What is The Soul?",
          a: "The Soul is a curated long-term living community in Riyadh. Unlike typical rentals, we operate an apply-to-live model — ensuring every resident shares a commitment to intentional, high-quality living.",
        },
        {
          q: "How does the application process work?",
          a: "Submit your application and tell us about yourself and your lifestyle. We review it with care, and if the rhythm aligns, we'll warmly reach out to arrange a viewing and continue with the next steps.",
        },
        {
          q: "Who is The Soul designed for?",
          a: "Professionals, creatives, and families who value their environment — people who prefer quality over quantity, and stillness over noise. Long-term residents only.",
        },
        {
          q: "What is included in the living experience?",
          a: "Each residence comes fully curated — from furnishings to common areas. Specifics vary by location and unit type. Details are shared upon application review.",
        },
        {
          q: "What are the minimum lease terms?",
          a: "The Soul is built for long-term living. Minimum tenancy starts at six months, with annual leases preferred. We do not offer short-term or holiday stays.",
        },
      ],
    },

    // ── Soul Hittin listing page ───────────────────────────────────────────────
    soulHittin: {
      locationLabel: "Hittin · Riyadh",
      heading:       "Soul Hittin",
      priceLabel:    "Residences from 168,000 SAR / year",
    },

    // ── Unit cards & listing ──────────────────────────────────────────────────
    units: {
      filters: {
        all:        "All",
        bedroom1:   "1 Bedroom",
        bedrooms2:  "2 Bedrooms",
        bedrooms3:  "3 Bedrooms",
        penthouse:  "Penthouse",
      },
      status: {
        available:  "Available",
        reserved:   "Reserved",
        comingSoon: "Coming Soon",
      },
      specs: {
        bed:  "Bed",
        bath: "Bath",
        sqm:  "sqm",
      },
      noResidences:  "No residences available at this time.",
      noMatch:       "No residences match this filter.",
      loadError:     "Unable to load residences. Please try again.",
      retry:         "Retry",
    },

    // ── Unit detail page ──────────────────────────────────────────────────────
    unitDetail: {
      backLink:         "← Soul Hittin",
      annualRent:       "Annual Rent",
      bedrooms:         "Bedrooms",
      bathrooms:        "Bathrooms",
      area:             "Area",
      floor:            "Floor",
      aboutResidence:   "About this residence",
      homeFeatures:     "Home",
      buildingFeatures: "Building",
    },

    // ── Application form ──────────────────────────────────────────────────────
    form: {
      steps: {
        personal:   "Personal",
        employment: "Employment",
        viewing:    "Viewing",
        review:     "Review",
      },
      stepOf:        "Step {step} of {total}",
      stepHeadings: [
        "Tell us about yourself.",
        "Your occupation.",
        "Schedule a viewing.",
        "Review your application.",
      ],
      close: "Close",
      labels: {
        fullName:      "Full Name",
        email:         "Email Address",
        phone:         "Phone Number",
        nationality:   "Nationality",
        maritalStatus: "Marital Status",
        members:       "Household Members",
        occupation:    "Occupation / Role",
        employer:      "Employer / Company",
        incomeRange:   "Annual Income Range",
        viewingDate:   "Preferred Date",
        viewingTime:   "Preferred Time",
        referral:      "How did you hear about us?",
        message:       "Anything else to add?",
      },
      placeholders: {
        optional:    "Optional",
        email:       "you@example.com",
        phone:       "+966 50 000 0000",
        occupation:  "e.g. Architect, Engineer, Consultant",
        notes:       "Optional notes",
      },
      select: {
        optional:     "Select (optional)",
        rangeOptional:"Select range (optional)",
        single:       "Single",
        married:      "Married",
        divorced:     "Divorced",
        widowed:      "Widowed",
        member1:      "1 person",
        member2:      "2 people",
        member3:      "3 people",
        member4:      "4 people",
        member5:      "5 people",
        member6plus:  "6 or more",
        income1:      "Less than 180,000 SAR / year",
        income2:      "180,000 – 240,000 SAR / year",
        income3:      "240,000 – 480,000 SAR / year",
        income4:      "Above 480,000 SAR / year",
        income5:      "",
      },
      buttons: {
        continue:    "Continue",
        back:        "← Back",
        submit:      "Submit Application",
        submitting:  "Submitting…",
        close:       "Close",
      },
      success: {
        label:   "Application Sent",
        heading: "Thank you.",
        message: "We review every application personally.\nWe will be in touch soon.",
      },
      errors: {
        fullName:     "Full name is required",
        email:        "Email is required",
        emailInvalid: "Enter a valid email address",
        phone:        "Phone number is required",
        phoneInvalid: "Numbers only (e.g. +966 50 000 0000)",
        nationality:  "Nationality is required",
        occupation:   "Occupation is required",
        viewingDate:  "Please select a preferred date",
        viewingTime:  "Please select a time slot",
      },
      review: {
        personal:   "Personal",
        employment: "Employment",
        viewing:    "Viewing",
        name:        "Name",
        email:       "Email",
        phone:       "Phone",
        nationality: "Nationality",
        marital:     "Marital Status",
        household:   "Household",
        memberUnit:  "member(s)",
        occupation:  "Occupation",
        employer:    "Employer",
        income:      "Income",
        date:        "Date",
        time:        "Time",
      },
    },

    // ── Common ────────────────────────────────────────────────────────────────
    common: {
      theSoul:    "The Soul",
      theSoulEm:  "The Soul.",
    },

  },

  // ── Arabic ──────────────────────────────────────────────────────────────────

  ar: {

    // ── Navigation ────────────────────────────────────────────────────────────
    nav: {
      locations:       "المواقع",
      about:           "عن المشروع",
      faq:             "الأسئلة",
      residences:      "الوحدات",
      apply:           "قدّم طلبك",
      soulHittinUnits: "وحدات سول حطين",
      soulAlWadiUnits: "وحدات سول الوادي",
      comingSoon:      "قريباً",
    },

    // ── Hero section ──────────────────────────────────────────────────────────
    hero: {
      eyebrow:     "الرياض",
      description: "مجتمع سكني مصمّم بعناية للإقامة الطويلة،\nموجّه لمن يختارون أسلوب حياة واعٍ وهادف",
      scroll:      "تصفّح",
    },

    // ── Locations section ─────────────────────────────────────────────────────
    locations: {
      sectionLabel:      "مواقعنا",
      exploreResidences: "استكشف الوحدات",
      comingSoon:        "قريباً",
    },

    // ── Features section (12-feature carousel) ────────────────────────────────
    features: {
      sectionLabel: "التجربة",
      heading:      "كل تفصيل",
      headingEm:    "محسوب.",
      items: [
        { number: "01", title: "أثاث منتقى",          body: "قطع راقية مختارة للراحة والديمومة." },
        { number: "02", title: "خدمة التنظيف",        body: "تنظيف مجدول يُدار بهدوء." },
        { number: "03", title: "الصيانة",             body: "وقائية لا رد فعلية." },
        { number: "04", title: "دخول ذكي",            body: "دخول وتحكّم سلس للساكن." },
        { number: "05", title: "مرافق العافية",       body: "وصول إلى مساحات لياقة مدروسة." },
        { number: "06", title: "صالات المجتمع",       body: "مساحات مشتركة بإحساس خاص." },
        { number: "07", title: "خدمة الكونسيرج",     body: "دعم متاح عند الحاجة دائماً." },
        { number: "08", title: "إنترنت عالي السرعة",  body: "اتصال موثوق في كل غرفة." },
        { number: "09", title: "التحكم بالمناخ",      body: "راحة مخصّصة في كل مساحة." },
        { number: "10", title: "أجهزة متميّزة",       body: "مجهّزة من اليوم الأول." },
        { number: "11", title: "مواقف آمنة",          body: "للسكان فقط، تحت المراقبة." },
        { number: "12", title: "هندسة هادئة",         body: "مصمّمة للسكون والخصوصية." },
      ],
    },

    // ── About slider ──────────────────────────────────────────────────────────
    about: {
      sectionLabel: "عن المشروع",
      heading:      "طريقة مختلفة",
      headingEm:    "للسكن.",
      slides: [
        {
          number: "01",
          title:  "لماذا سول؟",
          body:   "معظم الأماكن تُقدَّم وحدات للسكن، أما \"سول\" فيُقدم بيئة متكاملة.. مُدارة بهدوء ووضوح. لمن يرى أن المكان ليس تفصيلاً، بل عاملًا يشكّل أسلوب العيش، حيث تُنظَّم التفاصيل بعناية، وتُصمَّم المساحات لتخدم إيقاعًا أكثر توازنًا. كل شيء محسوب، ليدعم تجربة سكن هادئة، عملية، ومتناغمة.",
        },
        {
          number: "02",
          title:  "ما يُكمل التجربة (Add-Ons)",
          body:   "خيارات تُكمّل التجربة.\nإضافات منتقاة تمنحك مرونة أكبر لتكييف مساحتك حسب احتياجك، تفاصيل عملية تُدمج بسلاسة، لتبقى التجربة متوازنة ومهيأة لك.",
        },
        {
          number: "03",
          title:  "أسلوب الحياة",
          body:   "الحياة في سول تسير بإيقاعها الخاص — هادئة، راقية، ومريحة في أعماقها. المساحات المشتركة تبدو خاصة. المناطق العامة تشعر وكأنها لك وحدك. هذا هو إعادة تخيّل السكن طويل الأمد.",
        },
      ],
    },

    // ── FAQ section ───────────────────────────────────────────────────────────
    faq: {
      sectionLabel:  "أسئلة",
      heading:       "ما قد يدور في ذهنك.",
      readyLabel:    "هل أنت مستعد؟",
      readyHeading:  "قدّم طلبك للسكن في",
      readySubtext:  "نراجع كل طلب بشكل شخصي.\nأخبرنا قليلاً عن نفسك.",
      ctaButton:     "ابدأ طلبك",
      items: [
        {
          q: "ما هو سول؟",
          a: "سول مجتمع سكني راقٍ وطويل الأمد في الرياض. على عكس الإيجارات التقليدية، نعمل بنموذج التقديم للسكن — لضمان أن كل ساكن يشاركنا الالتزام بنمط حياة هادف وعالي الجودة.",
        },
        {
          q: "خطوات التقديم في \"سول\"",
          a: "قدّم طلبك وعرّفنا بنفسك وأسلوب حياتك. نراجعه بعناية، وإذا كان الإيقاع متناغمًا، نرحّب بالتواصل معك لترتيب جولة ومواصلة الخطوات القادمة بحفاوة.",
        },
        {
          q: "لمن صُمِّم سول؟",
          a: "للمهنيين والمبدعين والعائلات الذين يُقدِّرون بيئتهم — أشخاص يفضّلون الجودة على الكمية، والهدوء على الضجيج. للسكان طويلي الأمد فقط.",
        },
        {
          q: "ماذا تشمل تجربة السكن؟",
          a: "كل وحدة مُجهَّزة بالكامل — من الأثاث إلى المناطق المشتركة. التفاصيل تختلف حسب الموقع ونوع الوحدة. يُشارَك التفصيل عند مراجعة الطلب.",
        },
        {
          q: "الحد الأدنى للإقامة في \"سول\"",
          a: "صُمِّم سول للسكن طويل الأمد. يبدأ الحد الأدنى للإيجار من ستة أشهر، مع تفضيل العقود السنوية. لا نقدّم إقامات قصيرة المدى أو للإجازات.",
        },
      ],
    },

    // ── Soul Hittin listing page ───────────────────────────────────────────────
    soulHittin: {
      locationLabel: "حطين · الرياض",
      heading:       "سول حطين",
      priceLabel:    "وحدات من 168,000 ريال / سنة",
    },

    // ── Unit cards & listing ──────────────────────────────────────────────────
    units: {
      filters: {
        all:        "الكل",
        bedroom1:   "غرفة نوم",
        bedrooms2:  "غرفتا نوم",
        bedrooms3:  "3 غرف نوم",
        penthouse:  "بنتهاوس",
      },
      status: {
        available:  "متاحة",
        reserved:   "محجوزة",
        comingSoon: "قريباً",
      },
      specs: {
        bed:  "غرفة",
        bath: "حمام",
        sqm:  "م²",
      },
      noResidences:  "لا توجد وحدات متاحة حالياً.",
      noMatch:       "لا توجد وحدات تطابق هذا الفلتر.",
      loadError:     "تعذّر تحميل الوحدات. يرجى المحاولة مجدداً.",
      retry:         "إعادة المحاولة",
    },

    // ── Unit detail page ──────────────────────────────────────────────────────
    unitDetail: {
      backLink:         "سول حطين →",
      annualRent:       "الإيجار السنوي",
      bedrooms:         "غرف النوم",
      bathrooms:        "دورات المياه",
      area:             "المساحة",
      floor:            "الطابق",
      aboutResidence:   "عن هذه الوحدة",
      homeFeatures:     "الوحدة",
      buildingFeatures: "المبنى",
    },

    // ── Application form ──────────────────────────────────────────────────────
    form: {
      steps: {
        personal:   "شخصي",
        employment: "الوظيفة",
        viewing:    "الجولة",
        review:     "المراجعة",
      },
      stepOf:        "خطوة {step} من {total}",
      stepHeadings: [
        "أخبرنا عن نفسك.",
        "مجالك المهني.",
        "حدّد موعد جولتك.",
        "راجع طلبك.",
      ],
      close: "إغلاق",
      labels: {
        fullName:      "الاسم الكامل",
        email:         "البريد الإلكتروني",
        phone:         "رقم الجوال",
        nationality:   "الجنسية",
        maritalStatus: "الحالة الاجتماعية",
        members:       "عدد أفراد الأسرة",
        occupation:    "المهنة / الوظيفة",
        employer:      "جهة العمل",
        incomeRange:   "نطاق الدخل السنوي",
        viewingDate:   "التاريخ المفضّل",
        viewingTime:   "الوقت المفضّل",
        referral:      "كيف عرفت عنّا؟",
        message:       "هل تودّ إضافة شيء؟",
      },
      placeholders: {
        optional:   "اختياري",
        email:      "you@example.com",
        phone:      "+966 50 000 0000",
        occupation: "مثال: مهندس، مصمم، مستشار",
        notes:      "ملاحظات اختيارية",
      },
      select: {
        optional:      "اختر (اختياري)",
        rangeOptional: "اختر النطاق (اختياري)",
        single:        "أعزب / عزباء",
        married:       "متزوج / متزوجة",
        divorced:      "مطلق / مطلقة",
        widowed:       "أرمل / أرملة",
        member1:       "فرد واحد",
        member2:       "فردان",
        member3:       "3 أفراد",
        member4:       "4 أفراد",
        member5:       "5 أفراد",
        member6plus:   "6 أو أكثر",
        income1:       "أقل من 180,000 ريال / سنة",
        income2:       "180,000 – 240,000 ريال / سنة",
        income3:       "240,000 – 480,000 ريال / سنة",
        income4:       "أعلى من 480,000 ريال / سنة",
        income5:       "",
      },
      buttons: {
        continue:   "متابعة",
        back:       "رجوع →",
        submit:     "إرسال الطلب",
        submitting: "جارٍ الإرسال…",
        close:      "إغلاق",
      },
      success: {
        label:   "تم إرسال الطلب",
        heading: "شكراً لك.",
        message: "نراجع كل طلب بشكل شخصي.\nسنتواصل معك قريباً.",
      },
      errors: {
        fullName:     "الاسم الكامل مطلوب",
        email:        "البريد الإلكتروني مطلوب",
        emailInvalid: "أدخل بريداً إلكترونياً صحيحاً",
        phone:        "رقم الجوال مطلوب",
        phoneInvalid: "أرقام فقط (مثال: 966 50 000 0000+)",
        nationality:  "الجنسية مطلوبة",
        occupation:   "المهنة مطلوبة",
        viewingDate:  "يرجى اختيار تاريخ مناسب",
        viewingTime:  "يرجى اختيار وقت مناسب",
      },
      review: {
        personal:   "شخصي",
        employment: "الوظيفة",
        viewing:    "الجولة",
        name:        "الاسم",
        email:       "البريد",
        phone:       "الجوال",
        nationality: "الجنسية",
        marital:     "الحالة",
        household:   "الأسرة",
        memberUnit:  "فرد/أفراد",
        occupation:  "المهنة",
        employer:    "جهة العمل",
        income:      "الدخل",
        date:        "التاريخ",
        time:        "الوقت",
      },
    },

    // ── Common ────────────────────────────────────────────────────────────────
    common: {
      theSoul:   "The Soul",
      theSoulEm: "The Soul.",
    },

  },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export type TranslationDict = typeof translations.en;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map a DB status string → localised display label */
export function getStatusLabel(
  status: string,
  t: TranslationDict,
): string {
  if (status === "Available")   return t.units.status.available;
  if (status === "Reserved")    return t.units.status.reserved;
  if (status === "Coming Soon") return t.units.status.comingSoon;
  return status;
}

/** Map a unit type string → localised display label */
export function getTypeLabel(
  type: string,
  t: TranslationDict,
): string {
  const map: Record<string, string> = {
    "1 Bedroom":  t.units.filters.bedroom1,
    "2 Bedrooms": t.units.filters.bedrooms2,
    "3 Bedrooms": t.units.filters.bedrooms3,
    "Penthouse":  t.units.filters.penthouse,
  };
  return map[type] ?? type;
}
