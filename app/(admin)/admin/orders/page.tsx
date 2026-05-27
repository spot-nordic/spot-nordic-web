// spot-nordic-web/app/(admin)/admin/orders/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { DownloadCloud, UploadCloud, Search, FileText } from 'lucide-react';

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrders', search, statusFilter],
    queryFn: () => adminApi.getOrders({ limit: 50, search, status: statusFilter })
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => adminApi.updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminOrders'] })
  });

  const uploadInvoiceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: FormData }) => adminApi.uploadOrderInvoice(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminOrders'] })
  });

  const handleInvoiceUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const payload = new FormData();
      payload.append('invoice', file);
      uploadInvoiceMutation.mutate({ id, payload });
    }
  };

  const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg outline-none focus:border-primary/50"
          />
        </div>
        <select 
          className="p-2 bg-card border border-border rounded-lg outline-none focus:border-primary/50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer Email</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-center">Invoice</th>
                  <th className="px-6 py-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.data?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs" title={order.id}>{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4">{order.userEmail}</td>
                    <td className="px-6 py-4 font-medium">
                      {order.totalAmount.toFixed(2)} <span className="text-xs text-muted-foreground">{order.currency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentStatus === 'COMPLETED' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                        className="p-1.5 bg-background border border-border rounded text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {order.invoiceUrl ? (
                        <div className="flex items-center justify-center gap-2">
                          <a href={order.invoiceUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors" title="Download Invoice">
                            <FileText size={18} />
                          </a>
                          <label className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors" title="Update Invoice">
                            <UploadCloud size={16} />
                            <input type="file" className="hidden" accept="application/pdf" onChange={(e) => handleInvoiceUpload(order.id, e)} />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer inline-flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded text-xs font-medium transition-colors">
                          <UploadCloud size={14} className="mr-1.5" /> Upload
                          <input type="file" className="hidden" accept="application/pdf" onChange={(e) => handleInvoiceUpload(order.id, e)} />
                        </label>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-right">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data?.data?.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}