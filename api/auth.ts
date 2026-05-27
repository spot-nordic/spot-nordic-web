import { apiClient } from './axios.instance';

export const authApi = {
  register: async (data: any) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },
  login: async (data: any) => {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  },
  forgotPassword: async (data: { email: string }) => {
    const res = await apiClient.post('/auth/forgot-password', data);
    return res.data;
  },
  verifyOtp: async (data: { email: string; otp: string; type: 'REGISTER' | 'PASSWORD_RESET' }) => {
    const res = await apiClient.post('/auth/verify-otp', data);
    return res.data;
  },
  resetPassword: async (data: any) => {
    const res = await apiClient.post('/auth/reset-password', data);
    return res.data;
  },
  logout: async (data: { id: string }) => {
    const res = await apiClient.post('/auth/logout', data);
    return res.data;
  }
};