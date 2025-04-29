export default {
  // General
  appName: "Floussly",
  tagline: "Votre Super App Marocaine",
  
  // Common
  common: {
    loading: "Chargement...",
    dataUnavailable: "Données indisponibles",
    error: "Erreur",
    retry: "Réessayer",
    noData: "Aucune donnée disponible",
    cancel: "Annuler",
    confirm: "Confirmer",
    save: "Enregistrer",
    delete: "Supprimer",
    edit: "Modifier",
    view: "Voir",
    viewAll: "Voir tout",
    close: "Fermer",
    continue: "Continuer",
    back: "Retour",
    returnHome: "Retourner à l'accueil",
    months: {
      jan: "Jan",
      feb: "Fév",
      mar: "Mar",
      apr: "Avr",
      may: "Mai",
      jun: "Juin",
      jul: "Juil",
      aug: "Août",
      sep: "Sep",
      oct: "Oct",
      nov: "Nov",
      dec: "Déc"
    },
    currency: "MAD",
    generating: "Génération en cours...",
    tryAgain: "Réessayer",
    completed: "Terminé",
    defaultUserName: "Utilisateur Floussly"
  },
  
  // Auth
  auth: {
    welcome: "Bienvenue",
    signInMessage: "Connectez-vous pour accéder à votre compte Floussly",
    phoneNumber: "Numéro de téléphone",
    continue: "Continuer",
    signInWithEmail: "Se connecter avec Email",
    dontHaveAccount: "Vous n'avez pas encore de compte?",
    signUp: "S'inscrire",
    verification: "Vérification",
    verificationMessage: "Nous avons envoyé un code à",
    verify: "Vérifier et continuer",
    didntReceiveCode: "Vous n'avez pas reçu le code?",
    resend: "Renvoyer",
    identity: "Vérification d'identité",
    identityMessage: "Nous devons vérifier votre identité avant que vous puissiez utiliser toutes les fonctionnalités",
    uploadId: "Télécharger CIN",
    uploadIdMessage: "Cliquez pour télécharger le recto et le verso de votre pièce d'identité",
    takeSelfie: "Prendre un Selfie",
    takeSelfieMessage: "Prenez une photo claire de votre visage",
    submit: "Soumettre pour vérification"
  },
  
  // Navigation
  nav: {
    home: "Accueil",
    transfers: "Transferts",
    qr: "QR",
    finance: "Finance",
    profile: "Profil",
    back: "Retour"
  },
  
  // Home
  home: {
    welcomeBack: "Bon retour",
    recentTransactions: "Transactions récentes",
    seeAll: "Voir tout",
    financialSummary: "Résumé financier"
  },
  
  // Wallet
  wallet: {
    availableBalance: "Solde disponible",
    topUp: "Recharger",
    withdraw: "Retirer",
    send: "Envoyer",
    topUpTitle: "Recharger",
    topUpDescription: "Sélectionnez une méthode de paiement pour recharger votre portefeuille",
    withdrawTitle: "Retirer",
    withdrawDescription: "Sélectionnez une méthode pour retirer vos fonds",
    viewTrends: "Voir les tendances",
    history: "Historique des transactions",
    details: "Détails du portefeuille"
  },
  
  // Actions
  actions: {
    send: "Envoyer",
    scan: "Scanner",
    tontine: "Daret",
    agents: "Agents"
  },
  
  // Transactions
  transaction: {
    title: "Transactions",
    status: {
      pending: "En attente",
      completed: "Terminé",
      failed: "Échoué"
    },
    yourBalance: "Votre solde",
    amount: "Montant",
    recipient: "Destinataire",
    searchRecipient: "Rechercher par nom ou téléphone",
    recentContacts: "Contacts récents",
    note: "Note (Optionnel)",
    noteHint: "C'est pour quoi?",
    sendMoney: "Envoyer de l'argent",
    transferFee: "Frais de transfert: 2,5% (≤500 MAD) ou 3% (>500 MAD, max 15 MAD)"
  },
  
  // Tontine
  tontine: {
    daret: "Daret",
    manageGroups: "Gérez vos groupes de tontine",
    createNew: "Créer nouveau",
    joinExisting: "Rejoindre existant",
    yourActive: "Vos Daret actifs",
    past: "Daret passés",
    monthly: "Mensuel: {{currency}} {{amount}}",
    members: "Membres: {{count}}",
    cyclesCompleted: "{{current}}/{{total}} cycles terminés",
    nextPayment: "Prochain paiement: {{date}}",
    ended: "Terminé le: {{date}}",
    viewDetails: "Voir détails",
    viewHistory: "Voir historique",
    viewDetailsTitle: "Détails du Daret",
    viewDetailsDescription: "Affichage des détails pour {{name}}"
  },
  
  // QR Code
  qr: {
    payment: "Paiement QR",
    scanToSend: "Scannez pour envoyer de l'argent ou partagez votre code pour recevoir",
    yourCode: "Votre code Floussly",
    scanCode: "Scanner code",
    shareCode: "Partager code",
    history: "Historique des paiements QR"
  },
  
  // Finance
  finance: {
    dashboard: "Tableau de bord financier",
    trackSpending: "Suivez vos habitudes de dépenses et d'épargne",
    overview: "Aperçu",
    thisMonth: "Ce mois",
    lastMonth: "Le mois dernier",
    lastQuarter: "3 derniers mois",
    income: "Revenus",
    expenses: "Dépenses",
    savings: "Épargnes",
    summary: "Résumé financier",
    financialOverview: "Aperçu financier",
    moneyMovement: "Mouvement d'argent",
    ofIncome: "du revenu",
    vsLast: "vs dernier {{period}}",
    month: "mois",
    quarter: "trimestre",
    analyze: "Analyser",
    viewDetailedAnalytics: "Voir analyses détaillées",
    viewAnalyticsTitle: "Analyses",
    viewAnalyticsDescription: "Des analyses financières détaillées sont disponibles dans la version complète",
    spendingByCategory: "Dépenses par catégorie",
    budgetStatus: "État du budget",
    addNewBudget: "Ajouter nouveau budget",
    export: {
      csv: "Exporter CSV",
      pdf: "Exporter PDF"
    },
    // Savings Challenges
    savingChallenges: "Défis d'Épargne",
    progress: "Progrès",
    deadline: "Date limite",
    reward: "Récompense",
    challengeCompleted: "Défi Terminé!",
    congratulations: "Félicitations! Vous avez gagné:",
    keepUpGreatWork: "Continuez le bon travail! Vérifiez vos récompenses dans votre profil.",
    claimReward: "Réclamer la Récompense",
    challenges: {
      quickSaver: "Épargnant Rapide",
      quickSaverDesc: "Épargnez {{amount}} MAD dans votre portefeuille en un jour",
      weeklyGuardian: "Gardien Hebdomadaire",
      weeklyGuardianDesc: "Épargnez {{amount}} MAD cette semaine",
      monthlyMaster: "Maître Mensuel",
      monthlyMasterDesc: "Épargnez {{amount}} MAD ce mois",
      hours: "{{count}} heures",
      daysLeft: "{{count}} jours restants",
      points: "{{count}} points Floussly",
      bigReward: "{{count}} points Floussly + {{interest}}% d'intérêt supplémentaire"
    }
  },
  
  // Budget
  budget: {
    category: {
      groceries: "Épicerie",
      transport: "Transport",
      entertainment: "Divertissement",
      utilities: "Services publics",
      rent: "Loyer",
      health: "Santé",
      education: "Éducation",
      other: "Autre"
    }
  },
  
  // Agents
  agents: {
    network: "Réseau d'agents",
    findNear: "Trouvez des agents Floussly près de chez vous",
    nearest: "Agents les plus proches",
    viewAll: "Voir tous les agents",
    servicesAvailable: "Services disponibles",
    distanceAndHours: "{{distance}} km • Ouvert jusqu'à {{openUntil}}",
    viewAgentTitle: "Détails de l'agent",
    viewAgentDescription: "Affichage des détails pour {{name}}"
  },
  
  // Notifications
  notifications: {
    title: "Notifications",
    today: "Aujourd'hui",
    yesterday: "Hier",
    markAllRead: "Marquer tout comme lu",
    loadMore: "Charger plus"
  },
  
  // Settings
  settings: {
    title: "Paramètres",
    editProfile: "Modifier profil",
    preferences: "Préférences",
    darkMode: "Mode sombre",
    language: "Langue",
    notifications: "Notifications",
    biometricLogin: "Connexion biométrique",
    security: {
      title: "Sécurité",
      changePin: "Changer PIN",
      securitySettings: "Paramètres de sécurité",
      loginActivity: "Activité de connexion"
    },
    support: {
      title: "Support",
      helpCenter: "Centre d'aide",
      contactSupport: "Contacter le support",
      rateApp: "Évaluer Floussly"
    },
    logout: "Déconnexion",
    version: "Floussly v1.0.0 • © 2025 Floussly Inc."
  },
  
  // Financial Health
  financialHealth: {
    title: "Santé Financière",
    overallScore: "Votre Score de Santé Financière",
    scoreDescription: "Basé sur vos habitudes de dépenses, d'épargne et de gestion de dette",
    poor: "Faible",
    excellent: "Excellent",
    status: {
      label: "Votre santé financière est",
      great: "Excellente ! Vous êtes sur la bonne voie pour atteindre vos objectifs financiers",
      good: "Bonne. Vos finances sont en bonne position",
      neutral: "Correcte. Il y a quelques domaines qui nécessitent votre attention",
      concerning: "À surveiller. Plusieurs domaines préoccupants dans votre situation financière",
      critical: "Critique. Une action immédiate est nécessaire pour améliorer votre position financière"
    },
    tabs: {
      overview: "Aperçu",
      metrics: "Métriques",
      trends: "Tendances"
    },
    savingsRate: "Taux d'Épargne",
    savingsRateDescription: "Pourcentage de revenus que vous épargnez",
    debtToIncome: "Dette-sur-Revenu",
    debtToIncomeDescription: "Pourcentage de revenus destinés aux paiements de dettes",
    emergencyFund: "Couverture Fonds d'Urgence",
    emergencyFundDescription: "Visez 3-6 mois de dépenses dans votre fonds d'urgence",
    months: "mois",
    budgetAdherence: "Respect du Budget",
    budgetAdherenceDescription: "Comment vous respectez votre budget",
    investmentGrowth: "Croissance des Investissements",
    investmentGrowthDescription: "Taux de croissance annuel de vos investissements",
    recommendations: "Recommandations Personnalisées",
    recommendationsDescription: "Obtenez des conseils adaptés à votre situation financière",
    getPersonalizedAdvice: "Obtenir des Conseils Personnalisés",
    balanceTrend: "Tendance du Solde",
    personalizedTips: "Conseils pour Votre Situation Financière",
    tips: {
      great: {
        "1": "Envisagez d'augmenter votre portefeuille d'investissement pour une croissance à long terme",
        "2": "Explorez des stratégies d'optimisation fiscale pour vos économies",
        "3": "Révisez votre couverture d'assurance pour vous assurer qu'elle répond à vos besoins"
      },
      good: {
        "1": "Essayez d'augmenter votre taux d'épargne de 1-2% ce mois-ci",
        "2": "Recherchez des opportunités pour diversifier vos investissements",
        "3": "Envisagez de mettre en place des transferts automatiques vers votre épargne"
      },
      neutral: {
        "1": "Concentrez-vous sur la constitution de votre fonds d'urgence à 3-6 mois de dépenses",
        "2": "Révisez votre budget pour trouver des domaines où vous pouvez réduire les dépenses",
        "3": "Envisagez de consolider les dettes à intérêt élevé"
      },
      concerning: {
        "1": "Prioritisez le remboursement des dettes à intérêt élevé",
        "2": "Réduisez les dépenses non essentielles pour augmenter l'épargne mensuelle",
        "3": "Explorez des sources de revenus supplémentaires ou des petits jobs"
      },
      critical: {
        "1": "Créez un budget strict pour contrôler immédiatement les dépenses",
        "2": "Contactez les créanciers pour discuter des plans de paiement si vous êtes en difficulté",
        "3": "Priorisez la constitution d'un petit fonds d'urgence (même juste 500 MAD)"
      }
    }
  }
};
