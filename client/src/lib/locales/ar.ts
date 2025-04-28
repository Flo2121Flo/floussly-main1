export default {
  // General
  appName: "فلوسلي",
  tagline: "تطبيقك المغربي الشامل",
  
  // Common
  common: {
    loading: "جاري التحميل...",
    dataUnavailable: "البيانات غير متوفرة",
    dateUnavailable: "التاريخ غير متوفر",
    error: "خطأ",
    retry: "إعادة المحاولة",
    noData: "لا توجد بيانات متاحة",
    cancel: "إلغاء",
    confirm: "تأكيد",
    save: "حفظ",
    delete: "حذف",
    edit: "تعديل",
    view: "عرض",
    viewAll: "عرض الكل",
    close: "إغلاق",
    continue: "متابعة",
    back: "رجوع",
    returnHome: "العودة إلى الرئيسية",
    today: "اليوم",
    yesterday: "الأمس",
    months: {
      jan: "يناير",
      feb: "فبراير",
      mar: "مارس",
      apr: "أبريل",
      may: "مايو",
      jun: "يونيو",
      jul: "يوليو",
      aug: "أغسطس",
      sep: "سبتمبر",
      oct: "أكتوبر",
      nov: "نوفمبر",
      dec: "ديسمبر"
    },
    currency: "درهم",
    generating: "جاري الإنشاء...",
    tryAgain: "حاول مرة أخرى",
    completed: "مكتمل",
    success: "ناجح",
    defaultUserName: "مستخدم فلوسلي"
  },
  
  // Auth
  auth: {
    welcome: "مرحباً",
    signInMessage: "سجل الدخول للوصول إلى حسابك في فلوسلي",
    phoneNumber: "رقم الهاتف",
    continue: "متابعة",
    signInWithEmail: "تسجيل الدخول بالبريد الإلكتروني",
    dontHaveAccount: "ليس لديك حساب بعد؟",
    signUp: "إنشاء حساب",
    verification: "التحقق",
    verificationMessage: "لقد أرسلنا رمزاً إلى",
    verify: "تحقق ومتابعة",
    didntReceiveCode: "لم تتلق الرمز؟",
    resend: "إعادة إرسال",
    identity: "التحقق من الهوية",
    identityMessage: "نحتاج إلى التحقق من هويتك قبل أن تتمكن من استخدام جميع الميزات",
    uploadId: "تحميل بطاقة الهوية",
    uploadIdMessage: "انقر لتحميل الجانبين الأمامي والخلفي من بطاقة هويتك",
    takeSelfie: "التقاط صورة شخصية",
    takeSelfieMessage: "التقط صورة واضحة لوجهك",
    submit: "إرسال للتحقق"
  },
  
  // Navigation
  nav: {
    home: "الرئيسية",
    transfers: "التحويلات",
    qr: "رمز QR",
    finance: "المالية",
    profile: "الملف الشخصي",
    back: "رجوع"
  },
  
  // Home
  home: {
    welcomeBack: "مرحباً بعودتك",
    recentTransactions: "المعاملات الأخيرة",
    seeAll: "عرض الكل",
    financialSummary: "الملخص المالي"
  },
  
  // Wallet
  wallet: {
    availableBalance: "الرصيد المتاح",
    topUp: "شحن",
    withdraw: "سحب",
    send: "إرسال",
    topUpTitle: "شحن",
    topUpDescription: "اختر طريقة الدفع لشحن محفظتك",
    withdrawTitle: "سحب",
    withdrawDescription: "اختر طريقة لسحب أموالك",
    viewTrends: "عرض الاتجاهات",
    history: "سجل المعاملات",
    details: "تفاصيل المحفظة"
  },
  
  // Actions
  actions: {
    send: "إرسال",
    scan: "مسح",
    tontine: "دارت",
    agents: "الوكلاء"
  },
  

  
  // Transactions
  transaction: {
    title: "المعاملات",
    status: {
      pending: "قيد الانتظار",
      completed: "مكتمل",
      failed: "فشل"
    },
    yourBalance: "رصيدك",
    amount: "المبلغ",
    recipient: "المستلم",
    sentTo: "أرسلت إلى",
    receivedFrom: "استلمت من",
    topUp: "شحن الرصيد",
    withdrawal: "سحب",
    newTransaction: "معاملة جديدة",
    searchRecipient: "البحث بالاسم أو الهاتف",
    recentContacts: "جهات الاتصال الأخيرة",
    note: "ملاحظة (اختياري)",
    noteHint: "لماذا هذا؟",
    sendMoney: "إرسال المال",
    transferFee: "رسوم التحويل: 2.5٪ (≤500 درهم) أو 3٪ (>500 درهم، حد أقصى 15 درهم)"
  },
  
  // Tontine
  tontine: {
    daret: "دارت",
    manageGroups: "إدارة مجموعات الدارت الخاصة بك",
    createNew: "إنشاء جديد",
    joinExisting: "الانضمام إلى موجود",
    yourActive: "الدارت النشطة",
    past: "الدارت السابقة",
    monthly: "شهري: {{currency}} {{amount}}",
    members: "الأعضاء: {{count}}",
    cyclesCompleted: "{{current}}/{{total}} دورات مكتملة",
    nextPayment: "الدفعة التالية: {{date}}",
    ended: "انتهى في: {{date}}",
    viewDetails: "عرض التفاصيل",
    viewHistory: "عرض التاريخ",
    viewDetailsTitle: "تفاصيل الدارت",
    viewDetailsDescription: "عرض تفاصيل {{name}}"
  },
  
  // QR Code
  qr: {
    payment: "الدفع برمز QR",
    scanToSend: "امسح لإرسال المال أو شارك رمزك للاستلام",
    yourCode: "رمز فلوسلي الخاص بك",
    scanCode: "مسح الرمز",
    shareCode: "مشاركة الرمز",
    history: "سجل مدفوعات QR"
  },
  
  // Finance
  finance: {
    dashboard: "لوحة تحكم المالية",
    trackSpending: "تتبع عادات الإنفاق والتوفير الخاصة بك",
    overview: "نظرة عامة",
    thisMonth: "هذا الشهر",
    lastMonth: "الشهر الماضي",
    lastQuarter: "آخر 3 أشهر",
    lastSixMonths: "آخر 6 أشهر",
    twelveMonths: "آخر 12 شهر",
    income: "الدخل",
    expenses: "المصروفات",
    savings: "المدخرات",
    summary: "الملخص المالي",
    financialOverview: "نظرة مالية عامة",
    moneyMovement: "حركة المال",
    ofIncome: "من الدخل",
    vsLast: "مقارنة بآخر {{period}}",
    month: "شهر",
    quarter: "ربع",
    analyze: "تحليل",
    viewDetailedAnalytics: "عرض التحليلات المفصلة",
    viewAnalyticsTitle: "التحليلات",
    viewAnalyticsDescription: "التحليلات المالية المفصلة متاحة في الإصدار الكامل",
    spendingByCategory: "الإنفاق حسب الفئة",
    budgetStatus: "حالة الميزانية",
    addNewBudget: "إضافة ميزانية جديدة",
    totalIncome: "إجمالي الدخل",
    totalExpenses: "إجمالي المصروفات",
    avgMonthlyIncome: "متوسط الدخل الشهري",
    savingsRate: "معدل الادخار",
    actual: "الفعلي",
    projected: "المتوقع",
    noTransactionData: "لا توجد بيانات معاملات متاحة لهذه الفترة",
    export: {
      csv: "تصدير CSV",
      pdf: "تصدير PDF"
    },
    // Savings Challenges
    savingChallenges: "تحديات التوفير",
    progress: "التقدم",
    deadline: "الموعد النهائي",
    reward: "المكافأة",
    challengeCompleted: "تم إكمال التحدي!",
    congratulations: "تهانينا! لقد ربحت:",
    keepUpGreatWork: "واصل العمل الرائع! تحقق من مكافآتك في ملفك الشخصي.",
    claimReward: "المطالبة بالمكافأة",
    challenges: {
      quickSaver: "الموفر السريع",
      quickSaverDesc: "وفر {{amount}} درهم في محفظتك في يوم واحد",
      weeklyGuardian: "حارس أسبوعي",
      weeklyGuardianDesc: "وفر {{amount}} درهم هذا الأسبوع",
      monthlyMaster: "سيد شهري",
      monthlyMasterDesc: "وفر {{amount}} درهم هذا الشهر",
      hours: "{{count}} ساعة",
      daysLeft: "باقي {{count}} أيام",
      points: "{{count}} نقطة فلوسلي",
      bigReward: "{{count}} نقطة فلوسلي + {{interest}}% فائدة إضافية"
    }
  },
  
  // Budget
  budget: {
    category: {
      groceries: "البقالة",
      transport: "النقل",
      entertainment: "الترفيه",
      utilities: "المرافق",
      rent: "الإيجار",
      health: "الصحة",
      education: "التعليم",
      other: "أخرى"
    }
  },
  
  // Agents
  agents: {
    network: "شبكة الوكلاء",
    findNear: "ابحث عن وكلاء فلوسلي بالقرب منك",
    nearest: "أقرب الوكلاء",
    viewAll: "عرض جميع الوكلاء",
    servicesAvailable: "الخدمات المتاحة",
    distanceAndHours: "{{distance}} كم • مفتوح حتى {{openUntil}}",
    viewAgentTitle: "تفاصيل الوكيل",
    viewAgentDescription: "عرض تفاصيل {{name}}"
  },
  
  // Notifications
  notifications: {
    title: "الإشعارات",
    today: "اليوم",
    yesterday: "الأمس",
    markAllRead: "تحديد الكل كمقروء",
    loadMore: "تحميل المزيد"
  },
  
  // Settings
  settings: {
    title: "الإعدادات",
    editProfile: "تعديل الملف الشخصي",
    preferences: "التفضيلات",
    darkMode: "الوضع المظلم",
    language: "اللغة",
    notifications: "الإشعارات",
    biometricLogin: "تسجيل الدخول البيومتري",
    security: {
      title: "الأمان",
      changePin: "تغيير الرمز السري",
      securitySettings: "إعدادات الأمان",
      loginActivity: "نشاط تسجيل الدخول"
    },
    support: {
      title: "الدعم",
      helpCenter: "مركز المساعدة",
      contactSupport: "الاتصال بالدعم",
      rateApp: "تقييم فلوسلي"
    },
    logout: "تسجيل الخروج",
    version: "فلوسلي v1.0.0 • © 2023 فلوسلي Inc."
  },
  
  // Financial Health
  financialHealth: {
    title: "الصحة المالية",
    overallScore: "درجة صحتك المالية",
    scoreDescription: "يستند إلى عادات الإنفاق والادخار وإدارة الديون",
    poor: "ضعيف",
    excellent: "ممتاز",
    status: {
      label: "صحتك المالية",
      great: "ممتازة! أنت على المسار الصحيح لتحقيق أهدافك المالية",
      good: "جيدة. وضعك المالي في وضع جيد",
      neutral: "متوسطة. هناك بعض المجالات التي تحتاج إلى اهتمامك",
      concerning: "مقلقة. هناك عدة جوانب مثيرة للقلق في وضعك المالي",
      critical: "حرجة. يلزم اتخاذ إجراء فوري لتحسين وضعك المالي"
    },
    tabs: {
      overview: "نظرة عامة",
      metrics: "المقاييس",
      trends: "الاتجاهات"
    },
    savingsRate: "معدل الادخار",
    savingsRateDescription: "النسبة المئوية من الدخل التي توفرها",
    debtToIncome: "نسبة الدين إلى الدخل",
    debtToIncomeDescription: "النسبة المئوية من الدخل المخصصة لمدفوعات الديون",
    emergencyFund: "تغطية صندوق الطوارئ",
    emergencyFundDescription: "استهدف 3-6 أشهر من النفقات في صندوق الطوارئ الخاص بك",
    months: "أشهر",
    budgetAdherence: "الالتزام بالميزانية",
    budgetAdherenceDescription: "كيف تلتزم بميزانيتك",
    investmentGrowth: "نمو الاستثمار",
    investmentGrowthDescription: "معدل النمو السنوي لاستثماراتك",
    recommendations: "التوصيات المخصصة",
    recommendationsDescription: "احصل على نصائح مخصصة لوضعك المالي",
    getPersonalizedAdvice: "الحصول على نصائح مخصصة",
    balanceTrend: "اتجاه الرصيد",
    personalizedTips: "نصائح لوضعك المالي",
    tips: {
      great: {
        "1": "فكر في زيادة محفظتك الاستثمارية للنمو على المدى الطويل",
        "2": "استكشف استراتيجيات تحسين الضرائب لمدخراتك",
        "3": "راجع تغطية التأمين الخاصة بك للتأكد من أنها تلبي احتياجاتك"
      },
      good: {
        "1": "حاول زيادة معدل الادخار الخاص بك بنسبة 1-2٪ هذا الشهر",
        "2": "ابحث عن فرص لتنويع استثماراتك",
        "3": "فكر في إعداد تحويلات تلقائية إلى مدخراتك"
      },
      neutral: {
        "1": "ركز على بناء صندوق الطوارئ الخاص بك إلى 3-6 أشهر من النفقات",
        "2": "راجع ميزانيتك لإيجاد مجالات يمكنك فيها تقليل الإنفاق",
        "3": "فكر في دمج الديون ذات الفائدة المرتفعة"
      },
      concerning: {
        "1": "أعط الأولوية لسداد الديون ذات الفائدة المرتفعة",
        "2": "قلل من النفقات غير الضرورية لزيادة المدخرات الشهرية",
        "3": "استكشف مصادر دخل إضافية أو وظائف مؤقتة"
      },
      critical: {
        "1": "قم بإنشاء ميزانية صارمة للسيطرة على الإنفاق فوراً",
        "2": "اتصل بالدائنين لمناقشة خطط الدفع إذا كنت تواجه صعوبة",
        "3": "أعط الأولوية لبناء صندوق طوارئ صغير (حتى لو كان 500 درهم فقط)"
      }
    }
  }
};
