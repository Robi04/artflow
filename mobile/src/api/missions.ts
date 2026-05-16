import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { api } from './client';

export const useMissions = () =>
  useQuery({
    queryKey: ['missions', 'current'],
    queryFn: () => api.get('/missions/current').then((r) => r.data),
  });

export const useSubmitMission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ missionId, image }: { missionId: string; image: ImagePicker.ImagePickerAsset }) => {
      const form = new FormData();
      form.append('image', { uri: image.uri, type: image.mimeType ?? 'image/jpeg', name: 'artwork.jpg' } as any);
      return api.post(`/missions/${missionId}/submit`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['missions'] }),
  });
};
