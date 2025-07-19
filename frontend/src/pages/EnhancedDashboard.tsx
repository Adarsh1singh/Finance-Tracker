import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Download
} from 'lucide-react';
import { authService, type User as UserType } from '@/services/authService';
import { analyticsAPI } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ExpensesPieChart,
  MonthlyTrendsChart,
  TopSpendingChart,
  CumulativeBalanceChart
} from '@/components/charts';
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

interface MonthlyTrendData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

interface BalanceData {
  date: string;
  balance: number;
  income?: number;
  expenses?: number;
}

const EnhancedDashboard = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseData[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendData[]>([]);
  const [topSpendingCategories, setTopSpendingCategories] = useState<ExpenseData[]>([]);
  const [cumulativeBalance, setCumulativeBalance] = useState<BalanceData[]>([]);
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

      // Load all analytics data
      const [
        dashboardResponse,
        expensesResponse,
        monthlyTrendsResponse,
        topSpendingResponse,
        cumulativeBalanceResponse
      ] = await Promise.all([
        analyticsAPI.getDashboard(period),
        analyticsAPI.getExpensesByCategory(period),
        analyticsAPI.getMonthlyTrends(6), // Last 6 months
        analyticsAPI.getTopSpendingCategories(period, 8), // Top 8 categories
        analyticsAPI.getCumulativeBalance(period)
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

      if (monthlyTrendsResponse.success) {
        setMonthlyTrends((monthlyTrendsResponse.data as any)?.chartData || []);
      }

      if (topSpendingResponse.success) {
        setTopSpendingCategories((topSpendingResponse.data as any)?.chartData || []);
      }

      if (cumulativeBalanceResponse.success) {
        setCumulativeBalance((cumulativeBalanceResponse.data as any)?.chartData || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-indigo-600 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { summary, recentTransactions } = dashboardData || { 
    summary: { income: 0, expenses: 0, balance: 0, period: 'month' }, 
    recentTransactions: [] 
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-600 mt-2 font-medium">Welcome back! Here's your financial overview for this {period}.</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-slate-300 rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="flex items-center space-x-2 bg-white border-slate-300 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm transition-all duration-200"
              >
                <Download className="h-4 w-4" />
                <span className="font-medium">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden shadow-xl rounded-2xl mb-8">
            <div className="px-6 py-8 sm:p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold text-white mb-3">
                  Welcome back, {user?.name || 'Demo User'}! 👋
                </h2>
                <p className="text-blue-100 text-lg font-medium">
                  Here's your financial overview for this {period}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                        Total Income
                      </dt>
                      <dd className="text-2xl font-bold text-slate-900 mt-1">
                        {formatCurrency(summary.income)}
                      </dd>
                      <dd className="text-xs text-green-600 font-medium mt-1">
                        +12.5% from last {period}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <TrendingDown className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                        Total Expenses
                      </dt>
                      <dd className="text-2xl font-bold text-slate-900 mt-1">
                        {formatCurrency(summary.expenses)}
                      </dd>
                      <dd className="text-xs text-red-600 font-medium mt-1">
                        +8.2% from last {period}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                      summary.balance >= 0
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                        : 'bg-gradient-to-br from-orange-500 to-red-500'
                    }`}>
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                        Net Balance
                      </dt>
                      <dd className={`text-2xl font-bold mt-1 ${
                        summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(summary.balance)}
                      </dd>
                      <dd className={`text-xs font-medium mt-1 ${
                        summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {summary.balance >= 0 ? 'Positive' : 'Negative'} balance
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                        Transactions
                      </dt>
                      <dd className="text-2xl font-bold text-slate-900 mt-1">
                        {recentTransactions.length}
                      </dd>
                      <dd className="text-xs text-purple-600 font-medium mt-1">
                        Recent activity
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="space-y-8 mb-8">
            {/* Top Row - Main Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Expenses Pie Chart */}
              <ExpensesPieChart
                data={expensesByCategory}
                title="Expenses by Category"
              />

              {/* Monthly Trends Chart */}
              <MonthlyTrendsChart
                data={monthlyTrends}
                title="Income vs Expenses Trend"
                type="area"
              />
            </div>

            {/* Bottom Row - Secondary Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Top Spending Categories */}
              <TopSpendingChart
                data={topSpendingCategories}
                title="Top Spending Categories"
                limit={8}
              />

              {/* Cumulative Balance */}
              <CumulativeBalanceChart
                data={cumulativeBalance}
                title="Balance Over Time"
              />
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-slate-200 mb-8">
            <div className="px-6 py-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Recent Transactions
                  </h3>
                </div>
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
      </div>
    </div>
  );
};

export default EnhancedDashboard;
