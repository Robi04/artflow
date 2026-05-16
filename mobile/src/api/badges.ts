import { useQuery } from '@tanstack/react-query';
import { api } from './client';

export const useAllBadges = () =>
  useQuery({ queryKey: ['badges'], queryFn: () => api.get('/badges').then((r) => r.data) });

export const useMyBadges = () =>
  useQuery({ queryKey: ['badges', 'me'], queryFn: () => api.get('/badges/me').then((r) => r.data) });
