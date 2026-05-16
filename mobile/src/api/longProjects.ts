import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { api } from './client';

export const useLongProjects = () =>
  useQuery({ queryKey: ['long-projects'], queryFn: () => api.get('/long-projects').then((r) => r.data) });

export const useCreateLongProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      api.post('/long-projects', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['long-projects'] }),
  });
};

export const useAddPhoto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, image }: { projectId: string; image: ImagePicker.ImagePickerAsset }) => {
      const form = new FormData();
      form.append('image', { uri: image.uri, type: image.mimeType ?? 'image/jpeg', name: 'photo.jpg' } as any);
      return api.post(`/long-projects/${projectId}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
    onSuccess: (_, { projectId }) => {
      qc.invalidateQueries({ queryKey: ['long-projects', projectId] });
      qc.invalidateQueries({ queryKey: ['long-projects'] });
    },
  });
};

export const useCompleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) =>
      api.patch(`/long-projects/${projectId}/complete`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['long-projects'] });
      qc.invalidateQueries({ queryKey: ['badges', 'me'] });
    },
  });
};

export const useArchiveProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) =>
      api.patch(`/long-projects/${projectId}/archive`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['long-projects'] }),
  });
};
