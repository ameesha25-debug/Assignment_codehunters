 import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Adjust this to your central axios/fetch wrapper if present
async function apiMe() {
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/me`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Unauthorized');
  return (await res.json()) as { id: string; mobile?: string; name?: string; credit?: number };
}

async function apiLogout() {
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 204) throw new Error('Logout failed');
}

export type User = { id: string; mobile?: string; name?: string; credit?: number };

type AuthState = {
  user: User | null;
  loading: boolean;
  reloadUser: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (token: string, user: User) => void; // added
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadUser = async () => {
    try {
      const u = await apiMe();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // On app boot, discover session from HttpOnly cookies
    reloadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await apiLogout();
    setUser(null);
    localStorage.removeItem('token');
  };

  const signIn = (token: string, u: User) => {
    // Persist client token for API calls that need Bearer; cookies still drive server session
    localStorage.setItem('token', token);
    setUser(u);
  };

  const value = useMemo(
    () => ({ user, loading, reloadUser, signOut, signIn }),
    [user, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
