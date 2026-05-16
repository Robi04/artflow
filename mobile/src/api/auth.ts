import { api } from './client';

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post<{ access_token: string }>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<{ access_token: string }>('/auth/login', data).then((r) => r.data),

  me: () => api.get('/auth/me').then((r) => r.data),

  updateProfile: (name: string) =>
    api.patch('/auth/profile', { name }).then((r) => r.data),

  uploadAvatar: (uri: string, mimeType: string) => {
    const form = new FormData();
    const filename = uri.split('/').pop() ?? 'avatar.jpg';
    (form as any).append('avatar', { uri, name: filename, type: mimeType } as any);
    return api.patch('/auth/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};
