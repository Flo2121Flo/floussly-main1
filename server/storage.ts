import { 
  User, InsertUser, 
  Wallet, InsertWallet, 
  Transaction, InsertTransaction, 
  Daret, InsertDaret, 
  DaretMember, InsertDaretMember,
  Agent, InsertAgent,
  Budget, InsertBudget,
  Notification, InsertNotification,
  BankAccount, InsertBankAccount,
  BankTransfer, InsertBankTransfer,
  CryptoWallet, InsertCryptoWallet,
  CryptoTransaction, InsertCryptoTransaction
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Contacts (converted from users to the contact format needed by the UI)
  getContacts(): Promise<{id: string; name: string; phone: string; image?: string;}[]>;
  
  // KYC
  submitKyc(kyc: { userId: number, idCardFront: string, idCardBack: string, selfie: string, status: string }): Promise<void>;
  
  // Wallets
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletByUserId(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: number, updates: Partial<Wallet>): Promise<Wallet>;
  
  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Darets
  getDaret(id: number): Promise<Daret | undefined>;
  getDaretsByUserId(userId: number): Promise<Daret[]>;
  createDaret(daret: InsertDaret): Promise<Daret>;
  updateDaret(id: number, updates: Partial<Daret>): Promise<Daret>;
  
  // Daret Members
  getDaretMembers(daretId: number): Promise<DaretMember[]>;
  addDaretMember(member: InsertDaretMember): Promise<DaretMember>;
  
  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  
  // Budgets
  getBudgetsByUserId(userId: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  
  // Notifications
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  
  // Bank Accounts
  getBankAccount(id: number): Promise<BankAccount | undefined>;
  getBankAccountsByUserId(userId: number): Promise<BankAccount[]>;
  createBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: number, updates: Partial<BankAccount>): Promise<BankAccount>;
  deleteBankAccount(id: number): Promise<void>;
  setDefaultBankAccount(userId: number, accountId: number): Promise<void>;
  
  // Bank Transfers
  getBankTransfer(id: number): Promise<BankTransfer | undefined>;
  getBankTransfersByUserId(userId: number): Promise<BankTransfer[]>;
  createBankTransfer(bankTransfer: InsertBankTransfer): Promise<BankTransfer>;
  updateBankTransferStatus(id: number, status: string, transactionId?: number): Promise<BankTransfer>;
  
  // Crypto Wallets (Hidden Feature - Disabled until legal framework allows)
  getCryptoWallet(id: number): Promise<CryptoWallet | undefined>;
  getCryptoWalletByUserId(userId: number): Promise<CryptoWallet[]>;
  createCryptoWallet(wallet: InsertCryptoWallet): Promise<CryptoWallet>;
  updateCryptoWallet(id: number, updates: Partial<CryptoWallet>): Promise<CryptoWallet>;
  
  // Crypto Transactions (Hidden Feature - Disabled until legal framework allows)
  getCryptoTransaction(id: number): Promise<CryptoTransaction | undefined>;
  getCryptoTransactionsByWalletId(walletId: number): Promise<CryptoTransaction[]>;
  createCryptoTransaction(transaction: InsertCryptoTransaction): Promise<CryptoTransaction>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private transactions: Map<number, Transaction>;
  private darets: Map<number, Daret>;
  private daretMembers: Map<number, DaretMember>;
  private agents: Map<number, Agent>;
  private budgets: Map<number, Budget>;
  private notifications: Map<number, Notification>;
  private userKyc: Map<number, { userId: number, idCardFront: string, idCardBack: string, selfie: string, status: string }>;
  
  // Bank account storage
  private bankAccounts: Map<number, BankAccount>;
  private bankTransfers: Map<number, BankTransfer>;
  
  // Crypto wallet storage (Hidden until legal framework allows)
  private cryptoWallets: Map<number, CryptoWallet>;
  private cryptoTransactions: Map<number, CryptoTransaction>;
  
  private userIdCounter: number;
  private walletIdCounter: number;
  private transactionIdCounter: number;
  private daretIdCounter: number;
  private daretMemberIdCounter: number;
  private agentIdCounter: number;
  private budgetIdCounter: number;
  private notificationIdCounter: number;
  private bankAccountIdCounter: number;
  private bankTransferIdCounter: number;
  private cryptoWalletIdCounter: number;
  private cryptoTransactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    this.darets = new Map();
    this.daretMembers = new Map();
    this.agents = new Map();
    this.budgets = new Map();
    this.notifications = new Map();
    this.userKyc = new Map();
    
    // Initialize bank account storage
    this.bankAccounts = new Map();
    this.bankTransfers = new Map();
    
    // Initialize crypto wallet storage
    this.cryptoWallets = new Map();
    this.cryptoTransactions = new Map();
    
    this.userIdCounter = 1;
    this.walletIdCounter = 1;
    this.transactionIdCounter = 1;
    this.daretIdCounter = 1;
    this.daretMemberIdCounter = 1;
    this.agentIdCounter = 1;
    this.budgetIdCounter = 1;
    this.notificationIdCounter = 1;
    this.bankAccountIdCounter = 1;
    this.bankTransferIdCounter = 1;
    this.cryptoWalletIdCounter = 1;
    this.cryptoTransactionIdCounter = 1;
    
    // Demo data is now initialized from seed-data.ts
  }

  // Initialize demo data
  private async initializeDemoData() {
    // Create demo users
    const user1 = await this.createUser({
      username: "mohammed",
      password: "password123",
      name: "Mohammed Alami",
      phone: "+212600000000",
      email: "mohammed@example.com",
      profileImage: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY5OTUzMjQ1Ng&ixlib=rb-4.0.3&q=80",
      isVerified: true,
      role: "user"
    });

    const user2 = await this.createUser({
      username: "laila",
      password: "password123",
      name: "Laila Bensouda",
      phone: "+212600000001",
      isVerified: true,
      role: "user",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=100&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY5OTUzMjM5Nw&ixlib=rb-4.0.3&q=80"
    });

    const user3 = await this.createUser({
      username: "hassan",
      password: "password123",
      name: "Hassan Chaoui",
      phone: "+212600000002",
      isVerified: true,
      role: "user",
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=100&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY5OTUzMjM2OQ&ixlib=rb-4.0.3&q=80"
    });

    const user4 = await this.createUser({
      username: "karim",
      password: "password123",
      name: "Karim Amrani",
      phone: "+212600000003",
      isVerified: true,
      role: "user",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=100&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY5OTUzMjQyMQ&ixlib=rb-4.0.3&q=80"
    });
    
    const user5 = await this.createUser({
      username: "fatima",
      password: "password123",
      name: "Fatima Zahra",
      phone: "+212600000004",
      isVerified: true,
      role: "user",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=100&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY5OTUzMjQ4Mw&ixlib=rb-4.0.3&q=80"
    });

    // Create wallets for all users
    await this.createWallet({
      userId: user1.id,
      balance: 5241.50,
      currency: "MAD"
    });

    await this.createWallet({
      userId: user2.id,
      balance: 2500,
      currency: "MAD"
    });

    await this.createWallet({
      userId: user3.id,
      balance: 7800,
      currency: "MAD"
    });

    await this.createWallet({
      userId: user4.id,
      balance: 3200,
      currency: "MAD"
    });

    await this.createWallet({
      userId: user5.id,
      balance: 4100,
      currency: "MAD"
    });

    // Create some transactions
    // Using new fee structure: wallet-to-wallet is free
    await this.createTransaction({
      type: "send",
      senderId: user1.id,
      receiverId: user2.id,
      amount: 250,
      fee: 0, // Wallet-to-wallet transfers are free
      currency: "MAD",
      status: "completed",
      category: "transfer",
      note: "For lunch",
      createdAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) // Yesterday
    });

    // Using new fee structure: wallet-to-wallet is free
    await this.createTransaction({
      type: "receive",
      senderId: user3.id,
      receiverId: user1.id,
      amount: 1000,
      fee: 0, // Wallet-to-wallet transfers are free
      currency: "MAD",
      status: "completed",
      category: "transfer",
      note: "Repayment",
      createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    });

    await this.createTransaction({
      type: "topup",
      receiverId: user1.id,
      amount: 2000,
      fee: 0,
      currency: "MAD",
      status: "completed",
      category: "wallet",
      createdAt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    });
    
    // Create QR payment transactions
    await this.createTransaction({
      type: "send",
      senderId: user1.id,
      receiverId: 0, // Merchant
      amount: 85,
      fee: 0,
      currency: "MAD",
      status: "completed",
      category: "payment",
      note: "Café Maroc",
      qrCode: "cafe-maroc-qr",
      createdAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) // Yesterday
    });
    
    await this.createTransaction({
      type: "send",
      senderId: user1.id,
      receiverId: 0, // Merchant
      amount: 132.5,
      fee: 0,
      currency: "MAD",
      status: "completed",
      category: "payment",
      note: "Ahmed Grocery",
      qrCode: "ahmed-grocery-qr",
      createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    });
    
    await this.createTransaction({
      type: "receive",
      senderId: user3.id,
      receiverId: user1.id,
      amount: 1000,
      fee: 0,
      currency: "MAD",
      status: "completed",
      category: "transfer",
      qrCode: "user1-qr",
      createdAt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    });

    // Create tontines (darets)
    const tontine1 = await this.createTontine({
      name: "Family Daret",
      creatorId: user1.id,
      amount: 1000,
      currency: "MAD",
      totalMembers: 10,
      currentCycle: 4,
      status: "active",
      startDate: new Date(new Date().getTime() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
      nextPaymentDate: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
    });

    const tontine2 = await this.createTontine({
      name: "Office Colleagues",
      creatorId: user1.id,
      amount: 2000,
      currency: "MAD",
      totalMembers: 8,
      currentCycle: 2,
      status: "payment_due",
      startDate: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      nextPaymentDate: new Date() // Today
    });

    const tontine3 = await this.createTontine({
      name: "Neighborhood",
      creatorId: user1.id,
      amount: 500,
      currency: "MAD",
      totalMembers: 6,
      currentCycle: 6,
      status: "completed",
      startDate: new Date(new Date().getTime() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
      endDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    });

    // Add members to tontines
    await this.addTontineMember({
      tontineId: tontine1.id,
      userId: user1.id,
      order: 1
    });

    await this.addTontineMember({
      tontineId: tontine1.id,
      userId: user2.id,
      order: 2
    });

    await this.addTontineMember({
      tontineId: tontine1.id,
      userId: user3.id,
      order: 3
    });

    await this.addTontineMember({
      tontineId: tontine2.id,
      userId: user1.id,
      order: 1
    });

    await this.addTontineMember({
      tontineId: tontine2.id,
      userId: user4.id,
      order: 2
    });

    await this.addTontineMember({
      tontineId: tontine3.id,
      userId: user1.id,
      order: 1
    });

    // Create agents
    await this.createAgent({
      name: "Marjane Agent",
      userId: 0, // System agent
      address: "123 Marjane Mall, Casablanca",
      latitude: 33.5731,
      longitude: -7.5898,
      openingTime: "08:00",
      closingTime: "20:00",
      services: ["top_up", "withdraw", "bill_payment"],
      status: "active"
    });

    await this.createAgent({
      name: "Carrefour Agent",
      userId: 0, // System agent
      address: "456 Morocco Mall, Casablanca",
      latitude: 33.5800,
      longitude: -7.7022,
      openingTime: "09:00",
      closingTime: "22:00",
      services: ["top_up", "withdraw", "bill_payment", "support"],
      status: "active"
    });

    await this.createAgent({
      name: "Aswak Assalam Agent",
      userId: 0, // System agent
      address: "789 Aswak Assalam, Rabat",
      latitude: 34.0209,
      longitude: -6.8416,
      openingTime: "08:30",
      closingTime: "21:00",
      services: ["top_up", "withdraw"],
      status: "active"
    });

    // Create budgets
    await this.createBudget({
      userId: user1.id,
      category: "groceries",
      limit: 1200,
      currency: "MAD",
      period: "monthly"
    });

    await this.createBudget({
      userId: user1.id,
      category: "transport",
      limit: 800,
      currency: "MAD",
      period: "monthly"
    });

    await this.createBudget({
      userId: user1.id,
      category: "entertainment",
      limit: 400,
      currency: "MAD",
      period: "monthly"
    });

    // Create notifications
    await this.createNotification({
      userId: user1.id,
      type: "money_received",
      title: "Money Received",
      message: "You've received MAD 1,000 from Hassan",
      isRead: false,
      relatedId: "tx-2"
    });

    await this.createNotification({
      userId: user1.id,
      type: "payment_reminder",
      title: "Daret Payment Reminder",
      message: 'Your payment of MAD 2,000 for "Office Colleagues" is due today',
      isRead: false,
      relatedId: "tontine-2"
    });

    await this.createNotification({
      userId: user1.id,
      type: "kyc_verification",
      title: "KYC Verification",
      message: "Your identity has been successfully verified",
      isRead: false,
      relatedId: "kyc-1"
    });

    await this.createNotification({
      userId: user1.id,
      type: "transaction",
      title: "Transaction Completed",
      message: "Your transfer of MAD 250 to Laila was successful",
      isRead: true,
      relatedId: "tx-1",
      createdAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) // Yesterday
    });

    await this.createNotification({
      userId: user1.id,
      type: "referral",
      title: "Referral Bonus",
      message: "You've earned MAD 50 for referring Karim to Floussly",
      isRead: true,
      relatedId: "ref-1",
      createdAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) // Yesterday
    });
    
    // Create bank accounts for demo users
    // Bank account for Mohammed (user1)
    await this.createBankAccount({
      userId: user1.id,
      bankName: "Attijariwafa Bank",
      accountHolderName: "Mohammed Alami",
      accountNumber: "0987654321",
      rib: "007123456789012345678901",
      iban: "MA01007123456789012345678901",
      swift: "BCMAMAMC",
      accountType: "checking",
      isDefault: true,
      status: "active"
    });
    
    await this.createBankAccount({
      userId: user1.id,
      bankName: "Bank Al-Maghrib",
      accountHolderName: "Mohammed Alami",
      accountNumber: "1234567890",
      rib: "011123456789012345678902",
      iban: "MA01011123456789012345678902",
      swift: "BKAMMAMR",
      accountType: "savings",
      isDefault: false,
      status: "active"
    });
    
    // Bank account for Laila (user2)
    await this.createBankAccount({
      userId: user2.id,
      bankName: "BMCE Bank",
      accountHolderName: "Laila Bensouda",
      accountNumber: "3456789012",
      rib: "011765432187654321876543",
      iban: "MA01011765432187654321876543",
      swift: "BMCEMAMC",
      accountType: "checking",
      isDefault: true,
      status: "active"
    });
    
    // Create bank transfers for demo users using the new fee structure
    // Top-up transfer for Mohammed (user1)
    await this.createBankTransfer({
      userId: user1.id,
      bankAccountId: 1, // First bank account
      type: "topup",
      direction: "incoming",
      amount: "1000",
      fee: "2.75", // New fee structure: 2.75 MAD for <= 1000 MAD
      currency: "MAD",
      reference: "TOPUP123456",
      status: "completed",
      completedAt: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    });
    
    // Withdrawal for Mohammed (user1)
    await this.createBankTransfer({
      userId: user1.id,
      bankAccountId: 1,
      type: "withdrawal",
      direction: "outgoing",
      amount: "500",
      fee: "5", // New fee structure: Cash-out 1% with 4 MAD minimum, 500 * 1% = 5 MAD
      currency: "MAD",
      reference: "WITHDR123456",
      status: "completed",
      completedAt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    });
    
    // Bank transfer from Mohammed (user1) to an external account via RIB
    await this.createBankTransfer({
      userId: user1.id,
      bankAccountId: 1,
      type: "bank_transfer",
      direction: "outgoing",
      amount: "750",
      fee: "2.75", // New fee structure: 2.75 MAD for <= 1000 MAD
      currency: "MAD",
      recipientName: "Hassan Mezouar",
      recipientRib: "022987654321098765432109",
      recipientBank: "CIH Bank",
      reference: "BTRANSF123456",
      status: "completed",
      completedAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    });
    
    // Pending top-up
    await this.createBankTransfer({
      userId: user1.id,
      bankAccountId: 2, // Second bank account
      type: "topup",
      direction: "incoming",
      amount: "2000",
      fee: "13", // New fee structure: Max 13 MAD for bank transfers > 1000 MAD
      currency: "MAD",
      reference: "TOPUP789012",
      status: "pending"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getContacts(): Promise<{id: string; name: string; phone: string; image?: string;}[]> {
    const users = await this.getUsers();
    return users.map(user => ({
      id: user.id.toString(),
      name: user.name,
      phone: user.phone,
      image: user.profileImage || undefined
    }));
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const nowDate = new Date();
    const newUser: User = { ...user, id, createdAt: nowDate };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // KYC methods
  async submitKyc(kyc: { userId: number, idCardFront: string, idCardBack: string, selfie: string, status: string }): Promise<void> {
    this.userKyc.set(kyc.userId, kyc);
  }

  // Wallet methods
  async getWallet(id: number): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async getWalletByUserId(userId: number): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.userId === userId
    );
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const id = this.walletIdCounter++;
    const nowDate = new Date();
    const newWallet: Wallet = { 
      ...wallet, 
      id, 
      updatedAt: nowDate, 
      createdAt: nowDate 
    };
    this.wallets.set(id, newWallet);
    return newWallet;
  }

  async updateWallet(id: number, updates: Partial<Wallet>): Promise<Wallet> {
    const wallet = await this.getWallet(id);
    if (!wallet) {
      throw new Error(`Wallet with id ${id} not found`);
    }
    
    const updatedWallet = { ...wallet, ...updates, updatedAt: new Date() };
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.senderId === userId || tx.receiverId === userId
    ).sort((a, b) => {
      // Sort by date, newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const nowDate = new Date();
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      createdAt: transaction.createdAt || nowDate, 
      updatedAt: nowDate 
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  // Daret methods
  async getDaret(id: number): Promise<Daret | undefined> {
    return this.darets.get(id);
  }

  async getDaretsByUserId(userId: number): Promise<Daret[]> {
    // Get all darets where the user is a member
    const memberDaretIds = Array.from(this.daretMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.daretId);
    
    return Array.from(this.darets.values())
      .filter(daret => memberDaretIds.includes(daret.id));
  }

  async createDaret(daret: InsertDaret): Promise<Daret> {
    const id = this.daretIdCounter++;
    const nowDate = new Date();
    const newDaret: Daret = { 
      ...daret, 
      id, 
      currentCycle: 0,
      createdAt: nowDate
    };
    this.darets.set(id, newDaret);
    return newDaret;
  }

  async updateDaret(id: number, updates: Partial<Daret>): Promise<Daret> {
    const daret = await this.getDaret(id);
    if (!daret) {
      throw new Error(`Daret with id ${id} not found`);
    }
    
    const updatedDaret = { ...daret, ...updates };
    this.darets.set(id, updatedDaret);
    return updatedDaret;
  }

  // Daret Member methods
  async getDaretMembers(daretId: number): Promise<DaretMember[]> {
    return Array.from(this.daretMembers.values())
      .filter(member => member.daretId === daretId)
      .sort((a, b) => a.order - b.order);
  }

  async addDaretMember(member: InsertDaretMember): Promise<DaretMember> {
    const id = this.daretMemberIdCounter++;
    const nowDate = new Date();
    const newMember: DaretMember = { 
      ...member, 
      id,
      receivedPayout: false, 
      joinedAt: nowDate
    };
    this.daretMembers.set(id, newMember);
    return newMember;
  }
  
  // For backwards compatibility during migration
  async getTontine(id: number): Promise<Daret | undefined> {
    return this.getDaret(id);
  }
  
  async getTontinesByUserId(userId: number): Promise<Daret[]> {
    return this.getDaretsByUserId(userId);
  }
  
  async createTontine(tontine: InsertDaret): Promise<Daret> {
    return this.createDaret(tontine);
  }
  
  async updateTontine(id: number, updates: Partial<Daret>): Promise<Daret> {
    return this.updateDaret(id, updates);
  }
  
  async getTontineMembers(tontineId: number): Promise<DaretMember[]> {
    return this.getDaretMembers(tontineId);
  }
  
  async addTontineMember(member: any): Promise<DaretMember> {
    // Handle legacy format with tontineId instead of daretId
    if (member.tontineId && !member.daretId) {
      return this.addDaretMember({
        ...member,
        daretId: member.tontineId
      });
    }
    return this.addDaretMember(member);
  }

  // Agent methods
  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  private async createAgent(agent: {
    name: string;
    userId: number;
    address: string;
    latitude: number;
    longitude: number;
    openingTime: string;
    closingTime: string;
    services: string[];
    status: string;
  }): Promise<Agent> {
    const id = this.agentIdCounter++;
    const nowDate = new Date();
    const newAgent: Agent = { 
      ...agent, 
      id, 
      createdAt: nowDate
    };
    this.agents.set(id, newAgent);
    return newAgent;
  }

  // Budget methods
  async getBudgetsByUserId(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values())
      .filter(budget => budget.userId === userId);
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const id = this.budgetIdCounter++;
    const nowDate = new Date();
    const newBudget: Budget = { 
      ...budget, 
      id, 
      createdAt: nowDate
    };
    this.budgets.set(id, newBudget);
    return newBudget;
  }

  // Notification methods
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => {
        // Sort by date, newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    Array.from(this.notifications.entries())
      .filter(([_, notification]) => notification.userId === userId)
      .forEach(([id, notification]) => {
        notification.isRead = true;
        this.notifications.set(id, notification);
      });
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const nowDate = new Date();
    const newNotification: Notification = { 
      ...notification, 
      id, 
      isRead: notification.isRead || false,
      createdAt: notification.createdAt || nowDate
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  // Bank Account methods
  async getBankAccount(id: number): Promise<BankAccount | undefined> {
    return this.bankAccounts.get(id);
  }
  
  async getBankAccountsByUserId(userId: number): Promise<BankAccount[]> {
    return Array.from(this.bankAccounts.values())
      .filter(account => account.userId === userId);
  }
  
  async createBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount> {
    const id = this.bankAccountIdCounter++;
    const nowDate = new Date();
    
    // If the account is set as default, ensure all other accounts for this user are not default
    if (bankAccount.isDefault) {
      for (const account of this.bankAccounts.values()) {
        if (account.userId === bankAccount.userId && account.isDefault) {
          account.isDefault = false;
        }
      }
    }
    
    const newBankAccount: BankAccount = {
      id,
      ...bankAccount,
      createdAt: nowDate,
      updatedAt: nowDate,
      isVerified: false,
      status: bankAccount.status || "active"
    };
    
    this.bankAccounts.set(id, newBankAccount);
    return newBankAccount;
  }
  
  async updateBankAccount(id: number, updates: Partial<BankAccount>): Promise<BankAccount> {
    const account = await this.getBankAccount(id);
    if (!account) {
      throw new Error(`Bank account with ID ${id} not found`);
    }
    
    // If updating to default, make sure other accounts are not default
    if (updates.isDefault) {
      for (const acct of this.bankAccounts.values()) {
        if (acct.userId === account.userId && acct.id !== id && acct.isDefault) {
          acct.isDefault = false;
        }
      }
    }
    
    const updatedAccount = {
      ...account,
      ...updates,
      updatedAt: new Date()
    };
    
    this.bankAccounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteBankAccount(id: number): Promise<void> {
    const account = await this.getBankAccount(id);
    if (!account) {
      throw new Error(`Bank account with ID ${id} not found`);
    }
    
    // Can't delete the account if there are pending transfers associated with it
    const pendingTransfers = Array.from(this.bankTransfers.values())
      .filter(transfer => 
        transfer.bankAccountId === id && 
        ['pending', 'processing'].includes(transfer.status)
      );
    
    if (pendingTransfers.length > 0) {
      throw new Error(`Cannot delete bank account with pending transfers`);
    }
    
    this.bankAccounts.delete(id);
  }
  
  async setDefaultBankAccount(userId: number, accountId: number): Promise<void> {
    const account = await this.getBankAccount(accountId);
    if (!account) {
      throw new Error(`Bank account with ID ${accountId} not found`);
    }
    
    if (account.userId !== userId) {
      throw new Error(`Bank account does not belong to user ${userId}`);
    }
    
    // Set all accounts to non-default
    for (const acct of this.bankAccounts.values()) {
      if (acct.userId === userId) {
        acct.isDefault = false;
      }
    }
    
    // Set the specified account as default
    account.isDefault = true;
  }
  
  // Bank Transfer methods
  async getBankTransfer(id: number): Promise<BankTransfer | undefined> {
    return this.bankTransfers.get(id);
  }
  
  async getBankTransfersByUserId(userId: number): Promise<BankTransfer[]> {
    return Array.from(this.bankTransfers.values())
      .filter(transfer => transfer.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createBankTransfer(bankTransfer: InsertBankTransfer): Promise<BankTransfer> {
    const id = this.bankTransferIdCounter++;
    const nowDate = new Date();
    
    // Generate a reference if not provided
    const reference = bankTransfer.reference || `TRFR${Date.now()}${id}`;
    
    const newBankTransfer: BankTransfer = {
      id,
      ...bankTransfer,
      reference,
      createdAt: nowDate,
      status: bankTransfer.status || "pending",
      completedAt: null,
      transactionId: null
    };
    
    this.bankTransfers.set(id, newBankTransfer);
    return newBankTransfer;
  }
  
  async updateBankTransferStatus(id: number, status: string, transactionId?: number): Promise<BankTransfer> {
    const transfer = await this.getBankTransfer(id);
    if (!transfer) {
      throw new Error(`Bank transfer with ID ${id} not found`);
    }
    
    const updatedTransfer: BankTransfer = {
      ...transfer,
      status,
      completedAt: ['completed', 'failed', 'rejected'].includes(status) ? new Date() : transfer.completedAt,
      transactionId: transactionId !== undefined ? transactionId : transfer.transactionId
    };
    
    this.bankTransfers.set(id, updatedTransfer);
    return updatedTransfer;
  }

  // Crypto Wallet Methods (Hidden until legal framework allows)
  async getCryptoWallet(id: number): Promise<CryptoWallet | undefined> {
    return this.cryptoWallets.get(id);
  }

  async getCryptoWalletByUserId(userId: number): Promise<CryptoWallet[]> {
    return Array.from(this.cryptoWallets.values())
      .filter(wallet => wallet.userId === userId);
  }

  async createCryptoWallet(wallet: InsertCryptoWallet): Promise<CryptoWallet> {
    const id = this.cryptoWalletIdCounter++;
    const nowDate = new Date();
    
    const newWallet: CryptoWallet = {
      ...wallet,
      id,
      createdAt: nowDate,
      updatedAt: nowDate,
      balance: wallet.balance || "0",
      isActive: false // Always disabled until legal framework allows
    };
    
    this.cryptoWallets.set(id, newWallet);
    return newWallet;
  }

  async updateCryptoWallet(id: number, updates: Partial<CryptoWallet>): Promise<CryptoWallet> {
    const wallet = this.cryptoWallets.get(id);
    if (!wallet) {
      throw new Error(`Crypto wallet with ID ${id} not found`);
    }
    
    const updatedWallet: CryptoWallet = {
      ...wallet,
      ...updates,
      updatedAt: new Date(),
      isActive: false // Always keep disabled until legal framework allows
    };
    
    this.cryptoWallets.set(id, updatedWallet);
    return updatedWallet;
  }

  // Crypto Transaction Methods (Hidden until legal framework allows)
  async getCryptoTransaction(id: number): Promise<CryptoTransaction | undefined> {
    return this.cryptoTransactions.get(id);
  }

  async getCryptoTransactionsByWalletId(walletId: number): Promise<CryptoTransaction[]> {
    return Array.from(this.cryptoTransactions.values())
      .filter(tx => tx.walletId === walletId);
  }

  async createCryptoTransaction(transaction: InsertCryptoTransaction): Promise<CryptoTransaction> {
    const id = this.cryptoTransactionIdCounter++;
    const nowDate = new Date();
    
    const newTransaction: CryptoTransaction = {
      ...transaction,
      id,
      createdAt: nowDate,
      status: "pending", // All transactions start as pending
      confirmations: transaction.confirmations || 0
    };
    
    this.cryptoTransactions.set(id, newTransaction);
    return newTransaction;
  }
}

export const storage = new MemStorage();
