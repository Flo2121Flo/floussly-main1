export default {
  // General
  appName: "Floussly",
  tagline: "Your Moroccan Super App",
  
  // Common
  common: {
    loading: "Loading...",
    dataUnavailable: "Data unavailable",
    error: "Error",
    retry: "Retry",
    noData: "No data available",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    viewAll: "View All",
    viewMore: "View More",
    close: "Close",
    continue: "Continue",
    back: "Back",
    returnHome: "Return to Home",
    months: {
      jan: "Jan",
      feb: "Feb",
      mar: "Mar",
      apr: "Apr",
      may: "May",
      jun: "Jun",
      jul: "Jul",
      aug: "Aug",
      sep: "Sep",
      oct: "Oct",
      nov: "Nov",
      dec: "Dec"
    },
    currency: "MAD",
    currencySymbol: "DH",
    search: "Search",
    use: "Use",
    generating: "Generating...",
    tryAgain: "Try Again",
    defaultUserName: "Floussly User",
    success: "successful",
    completed: "Completed",
    today: "Today",
    yesterday: "Yesterday",
    dateUnavailable: "Date unavailable",
    download: "Download",
    processing: "Processing...",
    lineChart: "Line Chart"
  },
  
  // Auth
  auth: {
    welcome: "Welcome",
    signInMessage: "Sign in to access your Floussly account",
    phoneNumber: "Phone Number",
    continue: "Continue",
    signInWithEmail: "Sign in with Email",
    dontHaveAccount: "Don't have an account yet?",
    signUp: "Sign up",
    verification: "Verification",
    verificationMessage: "We've sent a code to",
    verify: "Verify & Proceed",
    didntReceiveCode: "Didn't receive the code?",
    resend: "Resend",
    identity: "Identity Verification",
    identityMessage: "We need to verify your identity before you can use all features",
    uploadId: "Upload ID Card (CIN)",
    uploadIdMessage: "Click to upload front and back of your ID",
    takeSelfie: "Take a Selfie",
    takeSelfieMessage: "Take a clear photo of your face",
    submit: "Submit for Verification"
  },
  
  // Navigation
  nav: {
    home: "Home",
    transfers: "Transfers",
    transactions: "Transactions",
    qr: "QR",
    finance: "Finance",
    profile: "Profile",
    back: "Back"
  },
  
  // Home
  home: {
    welcomeBack: "Welcome back",
    recentTransactions: "Recent Transactions",
    seeAll: "See All",
    financialSummary: "Financial Summary"
  },
  
  // Wallet
  wallet: {
    availableBalance: "Available Balance",
    topUp: "Top Up",
    withdraw: "Withdraw",
    send: "Send",
    topUpTitle: "Top Up",
    topUpDescription: "Select a payment method to top up your wallet",
    withdrawTitle: "Withdraw",
    withdrawDescription: "Select a method to withdraw your funds",
    viewTrends: "View Trends",
    history: "Transaction History",
    details: "Wallet Details",
    title: "Floussly Wallet",
    service: "Wallet Service"
  },
  
  // Actions
  actions: {
    send: "Send",
    scan: "Scan",
    daret: "Daret",
    agents: "Agents",
    banks: "Banks",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    add: "Add",
    update: "Update",
    updating: "Updating...",
    delete: "Delete",
    deleting: "Deleting...",
    confirm: "Confirm",
    continue: "Continue",
    back: "Back",
    next: "Next",
    finish: "Finish",
    submit: "Submit",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    reset: "Reset",
    close: "Close",
    topUp: "Top Up",
    transferMoney: "Transfer Money"
  },
  
  // Transactions
  transaction: {
    title: "Transactions",
    transaction: "Transaction",
    history: "Transaction History",
    thisMonth: "This Month",
    overview: "Overview",
    all: "All",
    sent: "Sent",
    received: "Received",
    topup: "Top-up",
    search: "Search transactions",
    searchContacts: "Search contacts",
    noTransactions: "No Transactions",
    noTransactionsMessage: "You don't have any transactions yet. Start sending or receiving money to see them here.",
    createNew: "Create New Transaction",
    sentTo: "Sent to",
    receivedFrom: "Received from",
    topUp: "Top Up",
    withdrawal: "Withdrawal",
    send: "Send",
    processing: "Processing your transfer...",
    sendingTo: "Sending to",
    transferSuccess: "Successfully sent {{amount}} MAD!",
    success: "Transfer successful!",
    failed: "Transfer failed",
    retry: "Retry",
    details: "Transfer Details",
    status: {
      pending: "Pending",
      completed: "Completed",
      failed: "Failed"
    },
    yourBalance: "Your Balance",
    amount: "Amount",
    recipient: "Recipient",
    searchRecipient: "Search by name or phone",
    searchByCode: "Search by Floussly code",
    scanCode: "Scan QR code",
    enterFlousslyCode: "Enter Floussly code",
    recentContacts: "Recent Contacts",
    allContacts: "All Contacts",
    noContactsFound: "No contacts found",
    note: "Note (Optional)",
    noteHint: "What's this for?",
    sendMoney: "Send Money",
    transferFee: "Transfer fee",
    withdrawalFee: "Withdrawal fee",
    topupFee: "Top-up fee",
    bankTransferFee: "Bank Transfer Fee",
    merchantPaymentFee: "Merchant Payment Fee",
    merchantFee: "Merchant Fee",
    freeTransfer: "Free",
    freePayment: "Free",
    fixedFee: "Fixed Fee",
    maxFee: "Maximum Fee",
    min: "Min",
    fee: "Fee",
    total: "Total",
    currencySymbol: "MAD",
    searchMethods: "Search Methods",
    notFound: "Transaction Not Found",
    transactionNotFound: "The transaction you are looking for could not be found.",
    backToTransactions: "Back to Transactions",
    category: "Category",
    reference: "Reference",
    service: "Service"
  },
  
  // Daret (Tontine)
  daret: {
    title: "Daret",
    description: "Manage your rotating savings groups",
    create: "Create",
    createNew: "Create New Daret",
    createNewDescription: "Start a new rotating savings group",
    startNew: "Start New",
    join: "Join",
    amount: "Amount",
    cycle: "Cycle",
    currentTurn: "Current Turn",
    current: "Current",
    next: "Next",
    nextPayment: "Next Payment",
    totalCycles: "Total Cycles",
    currentCycle: "Current Cycle",
    startDate: "Start Date",
    members: "Members",
    details: "Details",
    monthly: "Monthly: {{currency}} {{amount}}",
    cyclesCompleted: "{{current}}/{{total}} cycles completed",
    ended: "Ended: {{date}}",
    viewDetails: "View Details",
    viewHistory: "View History",
    viewDetailsTitle: "Daret Details",
    viewDetailsDescription: "Viewing details for {{name}}",
    inviteFriends: "Invite Friends",
    status: {
      label: "Status",
      active: "Active",
      payment_due: "Payment Due",
      completed: "Completed"
    },
    tabs: {
      active: "Active",
      paymentDue: "Payment Due",
      completed: "Completed"
    },
    noDarets: "No Darets Found",
    noActiveDescription: "You don't have any active Daret groups",
    error: "Something went wrong",
    errorTitle: "Error",
    errorDescription: "Could not load Daret groups",
    totalMembers: "Total Members",
    totalMembersDescription: "Number of people in this Daret (including you)",
    amountDescription: "Amount each member contributes monthly",
    startDateDescription: "When will the first collection happen?",
    createdTitle: "Daret Created",
    createdDescription: "Your Daret has been created successfully.",
    createFailedTitle: "Failed to Create Daret",
    createFailedDescription: "Unable to create Daret. Please try again.",
    joinedTitle: "Joined Daret",
    joinedDescription: "You have successfully joined the Daret.",
    joinFailedTitle: "Failed to Join Daret",
    joinFailedDescription: "Unable to join Daret. Please try again."
  },
  
  // Tontine (Legacy)
  tontine: {
    daret: "Daret",
    manageGroups: "Manage your tontine groups",
    createNew: "Create New",
    joinExisting: "Join Existing",
    yourActive: "Your Active Daret",
    past: "Past Daret",
    monthly: "Monthly: {{currency}} {{amount}}",
    members: "Members: {{count}}",
    cyclesCompleted: "{{current}}/{{total}} cycles completed",
    nextPayment: "Next payment: {{date}}",
    ended: "Ended: {{date}}",
    viewDetails: "View Details",
    viewHistory: "View History",
    viewDetailsTitle: "Daret Details",
    viewDetailsDescription: "Viewing details for {{name}}",
    fee: {
      title: "Service Fee",
      description: "A service fee of {{amount}} MAD will be charged for creating this Daret.",
      totalAmount: "Total Daret amount: {{amount}} MAD.",
      insufficientBalance: "Insufficient Balance",
      needMoreFunds: "You need at least {{amount}} MAD in your wallet to pay the service fee.",
      currentBalance: "Your current balance: {{balance}} MAD."
    }
  },
  
  // QR Code
  qrCode: {
    payment: "QR Payment",
    scanToSend: "Scan to send money or share your code to receive",
    yourCode: "Your Floussly Code",
    scanCode: "Scan Code",
    shareCode: "Share Code",
    history: "QR Payment History",
    scanAgentCode: "Scan Agent QR Code",
    scanInstructions: "Position the QR code within the frame to scan",
    scanned: "QR Code Scanned",
    processingPayment: "Processing your transaction",
    captureCode: "Capture Code",
    download: "Download",
    share: "Share",
    shareTitle: "My Floussly QR Code",
    shareNotSupported: "Sharing is not supported on your device",
    scanning: "Scanning...",
    cancelScan: "Cancel Scan",
    codeDescription: "Here's my QR code: {{userName}}",
    paymentCompleted: "Payment of {{currency}} {{amount}} to {{merchant}} completed!"
  },
  
  // Finance
  finance: {
    dashboard: "Finance Dashboard",
    trackSpending: "Track your spending and saving habits",
    overview: "Overview",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    lastQuarter: "Last 3 Months",
    lastSixMonths: "Last 6 Months",
    income: "Income",
    expenses: "Expenses",
    savings: "Savings",
    summary: "Financial Summary",
    financialOverview: "Financial Overview",
    moneyMovement: "Money Movement", 
    ofIncome: "of income",
    vsLast: "vs last {{period}}",
    month: "month",
    quarter: "quarter",
    analyze: "Analyze",
    twelveMonths: "Last 12 Months",
    viewDetailedAnalytics: "View Detailed Analytics",
    viewAnalyticsTitle: "Analytics",
    viewAnalyticsDescription: "Detailed financial analytics are available in the full version",
    spendingByCategory: "Spending by Category",
    budgetStatus: "Budget Status",
    addNewBudget: "Add New Budget",
    dailySpending: "Daily Spending",
    spending: "Spending",
    totalSpending: "Total Spending",
    average: "Average",
    avgDaily: "Average Daily",
    totalMonth: "Total Monthly",
    dailyView: "Daily View",
    cumulativeView: "Cumulative View",
    day: "Day",
    days: "days",
    trends: "Trends",
    total: "Total",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    avgMonthly: "Avg. Monthly",
    avgMonthlyIncome: "Avg. Monthly Income",
    savingsRate: "+{{rate}}%",
    actual: "Actual",
    projected: "Projected",
    lastYear: "Last Year",
    lastTwelveMonths: "Last 12 Months",
    export: {
      csv: "Export CSV",
      pdf: "Export PDF"
    },
    // Savings Challenges
    savingChallenges: "Savings Challenges",
    progress: "Progress",
    deadline: "Deadline",
    
    // Savings Comparison Chart
    threeMonthsPeriod: "3 Months",
    sixMonthsPeriod: "6 Months",
    twelveMonthsPeriod: "12 Months",
    targetSavings: "Target Savings",
    noFinancialData: "No financial data is available for this period.",
    savingsRateLabel: "Savings Rate",
    reward: "Reward",
    challengeCompleted: "Challenge Completed!",
    congratulations: "Congratulations! You've earned:",
    keepUpGreatWork: "Keep up the great work! Check your rewards in your profile.",
    claimReward: "Claim Reward",
    challenges: {
      quickSaver: "Quick Saver",
      quickSaverDesc: "Save {{amount}} MAD in your wallet in one day",
      weeklyGuardian: "Weekly Guardian",
      weeklyGuardianDesc: "Save {{amount}} MAD this week",
      monthlyMaster: "Monthly Master",
      monthlyMasterDesc: "Save {{amount}} MAD this month",
      hours: "{{count}} hours",
      daysLeft: "{{count}} days left",
      points: "{{count}} Floussly points",
      bigReward: "{{count}} Floussly points + {{interest}}% extra interest"
    }
  },
  
  // Budget
  budget: {
    category: {
      groceries: "Groceries",
      transport: "Transport",
      entertainment: "Entertainment",
      utilities: "Utilities",
      rent: "Rent",
      health: "Health",
      education: "Education",
      other: "Other"
    }
  },
  
  // Agents
  agents: {
    network: "Agent Network",
    findNear: "Find Floussly agents near you",
    nearest: "Nearest Agents",
    viewAll: "View All Agents",
    servicesAvailable: "Services Available",
    distanceAndHours: "{{distance}} km away • Open until {{openUntil}}",
    viewAgentTitle: "Agent Details",
    viewAgentDescription: "Viewing details for {{name}}"
  },
  
  // Notifications
  notifications: {
    title: "Notifications",
    today: "Today",
    yesterday: "Yesterday",
    markAllRead: "Mark all as read",
    loadMore: "Load More"
  },
  
  // Settings
  settings: {
    title: "Settings",
    editProfile: "Edit Profile",
    preferences: "Preferences",
    darkMode: "Dark Mode",
    language: "Language",
    notifications: "Notifications",
    biometricLogin: "Biometric Login",
    security: {
      title: "Security",
      changePin: "Change PIN",
      securitySettings: "Security Settings",
      loginActivity: "Login Activity"
    },
    support: {
      title: "Support",
      helpCenter: "Help Center",
      contactSupport: "Contact Support",
      rateApp: "Rate Floussly"
    },
    logout: "Logout",
    version: "Floussly v1.0.0 • © 2025 Floussly Inc."
  },
  
  // Payment
  payment: {
    title: "Payment",
    withdrawTitle: "Withdrawal",
    pageTitle: "Make a Payment",
    enterAmount: "Enter Amount",
    amount: "Amount",
    description: "Purpose",
    descriptionPlaceholder: "What's this payment for?",
    selectMethod: "Select Payment Method",
    selectMethodError: "Please select a payment method",
    amountError: "Please enter a valid amount",
    amountTooLarge: "Amount exceeds the maximum limit",
    creditCard: "Credit Card",
    agent: "Agent",
    useCardToProcess: "Use your card to process the payment",
    scanQRToWithdraw: "Scan agent QR code to withdraw",
    showQRToDeposit: "Show your QR code to agent to deposit",
    processing: "Processing your payment...",
    payNow: "Pay Now",
    successTitle: "Payment Successful",
    successDescription: "Your payment of {{amount}}",
    failureTitle: "Payment Failed",
    failureDescription: "We encountered an issue processing your payment. Please try again.",
    reference: "Reference",
    withdrawalProcessed: "Your withdrawal request has been processed",
    failedTitle: "Payment Failed",
    initializationFailed: "Failed to initialize payment",
    processingFailed: "Failed to process payment",
    verificationFailed: "Payment verification failed",
    paymentCompleted: "Your payment has been completed"
  },
  
  // Camera
  camera: {
    error: "Camera Error",
    notSupported: "Your device doesn't support camera access",
    permissionDenied: "Camera permission denied",
    permissionRequired: "Camera permission is required to scan QR codes",
    requestAccess: "Request Camera Access"
  },
  
  // Bank Accounts
  bankAccounts: {
    title: "Bank Accounts",
    linkedAccounts: "Linked Bank Accounts",
    addAccount: "Add Bank Account",
    addAccountDescription: "Enter your bank account details below to link it to your Floussly wallet.",
    editAccount: "Edit Bank Account",
    editAccountDescription: "Update your bank account details below.",
    deleteAccount: "Delete Bank Account",
    accountDetails: "Account Details",
    bankDetails: "Bank Details",
    userDetails: "Account Details",
    internationalDetails: "International Details",
    bankName: "Bank Name",
    bankNamePlaceholder: "Select your bank",
    selectBankPlaceholder: "Select a bank",
    accountNumber: "Account Number",
    accountNumberPlaceholder: "123456789",
    accountHolderName: "Account Holder Name",
    accountHolderNamePlaceholder: "Your name",
    accountType: "Account Type",
    selectAccountTypePlaceholder: "Select account type",
    rib: "RIB",
    ribPlaceholder: "00000000000000000000",
    iban: "IBAN",
    ibanPlaceholder: "MA00 0000 0000 0000 0000 0000",
    swift: "SWIFT Code",
    swiftPlaceholder: "BMCEMAMC",
    isDefault: "Set as Default Account",
    default: "Default",
    defaultDescription: "This account will be used as your default for transfers and withdrawals.",
    makeDefault: "Make Default",
    noAccounts: "No Linked Bank Accounts",
    noAccountsDescription: "You haven't linked any bank accounts yet. Add one to enable transfers to and from your bank.",
    deleteConfirm: "Are you sure you want to delete this account?",
    deleteWarning: "This action cannot be undone and may affect your pending transfers.",
    successful: "Bank account has been successfully {{action}}.",
    accountAdded: "Your bank account has been added successfully.",
    accountUpdated: "Your bank account has been updated successfully.",
    accountDeleted: "Your bank account has been deleted successfully.",
    defaultSet: "Your default bank account has been updated.",
    optional: "Optional",
    topUpFromBankDescription: "Coming soon: Top up your Floussly wallet from this bank account",
    withdrawToBank: "Withdraw to Bank Account",
    withdrawToBankDescription: "Transfer funds from your Floussly wallet to your bank account",
    selectBankAccount: "Select Bank Account",
    transferTimeWarning: "Bank withdrawals typically take 1-3 business days to process depending on your bank.",
    confirmWithdrawal: "Confirm Withdrawal",
    withdrawalSuccessful: "Your withdrawal request has been submitted successfully.",
    withdrawalPending: "Your withdrawal is being processed and will be transferred to your bank account shortly.",
    withdrawalInitiated: "Your withdrawal request has been initiated. The funds will be transferred to your bank account shortly.",
    types: {
      checking: "Checking",
      savings: "Savings",
      business: "Business"
    },
    status: {
      verified: "Verified",
      unverified: "Unverified",
      pending: "Pending Verification",
      active: "Active"
    },
    errors: {
      invalidAccount: "Invalid account details",
      alreadyExists: "This account is already linked",
      invalidRib: "Invalid RIB number",
      invalidAccountNumber: "Invalid account number",
      createFailed: "Failed to create bank account. Please try again.",
      updateFailed: "Failed to update bank account. Please try again.",
      deleteFailed: "Failed to delete bank account. Please try again.",
      setDefaultFailed: "Failed to set default bank account. Please try again.",
      withdrawalFailed: "Failed to process your withdrawal request. Please try again."
    },
    bankTransfer: "Bank Transfer",
    topUp: "Top Up from Bank",
    withdraw: "Withdraw to Bank",
    externalTransfer: "Transfer to External Account",
    bankTransferAccount: "Select Bank Account",
    recipient: "Recipient",
    recipientName: "Recipient Name",
    recipientBank: "Recipient Bank",
    recipientRib: "Recipient RIB",
    transferDescription: "Description"
  },
  
  // Financial Health
  financialHealth: {
    title: "Financial Health",
    overallScore: "Your Financial Health Score",
    scoreDescription: "Based on your spending, saving, and debt management habits",
    poor: "Poor",
    excellent: "Excellent",
    status: {
      label: "Your financial health is",
      great: "Great! You're on track to achieve your financial goals",
      good: "Good. Your finances are in a healthy position",
      neutral: "Okay. There are some areas that need attention",
      concerning: "Needs attention. Several areas of concern in your financial situation",
      critical: "Critical. Immediate action is needed to improve your financial position"
    },
    tabs: {
      overview: "Overview",
      metrics: "Metrics",
      trends: "Trends"
    },
    savingsRate: "Savings Rate",
    savingsRateDescription: "Percentage of income you're saving",
    debtToIncome: "Debt-to-Income",
    debtToIncomeDescription: "Percentage of income going to debt payments",
    emergencyFund: "Emergency Fund Coverage",
    emergencyFundDescription: "Aim for 3-6 months of expenses in your emergency fund",
    months: "months",
    budgetAdherence: "Budget Adherence",
    budgetAdherenceDescription: "How well you're sticking to your budget",
    investmentGrowth: "Investment Growth",
    investmentGrowthDescription: "Annual growth rate of your investments",
    recommendations: "Personalized Recommendations",
    recommendationsDescription: "Get advice tailored to your financial situation",
    getPersonalizedAdvice: "Get Personalized Advice",
    balanceTrend: "Balance Trend",
    personalizedTips: "Tips for Your Financial Situation",
    tips: {
      great: {
        "1": "Consider increasing your investment portfolio for long-term growth",
        "2": "Look into tax optimization strategies for your savings",
        "3": "Review your insurance coverage to ensure it meets your needs"
      },
      good: {
        "1": "Try to increase your savings rate by 1-2% this month",
        "2": "Look for opportunities to diversify your investments",
        "3": "Consider setting up automatic transfers to your savings"
      },
      neutral: {
        "1": "Focus on building your emergency fund to 3-6 months of expenses",
        "2": "Review your budget to find areas where you can cut back",
        "3": "Consider consolidating high-interest debt"
      },
      concerning: {
        "1": "Prioritize paying down high-interest debt",
        "2": "Cut non-essential expenses to increase monthly savings",
        "3": "Explore additional income sources or side hustles"
      },
      critical: {
        "1": "Create a strict budget to control spending immediately",
        "2": "Contact creditors to discuss payment plans if struggling",
        "3": "Prioritize building a small emergency fund (even just 500 MAD)"
      }
    }
  },
  
  // Celebration and achievement animations
  celebrations: {
    congratulations: "Congratulations!",
    general: "You've reached a new milestone!",
    savings: "You've saved {{amount}} MAD! Keep up the great work!",
    payment: "Payment of {{amount}} MAD completed successfully!",
    budget: "You're sticking to your budget. Great financial discipline!",
    transfer: "Transfer of {{amount}} MAD completed successfully!",
    daret: "You've contributed {{amount}} MAD to your Daret!",
    closeButton: "Got it!",
    share: "Share this achievement",
    continueButton: "Continue"
  },
  
  achievements: {
    generic: {
      title: "Achievement Unlocked!",
      description: "You've reached a new milestone in your financial journey."
    },
    firstTransfer: {
      title: "First Transfer Completed!",
      description: "You've successfully made your first money transfer with Floussly."
    },
    savingsGoalReached: {
      title: "Savings Goal Reached!",
      description: "You've reached your savings goal of {{value}} MAD. Time to celebrate!"
    },
    budgetStreak: {
      title: "Budget Streak!",
      description: "You've stayed within budget for {{days}} days in a row. Amazing discipline!"
    },
    transactionMilestone: {
      title: "Transaction Milestone!",
      description: "You've completed {{count}} transactions with Floussly. Thank you for your trust!"
    },
    daretCompletion: {
      title: "Daret Completed!",
      description: "Your Daret cycle has been successfully completed. Everyone got paid!"
    },
    perfectPayment: {
      title: "Perfect Payment Record!",
      description: "You've never missed a payment. Your financial discipline is impressive!"
    },
    goalContribution: {
      title: "Goal Contribution!",
      description: "You've added {{value}} MAD toward your financial goal!"
    },
    billPayment: {
      title: "Bill Payment Complete!",
      description: "You've successfully paid your bill on time. No late fees for you!"
    }
  },
  
  floussdrop: {
    create: 'Create FloussDrop',
    find: 'Find FloussDrop',
    unlock: 'Unlock',
    claim: 'Claim',
    amount: 'Amount',
    location: 'Location',
  },
};
