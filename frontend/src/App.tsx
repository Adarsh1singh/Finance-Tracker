import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

// Pages
import AuthPage from './pages/AuthPage';
import EnhancedDashboard from './pages/EnhancedDashboard';
import TransactionsPage from './pages/TransactionsPage';
import BudgetPage from './pages/BudgetPage';
import ReportsPage from './pages/ReportsPage';

// Layout
import SidebarLayout from './components/layout/SidebarLayout';

// Services
import { authService } from './services/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'transactions' | 'budgets' | 'reports'>('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const isValid = await authService.validateToken();
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };



  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'dashboard' | 'transactions' | 'budgets' | 'reports');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderPage = () => {
    if (!isAuthenticated) {
      return <AuthPage onAuthSuccess={handleAuthSuccess} />;
    }

    return (
      <SidebarLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {(() => {
          switch (currentPage) {
            case 'transactions':
              return <TransactionsPage />;
            case 'budgets':
              return <BudgetPage />;
            case 'reports':
              return <ReportsPage />;
            case 'dashboard':
            default:
              return <EnhancedDashboard />;
          }
        })()}
      </SidebarLayout>
    );
  };

  return (
    <>
      {renderPage()}

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
}

export default App;
