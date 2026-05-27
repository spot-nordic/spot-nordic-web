'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharedApi } from '@/api/shared';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  createdAt: string;
  status: string;
}

export default function SupportPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ subject: string; description: string }>({ subject: '', description: '' });

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => sharedApi.getTickets(),
    enabled: isAuthenticated
  });

  const createTicketMutation = useMutation({
    mutationFn: () => sharedApi.createTicket(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setShowForm(false);
      setFormData({ subject: '', description: '' });
      alert('Support ticket created successfully.');
    }
  });

  if (!isAuthenticated || isLoading) return <div className="min-h-screen flex items-center justify-center">Loading support...</div>;

  return (
    <div className="container mx-auto px-6 py-16 min-h-screen max-w-5xl">
      <Link href="/account" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Account
      </Link>
      
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Support Tickets</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-5 py-2.5 rounded-md font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Cancel' : <><Plus size={18} /> New Ticket</>}
        </button>
      </div>

      {showForm && (
        <form 
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); createTicketMutation.mutate(); }} 
          className="bg-card border border-border p-6 rounded-xl shadow-sm mb-10 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-3 bg-background border border-border rounded focus:ring-2 focus:ring-primary/50 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-background border border-border rounded focus:ring-2 focus:ring-primary/50 outline-none resize-none"></textarea>
          </div>
          <button type="submit" disabled={createTicketMutation.isPending} className="bg-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-70">
            {createTicketMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      )}

      {!data?.data || data.data.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <h2 className="text-xl font-semibold mb-2">No tickets found</h2>
          <p className="text-muted-foreground">You don't have any support tickets yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map((ticket: Ticket) => (
            <Link key={ticket.id} href={`/support/${ticket.id}`} className="block">
                <div className="bg-card border border-border p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary transition-all shadow-sm">
                <div>
                    <h3 className="font-bold text-lg mb-1">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground">Created on {new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider self-start md:self-auto ${
                    ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-primary/10 text-primary'
                }`}>
                    {ticket.status}
                </span>
                </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}