import { ReactNode, useState } from 'react';
import {
  Wallet,
  Home,
  CreditCard,
  Target,
  BarChart3,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { useEffect } from 'react';

interface SidebarLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface UserType {
  id: number;
  name: string;
  email: string;
}

const SidebarLayout = ({ children, currentPage, onNavigate, onLogout }: SidebarLayoutProps) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      path: 'dashboard'
    },
    {
      id: 'transactions',
      name: 'Transactions',
      icon: CreditCard,
      path: 'transactions'
    },
    {
      id: 'budgets',
      name: 'Budgets',
      icon: Target,
      path: 'budgets'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: BarChart3,
      path: 'reports'
    }
  ];

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard':
        return 'Dashboard';
      case 'transactions':
        return 'Transactions';
      case 'budgets':
        return 'Budget Management';
      case 'reports':
        return 'Reports & Analytics';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-slate-200`}>

        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Expense Tracker</h1>
              <p className="text-blue-100 text-xs">Financial Management</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-4 p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {user?.name || 'Demo User'}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {user?.email || 'demo@example.com'}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-white border-slate-200 text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">
              {getPageTitle(currentPage)}
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
