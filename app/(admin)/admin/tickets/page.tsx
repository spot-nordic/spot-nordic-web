'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import Link from 'next/link';

interface AdminTicket {
  id: string;
  subject: string;
  creatorEmail: string;
  status: string;
  createdAt: string;
}

export default function AdminTickets() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['adminTickets'],
        queryFn: () => adminApi.getTickets({ limit: 50 })
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => adminApi.updateTicketStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminTickets'] })
    });

    if (isLoading) return <div>Loading tickets...</div>;

    const statuses: string[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    return (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="uppercase tracking-wider border-b border-border bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4 font-medium">Ticket ID</th>
                            <th className="px-6 py-4 font-medium">Subject</th>
                            <th className="px-6 py-4 font-medium">Creator</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data?.data?.map((ticket: AdminTicket) => (
                            <tr key={ticket.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-6 py-4">
                                    <Link href={`/admin/tickets/${ticket.id}`} className="font-mono text-xs text-primary hover:underline">
                                        {ticket.id.slice(0, 8)}...
                                    </Link>
                                </td>
                                <td className="px-6 py-4 font-medium max-w-[200px] truncate">
                                    <Link href={`/admin/tickets/${ticket.id}`} className="hover:text-primary transition-colors">
                                        {ticket.subject}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{ticket.creatorEmail}</td>
                                <td className="px-6 py-4">
                                    <select
                                        className="bg-background border border-border rounded px-2 py-1 outline-none focus:border-primary text-xs font-bold"
                                        value={ticket.status}
                                        onChange={(e) => updateStatusMutation.mutate({ id: ticket.id, status: e.target.value })}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        {statuses.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}