'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { Trash2, Edit, Plus, X, CheckCircle, XCircle } from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedFaqsResponse {
  data: Faq[];
  meta: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

interface FaqFormData {
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminFaqs() {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);

  const [formData, setFormData] = useState<FaqFormData>({
    question: '',
    answer: '',
    category: '',
    sortOrder: 0,
    isActive: true
  });

  const { data, isLoading } = useQuery<PaginatedFaqsResponse>({
    queryKey: ['adminFaqs'],
    queryFn: () => adminApi.getFaqs({ limit: 100 })
  });

  const createMutation = useMutation({
    mutationFn: (payload: FaqFormData) => adminApi.createFaq(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFaqs'] });
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FaqFormData }) => 
      adminApi.updateFaq(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFaqs'] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteFaq(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminFaqs'] }),
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete FAQ');
    }
  });

  const openModal = (faq?: Faq) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        sortOrder: faq.sortOrder,
        isActive: faq.isActive
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: '',
        answer: '',
        category: '',
        sortOrder: 0,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaq) {
      updateMutation.mutate({ 
        id: editingFaq.id, 
        payload: formData 
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev: FaqFormData) => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'sortOrder' 
          ? parseInt(value) || 0 
          : value
    }));
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading FAQs...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">FAQ Management</h2>
        <button 
          onClick={() => openModal()} 
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-all"
        >
          <Plus size={16} /> Add New FAQ
        </button>
      </div>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Question</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data?.map((faq: Faq) => (
                <tr key={faq.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium">{faq.sortOrder}</td>
                  <td className="px-6 py-4 max-w-[300px] truncate font-medium" title={faq.question}>{faq.question}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-semibold">
                      {faq.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {faq.isActive ? (
                      <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-500/10 px-2.5 py-1 rounded-full w-fit">
                        <CheckCircle size={14} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-muted-foreground font-bold text-xs bg-muted px-2.5 py-1 rounded-full w-fit">
                        <XCircle size={14} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <button 
                      onClick={() => openModal(faq)} 
                      className="p-2 text-foreground hover:bg-secondary transition-colors rounded"
                      title="Edit FAQ"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => { if(window.confirm('Are you sure you want to delete this FAQ?')) deleteMutation.mutate(faq.id); }}
                      className="p-2 text-destructive hover:bg-destructive/10 transition-colors bg-secondary rounded"
                      title="Delete FAQ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {data?.data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No FAQs found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
              <h2 className="text-xl font-bold">{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="faq-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Question</label>
                  <input 
                    type="text" 
                    name="question"
                    required 
                    className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50 text-sm font-medium" 
                    value={formData.question} 
                    onChange={handleInputChange} 
                    placeholder="e.g., How long does shipping take?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Answer</label>
                  <textarea 
                    name="answer"
                    required 
                    rows={5}
                    className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50 text-sm resize-y" 
                    value={formData.answer} 
                    onChange={handleInputChange} 
                    placeholder="Provide a detailed answer here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Category</label>
                    <input 
                      type="text" 
                      name="category"
                      required 
                      className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50 text-sm" 
                      value={formData.category} 
                      onChange={handleInputChange} 
                      placeholder="e.g., Shipping, Returns, General"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Display Sort Order</label>
                    <input 
                      type="number" 
                      name="sortOrder"
                      required 
                      className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50 text-sm" 
                      value={formData.sortOrder} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/10">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                    Publish this FAQ (Visible to public)
                  </label>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
              <button 
                type="button" 
                onClick={closeModal} 
                className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="faq-form" 
                disabled={createMutation.isPending || updateMutation.isPending} 
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/95 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {editingFaq ? 'Save Changes' : 'Create FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}