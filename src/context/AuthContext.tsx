import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Tenant, TenantSettings, Congregation, UserRole } from '../types';
import { api, getToken, setToken, clearToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  tenantSettings: TenantSettings | null;
  congregations: Congregation[];
  activeCongregationId: string;
  setActiveCongregationId: (id: string) => void;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  registerChurch: (data: any) => Promise<void>;
  quickSwitchRole: (roleCode: UserRole) => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(null);
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [activeCongregationId, setActiveCongregationId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getToken();
      if (!token) {
        // Fallback: auto-login as Pastor Principal on first visit for seamless experience
        try {
          const res = await api.login('pastor@ibcentral.com.br', 'pastor123');
          setToken(res.token);
          setUser(res.user);
          setTenant(res.tenant);
          setCongregations(res.congregations || []);
          if (res.congregations && res.congregations.length > 0) {
            setActiveCongregationId(res.congregations[0].id);
          }
        } catch (e) {
          console.warn('Initial session check:', e);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await api.getMe();
        setUser(res.user);
        setTenant(res.tenant);
        setTenantSettings(res.tenantSettings);
        setCongregations(res.congregations || []);
        if (res.congregations && res.congregations.length > 0) {
          setActiveCongregationId(res.congregations[0].id);
        }
      } catch (err) {
        console.error('Session validation error:', err);
        clearToken();
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setToken(res.token);
      setUser(res.user);
      setTenant(res.tenant);
      setCongregations(res.congregations || []);
      if (res.congregations && res.congregations.length > 0) {
        setActiveCongregationId(res.congregations[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerChurch = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.registerChurch(data);
      setToken(res.token);
      setUser(res.user);
      setTenant(res.tenant);
      if (res.congregationId) {
        setActiveCongregationId(res.congregationId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickSwitchRole = async (roleCode: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.quickSwitchRole(roleCode, tenant?.id || 'tenant_ibcentral');
      setToken(res.token);
      setUser(res.user);
      setTenant(res.tenant);
      setCongregations(res.congregations || []);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setTenant(null);
    setCongregations([]);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.roleCode === 'superadmin_saas') return true;
    return roles.includes(user.roleCode);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        tenantSettings,
        congregations,
        activeCongregationId,
        setActiveCongregationId,
        isLoading,
        login,
        logout,
        registerChurch,
        quickSwitchRole,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
