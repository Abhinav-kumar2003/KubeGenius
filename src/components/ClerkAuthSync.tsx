import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export default function ClerkAuthSync() {
  const { getToken, userId, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn && userId && user) {
        try {
          const token = await getToken();
          if (token) {
            localStorage.setItem('token', token);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error getting Clerk token:', error);
          localStorage.removeItem('token');
        }

        // Keep Zustand's auth store state in sync for dashboard pages
        useAuthStore.setState({
          user: {
            id: userId,
            name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress.split('@')[0] || 'User',
            email: user.primaryEmailAddress?.emailAddress || '',
            role: 'admin', // default role
            avatar: user.imageUrl,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem('token');
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    syncToken();
  }, [isSignedIn, userId, user, getToken]);

  return null;
}
