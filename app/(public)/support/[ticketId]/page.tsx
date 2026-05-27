'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { TicketChat } from '@/components/ui/TicketChat';
import { sharedApi } from '@/api/shared';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;

  const { data } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => sharedApi.getTicketDetails(ticketId)
  });

  return (
    <div className="container mx-auto px-6 py-16 min-h-screen max-w-4xl">
      <Link href="/support" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Tickets
      </Link>
      
      <div className="mb-8 flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {data?.ticket?.subject || 'Support Conversation'}
          </h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm">Ticket ID: {ticketId}</p>
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

      <TicketChat ticketId={ticketId} isAdmin={false} />
    </div>
  );
}