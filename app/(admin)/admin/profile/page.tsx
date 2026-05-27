'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharedApi } from '@/api/shared';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { updateUser } from '@/store/slices/authSlice';

export default function AdminProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: () => sharedApi.getProfile()
  });

  useEffect(() => {
    if (data) {
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
      });
    }
  }, [data]);

  const updateProfileMutation = useMutation({
    mutationFn: (updateData: typeof formData) => sharedApi.updateProfile(updateData),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
      dispatch(updateUser({ firstName: formData.firstName, lastName: formData.lastName }));
      alert('Profile updated successfully');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) return <div>Loading profile data...</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your administrator account settings</p>
      </div>
      
      <div className="bg-card border border-border rounded-xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input 
              type="email" 
              value={data?.email || ''} 
              disabled 
              className="w-full p-3 bg-muted border border-border rounded-md text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Administrator email cannot be changed.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
                className="w-full p-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
                className="w-full p-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}