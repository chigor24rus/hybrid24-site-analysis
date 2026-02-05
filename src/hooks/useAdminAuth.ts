import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseAdminAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  adminPassword: string | null;
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const authData = localStorage.getItem('adminAuth');
      const authTime = localStorage.getItem('adminAuthTime');

      if (!authData || !authTime) {
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/admin/login');
        return;
      }

      const hoursSinceAuth = (Date.now() - parseInt(authTime)) / (1000 * 60 * 60);
      if (hoursSinceAuth > 24) {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminAuthTime');
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/admin/login');
        return;
      }

      let password = authData;
      try {
        const authObj = JSON.parse(authData);
        if (authObj.password) {
          password = authObj.password;
        }
      } catch {
        // If not JSON, use as is
      }

      setAdminPassword(password);
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminAuthTime');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  return { isAuthenticated, isLoading, logout, adminPassword };
};
