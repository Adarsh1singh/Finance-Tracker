import { Wallet, LogOut, User, Home, CreditCard, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { useState, useEffect } from 'react';

interface HeaderProps {
  pageName: string;
  onLogout: () => void;
  rightContent?: React.ReactNode;
  onNavigate?: (page: string) => void;
}

interface UserType {
  id: number;
  name: string;
  email: string;
}

const Header = ({
  pageName,
  onLogout,
  rightContent,
  onNavigate
}: HeaderProps) => {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Expense Tracker
              </h1>
              {pageName !== 'Dashboard' && (
                <p className="text-sm text-gray-500 mt-1">
                  {pageName}
                </p>
              )}
            </div>

            {/* Navigation Menu */}
            {onNavigate && (
              <nav className="ml-8 flex space-x-4">
                <Button
                  variant={pageName === 'Dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
                <Button
                  variant={pageName === 'Transactions' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('transactions')}
                  className="flex items-center space-x-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Transactions</span>
                </Button>
                <Button
                  variant={pageName === 'Budget Management' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('budgets')}
                  className="flex items-center space-x-2"
                >
                  <Target className="h-4 w-4" />
                  <span>Budgets</span>
                </Button>
                <Button
                  variant={pageName === 'Reports & Analytics' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('reports')}
                  className="flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Reports</span>
                </Button>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {rightContent}

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email || ''}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
