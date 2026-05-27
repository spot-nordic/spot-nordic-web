'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { Trash2, CheckCircle, Eye, X, Mail, User, Clock, Tag, MessageSquare } from 'lucide-react';

export default function AdminContacts() {
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['adminContacts'],
    queryFn: () => adminApi.getContacts({ limit: 50 })
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => adminApi.updateContactStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContacts'] });
      if (selectedContact) {
        setSelectedContact({ ...selectedContact, status: 'DISABLED' });
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContacts'] });
      setIsModalOpen(false);
      setSelectedContact(null);
    }
  });

  const openModal = (contact: any) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading contacts...</div>;

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Contact Messages</h2>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data?.map((contact: any) => (
                <tr key={contact.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium">{contact.name}</td>
                  <td className="px-6 py-4">{contact.email}</td>
                  <td className="px-6 py-4 max-w-[200px] truncate">{contact.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${contact.status === 'ACTIVE' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'}`}>
                      {contact.status === 'ACTIVE' ? 'NEW' : 'RESOLVED'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <button 
                      onClick={() => openModal(contact)}
                      className="p-2 text-primary hover:bg-primary/10 transition-colors bg-secondary rounded"
                      title="View Message"
                    >
                      <Eye size={16} />
                    </button>
                    {contact.status === 'ACTIVE' && (
                      <button 
                        onClick={() => updateStatusMutation.mutate({ id: contact.id, status: 'DISABLED' })}
                        className="p-2 text-green-600 hover:bg-green-100 transition-colors bg-secondary rounded"
                        title="Mark Resolved"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => { if(window.confirm('Delete message?')) deleteMutation.mutate(contact.id); }}
                      className="p-2 text-destructive hover:bg-destructive/10 transition-colors bg-secondary rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {data?.data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No contact messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" />
                Message Details
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border border-border p-4 rounded-lg bg-background">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-muted-foreground" />
                    <span className="font-semibold text-foreground">{selectedContact.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-muted-foreground" />
                    <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline">{selectedContact.email}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Tag size={16} className="text-muted-foreground" />
                    <span className="font-medium">{selectedContact.subject}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={14} />
                    {new Date(selectedContact.createdAt).toLocaleString()}
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${selectedContact.status === 'ACTIVE' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'}`}>
                    {selectedContact.status === 'ACTIVE' ? 'Pending Review' : 'Resolved'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Message Content</h3>
                <div className="p-4 bg-muted/30 border border-border rounded-lg text-sm leading-relaxed whitespace-pre-wrap text-foreground min-h-[150px]">
                  {selectedContact.message}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
              {selectedContact.status === 'ACTIVE' && (
                <button 
                  onClick={() => updateStatusMutation.mutate({ id: selectedContact.id, status: 'DISABLED' })}
                  disabled={updateStatusMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                >
                  <CheckCircle size={16} />
                  Mark as Resolved
                </button>
              )}
              <a 
                href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(selectedContact.subject)}`}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/95 rounded-lg transition-colors shadow-sm"
              >
                <Mail size={16} />
                Reply via Email
              </a>
              <button 
                onClick={() => { if(window.confirm('Delete message?')) deleteMutation.mutate(selectedContact.id); }}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}