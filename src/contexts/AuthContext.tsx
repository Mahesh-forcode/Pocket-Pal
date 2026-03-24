import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface UserData {
  fullName: string;
  dob: string;
  gender: string;
  loggedIn: boolean;
}

interface AuthContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  login: (data: UserData) => void;
  logout: () => void;
}

const STORAGE_KEY = 'financeiq_user';

function getStoredUser(): UserData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data?.loggedIn) return data;
    }
  } catch {}
  return null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(getStoredUser);

  const login = useCallback((data: UserData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUser(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('financeiq_transactions');
    localStorage.removeItem('financeiq_budgets');
    localStorage.removeItem('financeiq_recurring');
    localStorage.removeItem('financeiq_splitter');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
