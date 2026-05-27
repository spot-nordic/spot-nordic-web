'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { TicketChat } from '@/components/ui/TicketChat';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminTicketDetail() {
  const params = useParams();
  const ticketId = params.ticketId as string;

  const { data } = useQuery({
    queryKey: ['adminTicket', ticketId],
    queryFn: () => adminApi.getTicketDetails(ticketId)
  });

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Link href="/admin/tickets" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to All Tickets
      </Link>
      
      <div className="mb-6 flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {data?.ticket?.subject || 'Support Ticket Chat'}
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-2">ID: {ticketId}</p>
        </div>
        {data?.ticket?.status && (
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            data.ticket.status === 'RESOLVED' || data.ticket.status === 'CLOSED' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-primary/10 text-primary'
          }`}>
            {data.ticket.status}
          </span>
        )}
      </div>

      <TicketChat ticketId={ticketId} isAdmin={true} />
    </div>
  );
}