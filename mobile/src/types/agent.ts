export type AgentStatus = 'active' | 'inactive' | 'pending';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  transactionCount: number;
  transactionVolume: number;
  lastActive: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  performance: {
    rating: number;
    completionRate: number;
    averageResponseTime: number;
  };
  documents: {
    idVerified: boolean;
    kycVerified: boolean;
    documentsSubmitted: string[];
  };
  createdAt: string;
  updatedAt: string;
} 