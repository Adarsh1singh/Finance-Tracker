import { useState, useEffect } from 'react';
import {
  LogOut,
  User,
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PieChart,
  BarChart3,
  Download
} from 'lucide-react';
import { authService, type User as UserType } from '@/services/authService';
import { analyticsAPI } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface DashboardData {
  summary: {
    income: number;
    expenses: number;
    balance: number;
    period: string;
  };
  recentTransactions: Array<{
    id: number;
    name: string;
    amount: number;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    date: string;
  }>;
}

interface ExpenseData {
  category: string;
  amount: number;
  color: string;
  icon: string;
}

interface DashboardPageProps {
  onLogout: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToBudgets: () => void;
  onNavigateToReports: () => void;
}

const EnhancedDashboard = ({ onLogout, onNavigateToTransactions, onNavigateToBudgets, onNavigateToReports }: DashboardPageProps) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get user info
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }

      // Load dashboard data
      const [dashboardResponse, expensesResponse] = await Promise.all([
        analyticsAPI.getDashboard(period),
        analyticsAPI.getExpensesByCategory(period)
      ]);

      if (dashboardResponse.success) {
        setDashboardData((dashboardResponse.data as any) || {
          summary: { income: 0, expenses: 0, balance: 0, period: 'month' },
          recentTransactions: []
        });
      }

      if (expensesResponse.success) {
        setExpensesByCategory((expensesResponse.data as any)?.chartData || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    onLogout();
  };

  const handleExportData = async () => {
    try {
      const response = await analyticsAPI.exportData('csv');
      if (response.success) {
        toast.success('Data exported successfully');
        // In a real app, you'd trigger a download here
      }
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { summary, recentTransactions } = dashboardData || { 
    summary: { income: 0, expenses: 0, balance: 0, period: 'month' }, 
    recentTransactions: [] 
  };

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
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.name}! 👋
                  </h2>
                  <p className="text-gray-600">
                    Here's your financial overview for this {period}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Income
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(summary.income)}
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
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Expenses
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(summary.expenses)}
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      summary.balance >= 0 ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      <DollarSign className={`h-5 w-5 ${
                        summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Balance
                      </dt>
                      <dd className={`text-lg font-medium ${
                        summary.balance >= 0 ? 'text-gray-900' : 'text-red-600'
                      }`}>
                        {formatCurrency(summary.balance)}
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
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Transactions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {recentTransactions.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Expenses by Category */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Expenses by Category
                  </h3>
                  <PieChart className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {expensesByCategory.slice(0, 5).map((expense, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: expense.color }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {expense.icon} {expense.category}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  ))}
                  {expensesByCategory.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No expenses recorded yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Transactions
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNavigateToTransactions}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>View All</span>
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'INCOME' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              transaction.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                            </span>
                            <span className="mx-1">•</span>
                            {transaction.category}
                            <span className="mx-1">•</span>
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${
                        transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  ))}
                  {recentTransactions.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No transactions yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={onNavigateToTransactions}
                  className="flex items-center justify-center space-x-2 h-12"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Transaction</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={onNavigateToReports}
                  className="flex items-center justify-center space-x-2 h-12"
                >
                  <PieChart className="h-5 w-5" />
                  <span>View Reports</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={onNavigateToBudgets}
                  className="flex items-center justify-center space-x-2 h-12"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Set Budget</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="flex items-center justify-center space-x-2 h-12"
                >
                  <Download className="h-5 w-5" />
                  <span>Export Data</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnhancedDashboard;
