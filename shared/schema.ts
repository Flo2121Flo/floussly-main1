import { pgTable, text, serial, integer, boolean, timestamp, numeric, uniqueIndex, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  profileImage: text("profile_image"),
  isVerified: boolean("is_verified").default(false).notNull(),
  role: text("role").default("user").notNull(), // user, agent, admin
  language: text("language").default("en").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userKyc = pgTable("user_kyc", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  idCardFront: text("id_card_front").notNull(),
  idCardBack: text("id_card_back").notNull(),
  selfie: text("selfie").notNull(),
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  approvedAt: timestamp("approved_at"),
  rejectedReason: text("rejected_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Wallets
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  balance: numeric("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: text("currency").default("MAD").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // send, receive, topup, withdraw
  senderId: integer("sender_id").references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  fee: numeric("fee", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: text("currency").default("MAD").notNull(),
  status: text("status").default("pending").notNull(), // pending, completed, failed
  note: text("note"),
  category: text("category"),
  qrCode: text("qr_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tontines (Daret)
export const darets = pgTable("darets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("MAD").notNull(),
  totalMembers: integer("total_members").notNull(),
  currentCycle: integer("current_cycle").default(0).notNull(),
  status: text("status").default("active").notNull(), // active, payment_due, completed
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  nextPaymentDate: timestamp("next_payment_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const daretMembers = pgTable("daret_members", {
  id: serial("id").primaryKey(),
  daretId: integer("daret_id").notNull().references(() => darets.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  receivedPayout: boolean("received_payout").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const daretPayments = pgTable("daret_payments", {
  id: serial("id").primaryKey(),
  daretId: integer("daret_id").notNull().references(() => darets.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cycle: integer("cycle").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("MAD").notNull(),
  status: text("status").default("pending").notNull(), // pending, completed, failed
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Agents
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 6 }),
  longitude: numeric("longitude", { precision: 10, scale: 6 }),
  openingTime: text("opening_time"),
  closingTime: text("closing_time"),
  services: text("services").array(),
  status: text("status").default("active").notNull(), // active, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Budgets
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  limit: numeric("limit", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("MAD").notNull(),
  period: text("period").default("monthly").notNull(), // monthly, weekly, yearly
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // money_received, payment_reminder, kyc_verification, transaction, referral, etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  relatedId: text("related_id"), // ID of the related entity (transaction, daret, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDaretSchema = createInsertSchema(darets).omit({
  id: true,
  currentCycle: true,
  endDate: true,
  createdAt: true,
});

export const insertDaretMemberSchema = createInsertSchema(daretMembers).omit({
  id: true,
  receivedPayout: true,
  joinedAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Daret = typeof darets.$inferSelect;
export type InsertDaret = z.infer<typeof insertDaretSchema>;

export type DaretMember = typeof daretMembers.$inferSelect;
export type InsertDaretMember = z.infer<typeof insertDaretMemberSchema>;

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Bank Accounts Schema
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bankName: text("bank_name").notNull(),
  accountHolderName: text("account_holder_name").notNull(),
  rib: text("rib").notNull(), // Relevé d'Identité Bancaire (Moroccan bank identifier)
  iban: text("iban"),
  swift: text("swift"),
  accountType: text("account_type").default("checking").notNull(), // checking, savings
  isDefault: boolean("is_default").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  status: text("status").default("active").notNull(), // active, suspended, closed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bank Transfers Schema
export const bankTransfers = pgTable("bank_transfers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bankAccountId: integer("bank_account_id").references(() => bankAccounts.id),
  type: text("type").notNull(), // topup, withdrawal, bank_transfer
  direction: text("direction").notNull(), // incoming, outgoing
  amount: text("amount").notNull(),
  currency: text("currency").default("MAD").notNull(),
  fee: text("fee").default("0").notNull(),
  recipientName: text("recipient_name"),
  recipientRib: text("recipient_rib"),
  recipientIban: text("recipient_iban"),
  recipientBank: text("recipient_bank"),
  description: text("description"),
  reference: text("reference").notNull(),
  status: text("status").default("pending").notNull(), // pending, processing, completed, failed, rejected
  paymentProofImage: text("payment_proof_image"),
  completedAt: timestamp("completed_at"),
  failureReason: text("failure_reason"),
  transactionId: integer("transaction_id").references(() => transactions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true
});

export const insertBankTransferSchema = createInsertSchema(bankTransfers).omit({
  id: true,
  createdAt: true,
  transactionId: true,
  completedAt: true
});

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;

export type BankTransfer = typeof bankTransfers.$inferSelect;
export type InsertBankTransfer = z.infer<typeof insertBankTransferSchema>;

// Crypto Wallets (Hidden Feature - Disabled in UI until legal framework allows)
export const cryptoWallets = pgTable("crypto_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  walletType: text("wallet_type").notNull(), // bitcoin, ethereum, etc.
  address: text("address").notNull(),
  privateKey: text("private_key").notNull(), // Should be encrypted in production
  balance: numeric("balance", { precision: 18, scale: 8 }).default("0").notNull(),
  isActive: boolean("is_active").default(false).notNull(), // Will be activated when legal framework allows
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cryptoTransactions = pgTable("crypto_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => cryptoWallets.id, { onDelete: "cascade" }),
  txHash: text("tx_hash").notNull().unique(),
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  fee: numeric("fee", { precision: 18, scale: 8 }),
  type: text("type").notNull(), // send, receive
  status: text("status").default("pending").notNull(), // pending, confirmed, failed
  toAddress: text("to_address"),
  fromAddress: text("from_address"),
  blockHeight: integer("block_height"),
  confirmations: integer("confirmations").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create insert schemas for crypto tables
export const insertCryptoWalletSchema = createInsertSchema(cryptoWallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCryptoTransactionSchema = createInsertSchema(cryptoTransactions).omit({
  id: true,
  createdAt: true,
});

// Export types
export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type InsertCryptoWallet = z.infer<typeof insertCryptoWalletSchema>;

export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;
export type InsertCryptoTransaction = z.infer<typeof insertCryptoTransactionSchema>;
