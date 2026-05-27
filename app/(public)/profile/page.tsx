'use client';

import { useState, useEffect } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { sharedApi } from '@/api/shared';
import { useDispatch } from 'react-redux';
import { updateUser } from '@/store/slices/authSlice';
import { AuthGuard } from '@/components/layout/AuthGuard';

function ProfileContent() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => sharedApi.getProfile(),
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
    mutationFn: (updateData: typeof formData) =>
      sharedApi.updateProfile(updateData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      dispatch(
        updateUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
        })
      );

      alert('Profile updated successfully');
    },

    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16 min-h-screen max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">
        My Profile
      </h1>

      <div className="bg-card border border-border rounded-xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={data?.email || ''}
              disabled
              className="w-full p-3 bg-muted border border-border rounded-md text-muted-foreground cursor-not-allowed"
            />

            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name
              </label>

              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    firstName: e.target.value,
                  })
                }
                required
                className="w-full p-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name
              </label>

              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lastName: e.target.value,
                  })
                }
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
              {updateProfileMutation.isPending
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}