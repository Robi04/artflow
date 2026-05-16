import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export const usePlan = () =>
  useQuery({
    queryKey: ['plan'],
    queryFn: () => api.get('/plan').then((r) => r.data),
    retry: false,
  });

export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (axes: string[]) => api.post('/plan', { axes }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plan'] });
      qc.invalidateQueries({ queryKey: ['missions'] });
    },
  });
};

export const useToggleAxis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (axisType: string) => api.patch(`/plan/axes/${axisType}/toggle`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan'] }),
  });
};
