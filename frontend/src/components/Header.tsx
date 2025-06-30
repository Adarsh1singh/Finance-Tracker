import { ArrowLeft, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { useState, useEffect } from 'react';

interface HeaderProps {
  pageName: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  onLogout: () => void;
  rightContent?: React.ReactNode;
}

interface UserType {
  id: number;
  name: string;
  email: string;
}

const Header = ({ 
  pageName, 
  showBackButton = false, 
  onBackClick, 
  onLogout,
  rightContent 
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
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackClick}
                className="mr-4 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {pageName}
              </h1>
            </div>
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
