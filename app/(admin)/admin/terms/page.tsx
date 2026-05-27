'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { Trash2, CheckCircle, Plus, X, Edit, Eye, Code } from 'lucide-react';

interface Term {
  id: string;
  version: string;
  title: string;
  htmlContent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedTermsResponse {
  data: Term[];
  meta: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export default function AdminTerms() {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [editorMode, setEditorMode] = useState<'WRITE' | 'PREVIEW'>('WRITE');

  const [formData, setFormData] = useState({
    version: '',
    title: '',
    htmlContent: ''
  });

  const { data, isLoading } = useQuery<PaginatedTermsResponse>({
    queryKey: ['adminTerms'],
    queryFn: () => adminApi.getTerms({ limit: 50 })
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof formData) => adminApi.createTerm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTerms'] });
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { title: string; htmlContent: string } }) => 
      adminApi.updateTerm(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTerms'] });
      closeModal();
    }
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.activateTerm(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminTerms'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTerm(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminTerms'] }),
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete term');
    }
  });

  const openModal = (term?: Term) => {
    if (term) {
      setEditingTerm(term);
      setFormData({
        version: term.version,
        title: term.title,
        htmlContent: term.htmlContent
      });
    } else {
      setEditingTerm(null);
      setFormData({
        version: '',
        title: '',
        htmlContent: ''
      });
    }
    setEditorMode('WRITE');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTerm(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTerm) {
      updateMutation.mutate({ 
        id: editingTerm.id, 
        payload: { title: formData.title, htmlContent: formData.htmlContent } 
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading terms...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Terms of Service</h2>
        <button 
          onClick={() => openModal()} 
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-all"
        >
          <Plus size={16} /> Add New Version
        </button>
      </div>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Version</th>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data?.map((term: Term) => (
                <tr key={term.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium">{term.version}</td>
                  <td className="px-6 py-4 max-w-[250px] truncate font-medium">{term.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${term.isActive ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                      {term.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(term.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <button 
                      onClick={() => openModal(term)} 
                      className="p-2 text-foreground hover:bg-secondary transition-colors rounded"
                      title="Edit Term"
                    >
                      <Edit size={16} />
                    </button>
                    {!term.isActive && (
                      <button 
                        onClick={() => activateMutation.mutate(term.id)}
                        className="p-2 text-green-600 hover:bg-green-100 transition-colors bg-secondary rounded"
                        title="Set Active"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => { if(window.confirm('Delete term?')) deleteMutation.mutate(term.id); }}
                      className="p-2 text-destructive hover:bg-destructive/10 transition-colors bg-secondary rounded disabled:opacity-50"
                      disabled={term.isActive}
                      title={term.isActive ? "Cannot delete active term" : "Delete Term"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {data?.data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No terms found. Create a version to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-4xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
              <h2 className="text-xl font-bold">{editingTerm ? 'Edit Terms of Service' : 'Create Terms of Service'}</h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="terms-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Version String</label>
                    <input 
                      type="text" 
                      required 
                      disabled={!!editingTerm}
                      className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50 font-mono text-sm disabled:opacity-60" 
                      value={formData.version} 
                      onChange={e => setFormData({...formData, version: e.target.value})} 
                      placeholder="e.g., v1.0.0 or 2026-05-25"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Document Title</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:border-primary/50" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      placeholder="Spot Nordic Terms of Service"
                    />
                  </div>
                </div>

                <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-background">
                  <div className="bg-muted/40 px-4 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Code size={13} /> HTML Content Editor
                    </span>
                    <div className="flex bg-card border border-border rounded-md p-0.5">
                      <button
                        type="button"
                        onClick={() => setEditorMode('WRITE')}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-sm transition-all ${
                          editorMode === 'WRITE' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Code View
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode('PREVIEW')}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-sm transition-all ${
                          editorMode === 'PREVIEW' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Eye size={12} /> Render Preview
                      </button>
                    </div>
                  </div>

                  {editorMode === 'WRITE' ? (
                    <textarea
                      required
                      rows={16}
                      className="w-full p-4 bg-background focus:outline-none font-mono text-sm resize-y min-h-[300px]"
                      value={formData.htmlContent}
                      onChange={(e) => setFormData({...formData, htmlContent: e.target.value})}
                      placeholder="<h2>User Agreement</h2><p>Provide terms details...</p>"
                    />
                  ) : (
                    <div className="p-6 bg-card min-h-[300px] max-h-[500px] overflow-y-auto">
                      {formData.htmlContent ? (
                        <article 
                          className="prose prose-slate dark:prose-invert max-w-none 
                            prose-headings:font-bold prose-h2:text-2xl prose-h2:border-b prose-h2:pb-2 prose-h3:text-xl
                            prose-p:text-muted-foreground prose-p:text-base prose-p:leading-relaxed
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            prose-ul:list-disc prose-ul:pl-5 prose-li:text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: formData.htmlContent }}
                        />
                      ) : (
                        <p className="text-sm italic text-muted-foreground text-center pt-12">No HTML content provided to preview.</p>
                      )}
                    </div>
                  )}
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
                form="terms-form" 
                disabled={createMutation.isPending || updateMutation.isPending} 
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/95 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {editingTerm ? 'Save Changes' : 'Create Version'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}