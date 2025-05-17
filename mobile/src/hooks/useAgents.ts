import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Agent } from '../types/agent';

export const useAgents = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    data: agents,
    isLoading,
    refetch
  } = useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      try {
        const response = await api.get('/agents');
        return response.data;
      } catch (err) {
        setError('Failed to fetch agents');
        throw err;
      }
    }
  });

  const updateAgentStatus = useMutation({
    mutationFn: async ({ agentId, status }: { agentId: string; status: string }) => {
      try {
        const response = await api.patch(`/agents/${agentId}/status`, { status });
        return response.data;
      } catch (err) {
        setError('Failed to update agent status');
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });

  const generateReport = useMutation({
    mutationFn: async (agentId: string) => {
      try {
        const response = await api.post(`/agents/${agentId}/report`);
        return response.data;
      } catch (err) {
        setError('Failed to generate report');
        throw err;
      }
    }
  });

  const handleUpdateStatus = useCallback(
    async (agentId: string, status: string) => {
      try {
        await updateAgentStatus.mutateAsync({ agentId, status });
      } catch (err) {
        // Error is handled in the mutation
      }
    },
    [updateAgentStatus]
  );

  const handleGenerateReport = useCallback(
    async (agentId: string) => {
      try {
        await generateReport.mutateAsync(agentId);
      } catch (err) {
        // Error is handled in the mutation
      }
    },
    [generateReport]
  );

  return {
    agents,
    isLoading,
    error,
    refetch,
    updateAgentStatus: handleUpdateStatus,
    generateReport: handleGenerateReport
  };
}; 