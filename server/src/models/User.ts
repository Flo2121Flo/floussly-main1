import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone: string;
  tier: 'STANDARD' | 'PREMIUM' | 'BUSINESS' | 'ADMIN';
  mfaEnabled: boolean;
  mfaType?: 'SMS' | 'EMAIL' | 'TOTP';
  mfaSecret?: string;
  isActive: boolean;
  isLocked: boolean;
  lockExpiry?: Date;
  failedLoginAttempts: number;
  lastLogin?: Date;
  lastPasswordChange?: Date;
  passwordHistory: string[];
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  kycDocuments: {
    type: string;
    url: string;
    verified: boolean;
    verifiedAt?: Date;
  }[];
  deviceTokens: {
    token: string;
    deviceId: string;
    lastUsed: Date;
  }[];
  preferences: {
    language: string;
    notifications: boolean;
    biometricEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isPasswordExpired(): boolean;
  isAccountLocked(): boolean;
  addToPasswordHistory(password: string): Promise<void>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  tier: {
    type: String,
    enum: ['STANDARD', 'PREMIUM', 'BUSINESS', 'ADMIN'],
    default: 'STANDARD'
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaType: {
    type: String,
    enum: ['SMS', 'EMAIL', 'TOTP']
  },
  mfaSecret: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockExpiry: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lastLogin: Date,
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  passwordHistory: [{
    type: String
  }],
  kycStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  },
  kycDocuments: [{
    type: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date
  }],
  deviceTokens: [{
    token: {
      type: String,
      required: true
    },
    deviceId: {
      type: String,
      required: true
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    biometricEnabled: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ tier: 1 });
UserSchema.index({ kycStatus: 1 });
UserSchema.index({ 'deviceTokens.token': 1 });

// Password comparison method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if password is expired (90 days)
UserSchema.methods.isPasswordExpired = function(): boolean {
  if (!this.lastPasswordChange) return false;
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  return this.lastPasswordChange < ninetyDaysAgo;
};

// Check if account is locked
UserSchema.methods.isAccountLocked = function(): boolean {
  if (!this.isLocked) return false;
  if (!this.lockExpiry) return true;
  return this.lockExpiry > new Date();
};

// Add password to history
UserSchema.methods.addToPasswordHistory = async function(password: string): Promise<void> {
  const hashedPassword = await bcrypt.hash(password, 12);
  this.passwordHistory.push(hashedPassword);
  
  // Keep only last 5 passwords
  if (this.passwordHistory.length > 5) {
    this.passwordHistory = this.passwordHistory.slice(-5);
  }
  
  await this.save();
};

// Pre-save middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    // Hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Update password history
    await this.addToPasswordHistory(this.password);
    
    // Update last password change
    this.lastPasswordChange = new Date();
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const User = mongoose.model<IUser>('User', UserSchema); 