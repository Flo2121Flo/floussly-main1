export interface GroupSavings {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  memberCount: number;
  isMember: boolean;
  contributionAmount: number;
  nextContributionDate: string;
  status: 'active' | 'completed' | 'cancelled';
  members: {
    id: string;
    name: string;
    contributionAmount: number;
    lastContribution: string;
  }[];
  rules: {
    minimumContribution: number;
    maximumContribution: number;
    contributionFrequency: 'daily' | 'weekly' | 'monthly';
    penaltyAmount: number;
  };
  history: {
    date: string;
    type: 'contribution' | 'withdrawal' | 'penalty';
    amount: number;
    memberId: string;
    memberName: string;
  }[];
  createdAt: string;
  updatedAt: string;
} 