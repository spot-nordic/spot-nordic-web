import { apiClient } from './axios.instance';

export const adminApi = {
  getDashboardStats: async () => {
    const res = await apiClient.get('/admin/dashboard/stats');
    return res.data;
  },
  getUsers: async (params?: any) => {
    const res = await apiClient.get('/admin/users', { params });
    return res.data;
  },
  updateUserStatus: async (id: string, status: string) => {
    const res = await apiClient.put(`/admin/users/${id}/status`, { status });
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await apiClient.delete(`/admin/users/${id}`);
    return res.data;
  },
  getOrders: async (params?: any) => {
    const res = await apiClient.get('/admin/orders', { params });
    return res.data;
  },
  updateOrderStatus: async (id: string, status: string) => {
    const res = await apiClient.put(`/admin/orders/${id}/status`, { status });
    return res.data;
  },
  uploadOrderInvoice: async (id: string, data: FormData) => {
    const res = await apiClient.post(`/admin/orders/${id}/invoice`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getProducts: async (params?: any) => {
    const res = await apiClient.get('/admin/products', { params });
    return res.data;
  },
  createProduct: async (data: FormData) => {
    const res = await apiClient.post('/admin/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  updateProduct: async (id: string, data: FormData) => {
    const res = await apiClient.put(`/admin/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  deleteProduct: async (id: string) => {
    const res = await apiClient.delete(`/admin/products/${id}`);
    return res.data;
  },
  getProductReviews: async (params?: any) => {
    const res = await apiClient.get('/admin/products/reviews', { params });
    return res.data;
  },
  toggleReviewVisibility: async (id: string, isVisible: boolean) => {
    const res = await apiClient.patch(`/admin/products/reviews/${id}/visibility`, { isVisible });
    return res.data;
  },
  getCategories: async () => {
    const res = await apiClient.get('/admin/products/category');
    return res.data;
  },
  createCategory: async (data: any) => {
    const res = await apiClient.post('/admin/products/category', data);
    return res.data;
  },
  deleteCategory: async (id: string) => {
    const res = await apiClient.delete(`/admin/products/category/${id}`);
    return res.data;
  },
  updateCategory: async (id: string, data: any) => {
    const res = await apiClient.put(`/admin/products/category/${id}`, data);
    return res.data;
  },
  getBlogs: async (params?: any) => {
    const res = await apiClient.get('/admin/blogs', { params });
    return res.data;
  },
  createBlog: async (data: FormData) => {
    const res = await apiClient.post('/admin/blogs', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  updateBlog: async (id: string, data: FormData) => {
    const res = await apiClient.put(`/admin/blogs/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  deleteBlog: async (id: string) => {
    const res = await apiClient.delete(`/admin/blogs/${id}`);
    return res.data;
  },
  getBlogComments: async (blogId: string) => {
    const res = await apiClient.get(`/admin/blogs/${blogId}/comments`);
    return res.data;
  },
  deleteBlogComment: async (commentId: string) => {
    const res = await apiClient.delete(`/admin/blogs/comments/${commentId}`);
    return res.data;
  },
  getTickets: async (params?: any) => {
    const res = await apiClient.get('/admin/tickets', { params });
    return res.data;
  },
  getTicketDetails: async (ticketId: string) => {
    const res = await apiClient.get(`/admin/tickets/${ticketId}`);
    return res.data;
  },
  updateTicketStatus: async (id: string, status: string) => {
    const res = await apiClient.put(`/admin/tickets/${id}/status`, { status });
    return res.data;
  },
  getContacts: async (params?: any) => {
    const res = await apiClient.get('/admin/contacts', { params });
    return res.data;
  },
  updateContactStatus: async (id: string, status: string) => {
    const res = await apiClient.put(`/admin/contacts/${id}/status`, { status });
    return res.data;
  },
  deleteContact: async (id: string) => {
    const res = await apiClient.delete(`/admin/contacts/${id}`);
    return res.data;
  },
  getDocs: async () => {
    const res = await apiClient.get('/admin/docs');
    return res.data;
  },
  getDocNode: async (id: string) => {
    const res = await apiClient.get(`/admin/docs/${id}`);
    return res.data;
  },
  getDocAssets: async (id: string) => {
    const res = await apiClient.get(`/admin/docs/${id}/assets`);
    return res.data;
  },
  createDocNode: async (data: any) => {
    const res = await apiClient.post('/admin/docs', data);
    return res.data;
  },
  updateDocNode: async (id: string, data: any) => {
    const res = await apiClient.put(`/admin/docs/${id}`, data);
    return res.data;
  },
  deleteDocNode: async (id: string) => {
    const res = await apiClient.delete(`/admin/docs/${id}`);
    return res.data;
  },
  uploadDocAsset: async (data: FormData) => {
    const res = await apiClient.post('/admin/docs/assets', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getFaqs: async (params?: any) => {
    const res = await apiClient.get('/admin/faqs', { params });
    return res.data;
  },
  createFaq: async (data: any) => {
    const res = await apiClient.post('/admin/faqs', data);
    return res.data;
  },
  updateFaq: async (id: string, data: any) => {
    const res = await apiClient.put(`/admin/faqs/${id}`, data);
    return res.data;
  },
  deleteFaq: async (id: string) => {
    const res = await apiClient.delete(`/admin/faqs/${id}`);
    return res.data;
  },
  getPrivacyPolicies: async (params?: any) => {
    const res = await apiClient.get('/admin/privacy', { params });
    return res.data;
  },
  createPrivacyPolicy: async (data: any) => {
    const res = await apiClient.post('/admin/privacy', data);
    return res.data;
  },
  updatePrivacyPolicy: async (id: string, data: any) => {
    const res = await apiClient.put(`/admin/privacy/${id}`, data);
    return res.data;
  },
  activatePrivacyPolicy: async (id: string) => {
    const res = await apiClient.patch(`/admin/privacy/${id}/activate`);
    return res.data;
  },
  deletePrivacyPolicy: async (id: string) => {
    const res = await apiClient.delete(`/admin/privacy/${id}`);
    return res.data;
  },
  getTerms: async (params?: any) => {
    const res = await apiClient.get('/admin/terms', { params });
    return res.data;
  },
  createTerm: async (data: any) => {
    const res = await apiClient.post('/admin/terms', data);
    return res.data;
  },
  updateTerm: async (id: string, data: any) => {
    const res = await apiClient.put(`/admin/terms/${id}`, data);
    return res.data;
  },
  activateTerm: async (id: string) => {
    const res = await apiClient.patch(`/admin/terms/${id}/activate`);
    return res.data;
  },
  deleteTerm: async (id: string) => {
    const res = await apiClient.delete(`/admin/terms/${id}`);
    return res.data;
  }
};