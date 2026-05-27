import { apiClient } from './axios.instance';

export const sharedApi = {
    getCart: async () => {
        const res = await apiClient.get('/shared/cart');
        return res.data;
    },
    addToCart: async (data: { productId: string; quantity: number }) => {
        const res = await apiClient.post('/shared/cart/add', data);
        return res.data;
    },
    updateCartItem: async (itemId: string, quantity: number) => {
        const res = await apiClient.put(`/shared/cart/${itemId}`, { quantity });
        return res.data;
    },
    removeFromCart: async (itemId: string) => {
        const res = await apiClient.delete(`/shared/cart/${itemId}`);
        return res.data;
    },
    clearCart: async () => {
        const res = await apiClient.delete('/shared/cart/clear');
        return res.data;
    },
    checkout: async (data: any) => {
        const res = await apiClient.post('/shared/checkout', data);
        return res.data;
    },
    verifyPayment: async (data: any) => {
        const res = await apiClient.post('/shared/checkout/verify-payment', data);
        return res.data;
    },
    getOrders: async (params?: any) => {
        const res = await apiClient.get('/shared/orders', { params });
        return res.data;
    },
    getOrderById: async (orderId: string) => {
        const res = await apiClient.get(`/shared/orders/${orderId}`);
        return res.data;
    },
    getProfile: async () => {
        const res = await apiClient.get('/shared/profile');
        return res.data;
    },
    updateProfile: async (data: any) => {
        const res = await apiClient.put('/shared/profile', data);
        return res.data;
    },
    getTickets: async (params?: any) => {
        const res = await apiClient.get('/shared/tickets', { params });
        return res.data;
    },
    createTicket: async (data: any) => {
        const res = await apiClient.post('/shared/tickets', data);
        return res.data;
    },
    getTicketDetails: async (ticketId: string) => {
        const res = await apiClient.get(`/shared/tickets/${ticketId}`);
        return res.data;
    },
    resolveTicket: async (ticketId: string) => {
        const res = await apiClient.put(`/shared/tickets/${ticketId}/resolve`);
        return res.data;
    },
    getTicketChatMessages: async (ticketId: string) => {
        const res = await apiClient.get(`/shared/chat/tickets/${ticketId}`);
        return res.data;
    },
    sendTicketChatMessage: async (ticketId: string, data: FormData) => {
        const res = await apiClient.post(`/shared/chat/tickets/${ticketId}/send`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    }
};