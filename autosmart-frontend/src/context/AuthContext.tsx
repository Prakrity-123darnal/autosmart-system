import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import api from '../services/api';

type UserRole = 'admin' | 'staff' | 'customer';

interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    role: UserRole
  ) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => void;
  syncSessionUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

function parseUser(data: {
  id: number;
  name: string;
  email: string;
  role: string;
}): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role.toLowerCase() as UserRole,
  };
}

function persistSession(token: string, user: User) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function getErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: Record<string, unknown> } })
    ?.response?.data;
  if (!data) {
    return (err as Error)?.message || fallback;
  }
  if (typeof data.message === 'string') return data.message;
  if (typeof data.title === 'string' && data.errors) return data.title;
  const errors = data.errors as Record<string, string[]> | undefined;
  if (errors) {
    const first = Object.values(errors).flat()[0];
    if (first) return first;
  }
  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      localStorage.removeItem('user');
    }
  }, []);

  const applySession = (token: string, sessionUser: User) => {
    persistSession(token, sessionUser);
    flushSync(() => {
      setUser(sessionUser);
    });
  };

  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<AuthResult> => {
    try {
      const { data } = await api.post('/auth/login', { email, password, role });
      if (data.success && data.token && data.user) {
        const sessionUser = parseUser(data.user);
        applySession(data.token, sessionUser);
        return { success: true, user: sessionUser };
      }
      return { success: false, error: data.message || 'Login failed' };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err, 'Login failed') };
    }
  };

  const register = async (registerData: RegisterData): Promise<AuthResult> => {
    try {
      const { data } = await api.post('/auth/register', {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone,
        role: registerData.role,
        address: registerData.address ?? '',
      });
      if (data.success && data.token && data.user) {
        const sessionUser = parseUser(data.user);
        applySession(data.token, sessionUser);
        return { success: true, user: sessionUser };
      }
      return { success: false, error: data.message || 'Registration failed' };
    } catch (err: unknown) {
      return {
        success: false,
        error: getErrorMessage(err, 'Registration failed'),
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const syncSessionUser = (patch: Partial<User>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const value = { user, loading, login, register, logout, syncSessionUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getAuthUser(): User | null {
  return getStoredUser();
}
