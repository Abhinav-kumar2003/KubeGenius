import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (email: string) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800));
    set({
      user: {
        id: '1',
        name: email.split('@')[0],
        email,
        role: email.includes('admin') ? 'admin' : 'user',
      },
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  },
  register: async (name: string, email: string) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800));
    set({
      user: { id: '1', name, email, role: 'user' },
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));

interface DashboardState {
  selectedCluster: string;
  selectedNamespace: string;
  timeRange: string;
  setSelectedCluster: (cluster: string) => void;
  setSelectedNamespace: (ns: string) => void;
  setTimeRange: (range: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedCluster: 'production-eks',
  selectedNamespace: 'all',
  timeRange: '1h',
  setSelectedCluster: (cluster) => set({ selectedCluster: cluster }),
  setSelectedNamespace: (ns) => set({ selectedNamespace: ns }),
  setTimeRange: (range) => set({ timeRange: range }),
}));

interface UIState {
  sidebarCollapsed: boolean;
  terminalOpen: boolean;
  notifications: Array<{ id: string; title: string; message: string; type: 'info' | 'warning' | 'error'; status: 'firing' | 'resolved'; timestamp: string }>;
  toggleSidebar: () => void;
  toggleTerminal: () => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  terminalOpen: false,
  notifications: [],
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),
  addNotification: (notification) =>
    set((s) => ({
      notifications: [
        { ...notification, id: Math.random().toString(36).substring(7), timestamp: new Date().toISOString() },
        ...s.notifications,
      ].slice(0, 50),
    })),
}));
