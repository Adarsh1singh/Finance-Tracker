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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-200/20 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl">
              <Wallet className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="mt-6 text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Expense Tracker
          </h1>
          <p className="mt-3 text-lg text-slate-600 font-medium">
            Take control of your finances
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white/80 backdrop-blur-md py-8 px-8 shadow-2xl rounded-2xl border border-white/20">
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
          <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Private</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Easy to use</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
