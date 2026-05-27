'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { ShieldAlert, Trash2 } from 'lucide-react';

export default function AdminUsers() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getUsers({ limit: 50 })
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => adminApi.updateUserStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
    onError: (err: any) => alert(err.response?.data?.message || 'Failed to delete user')
  });

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b border-border bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.data?.map((user: any) => (
              <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 font-medium">{user.firstName} {user.lastName}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 flex justify-end gap-3">
                  <button 
                    onClick={() => toggleStatusMutation.mutate({ id: user.id, status: user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' })}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors bg-secondary rounded"
                    title={user.status === 'ACTIVE' ? 'Block User' : 'Activate User'}
                  >
                    <ShieldAlert size={16} />
                  </button>
                  <button 
                    onClick={() => { if(confirm('Permanently delete user?')) deleteMutation.mutate(user.id); }}
                    className="p-2 text-destructive hover:bg-destructive/10 transition-colors bg-secondary rounded"
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}