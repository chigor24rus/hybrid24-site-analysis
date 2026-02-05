import { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { LoadingScreen } from './LoadingScreen';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isLoading } = useAdminAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};
