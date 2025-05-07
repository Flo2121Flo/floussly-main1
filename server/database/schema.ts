// This is your Prisma schema file
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Core user model with Cognito integration
model User {
  id            String    @id @default(uuid())
  cognitoId     String    @unique
  email         String    @unique
  phone         String?   @unique
  firstName     String
  lastName      String
  walletBalance Decimal   @default(0)
  qrCode        String    @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  isVerified    Boolean   @default(false)
  isActive      Boolean   @default(true)
  lastLogin     DateTime?
  deletedAt     DateTime?
  language      String    @default("en")
  timezone      String    @default("UTC")
  
  // Relations
  transactions  Transaction[]
  sentMessages  Message[]    @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  tontines      TontineMember[]
  createdTontines Tontine[] @relation("CreatedTontines")
  agent         Agent?
  referredBy    Agent?      @relation("ReferredUsers")
  referralCode  String?
  auditLogs     AuditLog[]

  @@index([email])
  @@index([phone])
  @@index([createdAt])
  @@index([isActive])
}

// Agent model for field representatives
model Agent {
  id            String    @id @default(uuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
  region        String
  walletBalance Decimal   @default(0)
  referralCode  String    @unique
  status        AgentStatus @default(PENDING)
  level         AgentLevel  @default(BRONZE)
  totalEarnings Decimal   @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  
  // Relations
  referredUsers User[]    @relation("ReferredUsers")
  commissions   Commission[]
  cashTransactions CashTransaction[]
  auditLogs     AuditLog[]

  @@index([region])
  @@index([status])
  @@index([level])
}

// Transaction model for all money movements
model Transaction {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  type          TransactionType
  amount        Decimal
  fee           Decimal   @default(0)
  status        TransactionStatus @default(PENDING)
  metadata      Json?     // For additional transaction data
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  auditLogs     AuditLog[]
  
  // Relations
  commission    Commission?

  @@index([userId])
  @@index([type])
  @@index([status])
  @@index([createdAt])
  @@check(amount > 0)
  @@check(fee >= 0)
}

// Tontine (Game'ya) model
model Tontine {
  id            String    @id @default(uuid())
  creatorId     String
  creator       User      @relation("CreatedTontines", fields: [creatorId], references: [id])
  name          String
  contribution  Decimal
  duration      Int       // Number of rounds
  frequency     TontineFrequency
  status        TontineStatus @default(ACTIVE)
  currentRound  Int       @default(1)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  auditLogs     AuditLog[]
  
  // Relations
  members       TontineMember[]
  payouts       TontinePayout[]

  @@index([creatorId])
  @@index([status])
  @@index([frequency])
  @@check(contribution > 0)
  @@check(duration > 0)
  @@check(currentRound > 0)
}

// Tontine member model
model TontineMember {
  id            String    @id @default(uuid())
  tontineId     String
  userId        String
  tontine       Tontine   @relation(fields: [tontineId], references: [id])
  user          User      @relation(fields: [userId], references: [id])
  payoutOrder   Int
  status        TontineMemberStatus @default(ACTIVE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  auditLogs     AuditLog[]

  @@unique([tontineId, userId])
  @@index([tontineId])
  @@index([userId])
  @@index([status])
  @@check(payoutOrder > 0)
}

// Tontine payout model
model TontinePayout {
  id            String    @id @default(uuid())
  tontineId     String
  tontine       Tontine   @relation(fields: [tontineId], references: [id])
  round         Int
  amount        Decimal
  status        PayoutStatus @default(PENDING)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  auditLogs     AuditLog[]

  @@index([tontineId])
  @@index([status])
  @@check(amount > 0)
  @@check(round > 0)
}

// Message model for MessaFlouss
model Message {
  id            String    @id @default(uuid())
  senderId      String
  receiverId    String
  sender        User      @relation("SentMessages", fields: [senderId], references: [id])
  receiver      User      @relation("ReceivedMessages", fields: [receiverId], references: [id])
  content       String
  type          MessageType
  amount        Decimal?  // For money messages
  status        MessageStatus @default(SENT)
  expiresAt     DateTime?
  metadata      Json?     // For additional message data
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  auditLogs     AuditLog[]

  @@index([senderId])
  @@index([receiverId])
  @@index([type])
  @@index([status])
  @@index([expiresAt])
  @@check(amount > 0)
}

// Commission model for agent earnings
model Commission {
  id            String    @id @default(uuid())
  agentId       String
  transactionId String    @unique
  agent         Agent     @relation(fields: [agentId], references: [id])
  transaction   Transaction @relation(fields: [transactionId], references: [id])
  amount        Decimal
  type          CommissionType
  status        CommissionStatus @default(PENDING)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  auditLogs     AuditLog[]

  @@index([agentId])
  @@index([transactionId])
  @@index([type])
  @@index([status])
  @@check(amount > 0)
}

// Cash transaction model for agent cash-in/out
model CashTransaction {
  id            String    @id @default(uuid())
  agentId       String
  agent         Agent     @relation(fields: [agentId], references: [id])
  type          CashTransactionType
  amount        Decimal
  status        CashTransactionStatus @default(PENDING)
  metadata      Json?     // For additional transaction data
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  auditLogs     AuditLog[]

  @@index([agentId])
  @@index([type])
  @@index([status])
  @@check(amount > 0)
}

// Audit log model for tracking changes
model AuditLog {
  id            String    @id @default(uuid())
  userId        String
  action        String
  entityType    String
  entityId      String
  oldData       Json?
  newData       Json?
  createdAt     DateTime  @default(now())
  ipAddress     String?
  userAgent     String?

  @@index([userId])
  @@index([entityType])
  @@index([entityId])
  @@index([createdAt])
}

// Enums
enum AgentStatus {
  PENDING
  ACTIVE
  SUSPENDED
  TERMINATED
}

enum AgentLevel {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

enum TransactionType {
  P2P_TRANSFER
  WITHDRAWAL
  TOP_UP
  TONTINE_CONTRIBUTION
  TONTINE_PAYOUT
  COMMISSION
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}

enum TontineFrequency {
  DAILY
  WEEKLY
  MONTHLY
}

enum TontineStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}

enum TontineMemberStatus {
  ACTIVE
  INACTIVE
  EXCLUDED
}

enum PayoutStatus {
  PENDING
  COMPLETED
  FAILED
}

enum MessageType {
  TEXT
  MONEY
  VOICE
  IMAGE
  STICKER
  GEO
  SCHEDULED
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
  EXPIRED
}

enum CommissionType {
  WITHDRAWAL
  TONTINE
  REFERRAL
}

enum CommissionStatus {
  PENDING
  PAID
  CANCELLED
}

enum CashTransactionType {
  CASH_IN
  CASH_OUT
}

enum CashTransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
} 