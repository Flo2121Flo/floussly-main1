export interface Chat {
  chatId: string;
  participants: string[]; // userIds
  type: ChatType;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  msgId: string;
  chatId: string;
  senderId: string;
  text: string;
  attachments?: Attachment[];
  status: MessageStatus;
  readBy: string[]; // userIds
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  attachmentId: string;
  messageId: string;
  type: AttachmentType;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

export interface TreasureDrop {
  dropId: string;
  creatorId: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  location: GeoLocation;
  radius: number; // in meters
  isPrivate: boolean;
  inviteCode?: string;
  maxClaims: number;
  claims: TreasureClaim[];
  status: DropStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TreasureClaim {
  claimId: string;
  dropId: string;
  userId: string;
  amount: number;
  location: GeoLocation;
  status: ClaimStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export enum ChatType {
  DIRECT = 'direct',
  GROUP = 'group',
  SUPPORT = 'support',
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum AttachmentType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LOCATION = 'location',
}

export enum DropStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ClaimStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
} 