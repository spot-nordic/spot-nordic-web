import { apiClient } from './axios.instance';

export const publicApi = {
  getBlogs: async (params?: any) => {
    const res = await apiClient.get('/public/blogs', { params });
    return res.data;
  },
  getTrendingBlogs: async (params?: any) => {
    const res = await apiClient.get('/public/blogs/trending', { params });
    return res.data;
  },
  getSuggestedBlogs: async (params?: any) => {
    const res = await apiClient.get('/public/blogs/suggested', { params });
    return res.data;
  },
  getBlogBySlug: async (slug: string) => {
    const res = await apiClient.get(`/public/blogs/${slug}`);
    return res.data;
  },
  incrementBlogView: async (id: string) => {
    const res = await apiClient.post(`/public/blogs/${id}/view`);
    return res.data;
  },
  getBlogComments: async (id: string) => {
    const res = await apiClient.get(`/public/blogs/${id}/comments`);
    return res.data;
  },
  interactBlog: async (id: string, type: 'LIKE' | 'DISLIKE') => {
    const res = await apiClient.post(`/public/blogs/${id}/interact`, { type });
    return res.data;
  },
  addBlogComment: async (id: string, content: string) => {
    const res = await apiClient.post(`/public/blogs/${id}/comments`, { content });
    return res.data;
  },
  submitContact: async (data: any) => {
    const res = await apiClient.post('/public/contact', data);
    return res.data;
  },
  getDocsTree: async () => {
    const res = await apiClient.get('/public/docs/tree');
    return res.data;
  },
  getDocPage: async (slug: string) => {
    const res = await apiClient.get(`/public/docs/${slug}`);
    return res.data;
  },
  getFaqs: async () => {
    const res = await apiClient.get('/public/faqs');
    return res.data;
  },
  getActivePrivacy: async () => {
    const res = await apiClient.get('/public/privacy/active');
    return res.data;
  },
  getActiveTerms: async () => {
    const res = await apiClient.get('/public/terms/active');
    return res.data;
  },
  getProducts: async (params?: any) => {
    const res = await apiClient.get('/public/shop', { params });
    return res.data;
  },
  getCategories: async () => {
    const res = await apiClient.get('/public/shop/categories');
    return res.data;
  },
  getProductDetails: async (id: string) => {
    const res = await apiClient.get(`/public/shop/${id}`);
    return res.data;
  },
  getSuggestedProducts: async (id: string, params?: any) => {
    const res = await apiClient.get(`/public/shop/${id}/suggested`, { params });
    return res.data;
  },
  getProductReviews: async (id: string) => {
    const res = await apiClient.get(`/public/shop/${id}/reviews`);
    return res.data;
  },
  addProductReview: async (id: string, data: { rating: number, comment?: string }) => {
    const res = await apiClient.post(`/public/shop/${id}/reviews`, data);
    return res.data;
  }
};