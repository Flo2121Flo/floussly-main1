import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { GroupSavings } from '../types/savings';

interface CreateGroupParams {
  name: string;
  targetAmount: number;
}

export const useGroupSavings = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    data: groups,
    isLoading,
    refetch
  } = useQuery<GroupSavings[]>({
    queryKey: ['groupSavings'],
    queryFn: async () => {
      try {
        const response = await api.get('/group-savings');
        return response.data;
      } catch (err) {
        setError('Failed to fetch group savings');
        throw err;
      }
    }
  });

  const createGroup = useMutation({
    mutationFn: async (params: CreateGroupParams) => {
      try {
        const response = await api.post('/group-savings', params);
        return response.data;
      } catch (err) {
        setError('Failed to create group');
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupSavings'] });
    }
  });

  const joinGroup = useMutation({
    mutationFn: async (groupId: string) => {
      try {
        const response = await api.post(`/group-savings/${groupId}/join`);
        return response.data;
      } catch (err) {
        setError('Failed to join group');
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupSavings'] });
    }
  });

  const leaveGroup = useMutation({
    mutationFn: async (groupId: string) => {
      try {
        const response = await api.post(`/group-savings/${groupId}/leave`);
        return response.data;
      } catch (err) {
        setError('Failed to leave group');
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupSavings'] });
    }
  });

  const contribute = useMutation({
    mutationFn: async ({ groupId, amount }: { groupId: string; amount: number }) => {
      try {
        const response = await api.post(`/group-savings/${groupId}/contribute`, { amount });
        return response.data;
      } catch (err) {
        setError('Failed to make contribution');
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupSavings'] });
    }
  });

  const handleCreateGroup = useCallback(
    async (params: CreateGroupParams) => {
      try {
        await createGroup.mutateAsync(params);
      } catch (err) {
        // Error is handled in the mutation
      }
    },
    [createGroup]
  );

  const handleJoinGroup = useCallback(
    async (groupId: string) => {
      try {
        await joinGroup.mutateAsync(groupId);
      } catch (err) {
        // Error is handled in the mutation
      }
    },
    [joinGroup]
  );

  const handleLeaveGroup = useCallback(
    async (groupId: string) => {
      try {
        await leaveGroup.mutateAsync(groupId);
      } catch (err) {
        // Error is handled in the mutation
      }
    },
    [leaveGroup]
  );

  const handleContribute = useCallback(
    async (groupId: string, amount: number) => {
      try {
        await contribute.mutateAsync({ groupId, amount });
      } catch (err) {
        // Error is handled in the mutation
      }
    },
    [contribute]
  );

  return {
    groups,
    isLoading,
    error,
    refetch,
    createGroup: handleCreateGroup,
    joinGroup: handleJoinGroup,
    leaveGroup: handleLeaveGroup,
    contribute: handleContribute
  };
}; 