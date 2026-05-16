import { api } from './client';

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post<{ access_token: string }>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<{ access_token: string }>('/auth/login', data).then((r) => r.data),

  me: () => api.get('/auth/me').then((r) => r.data),
};
