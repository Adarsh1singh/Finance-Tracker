import { ReactNode } from 'react';
import Header from '@/components/Header';

interface AppLayoutProps {
  children: ReactNode;
  pageName: string;
  onLogout: () => void;
  rightContent?: ReactNode;
  onNavigate?: (page: string) => void;
}

const AppLayout = ({ children, pageName, onLogout, rightContent, onNavigate }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        pageName={pageName}
        onLogout={onLogout}
        rightContent={rightContent}
        onNavigate={onNavigate}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
