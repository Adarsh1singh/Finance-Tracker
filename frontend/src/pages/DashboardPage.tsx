import { useState, useEffect } from 'react';
import { LogOut, User, Wallet } from 'lucide-react';
import { authService, type User as UserType } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface DashboardPageProps {
  onLogout: () => void;
}

const DashboardPage = ({ onLogout }: DashboardPageProps) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // First try to get user from localStorage
        const cachedUser = authService.getCurrentUser();
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Then fetch fresh data from API
        const freshUser = await authService.getProfile();
        setUser(freshUser);
      } catch (error) {
        console.error('Failed to load user:', error);
        toast.error('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Expense Tracker
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{user?.name}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}! 👋
              </h2>
              <p className="text-gray-600">
                Ready to track your expenses and take control of your finances?
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Income
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        $0.00
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Expenses
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        $0.00
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Balance
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        $0.00
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Getting Started
              </h3>
              <div className="text-gray-600">
                <p className="mb-4">
                  Your authentication system is now set up! Here's what you can do next:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Add transaction management features</li>
                  <li>Create expense categories</li>
                  <li>Build reporting and analytics</li>
                  <li>Set up budget tracking</li>
                  <li>Add data export functionality</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
