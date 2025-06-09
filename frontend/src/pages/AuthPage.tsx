import { useState } from 'react';
import { Wallet } from 'lucide-react';
import LoginForm from '@/features/auth/LoginForm';
import RegisterForm from '@/features/auth/RegisterForm';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-full shadow-lg">
              <Wallet className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="mt-4 text-4xl font-bold text-gray-900">
            Expense Tracker
          </h1>
          <p className="mt-2 text-gray-600">
            Take control of your finances
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {isLogin ? (
            <LoginForm
              onSuccess={onAuthSuccess}
              onSwitchToRegister={() => setIsLogin(false)}
            />
          ) : (
            <RegisterForm
              onSuccess={onAuthSuccess}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Secure • Private • Easy to use
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
