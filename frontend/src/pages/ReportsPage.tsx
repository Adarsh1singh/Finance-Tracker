import { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
} from 'lucide-react';
import { analyticsAPI } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { formatCurrency } from '@/lib/utils';
import Header from '@/components/Header';
import toast from 'react-hot-toast';

interface ChartData {
  category?: string;
  amount: number;
  color: string;
  icon?: string;
  month?: string;
  monthName?: string;
  income?: number;
  expenses?: number;
  balance?: number;
  date?: string;
}

interface ReportsPageProps {
  onNavigateBack: () => void;
  onLogout: () => void;
}

const ReportsPage = ({ onNavigateBack, onLogout }: ReportsPageProps) => {
  const [expensesByCategory, setExpensesByCategory] = useState<ChartData[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<ChartData[]>([]);
  const [topSpendingCategories, setTopSpendingCategories] = useState<ChartData[]>([]);
  const [cumulativeBalance, setCumulativeBalance] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [selectedChart, setSelectedChart] = useState('overview');

  useEffect(() => {
    loadReportsData();
  }, [period]);

  const loadReportsData = async () => {
    try {
      setIsLoading(true);

      // Load data with individual error handling
      try {
        const expensesResponse = await analyticsAPI.getExpensesByCategory(period);
        if (expensesResponse.success) {
          setExpensesByCategory((expensesResponse.data as any)?.chartData || []);
        }
      } catch (error) {
        console.error('Failed to load expenses by category:', error);
        setExpensesByCategory([]);
      }

      try {
        const monthlyResponse = await analyticsAPI.getMonthlyTrends(6);
        if (monthlyResponse.success) {
          setMonthlyTrends((monthlyResponse.data as any)?.chartData || []);
        }
      } catch (error) {
        console.error('Failed to load monthly trends:', error);
        setMonthlyTrends([]);
      }

      try {
        const topSpendingResponse = await analyticsAPI.getTopSpendingCategories(period, 10);
        if (topSpendingResponse.success) {
          setTopSpendingCategories((topSpendingResponse.data as any)?.chartData || []);
        }
      } catch (error) {
        console.error('Failed to load top spending categories:', error);
        setTopSpendingCategories([]);
      }

      try {
        const balanceResponse = await analyticsAPI.getCumulativeBalance(period);
        if (balanceResponse.success) {
          setCumulativeBalance((balanceResponse.data as any)?.chartData || []);
        }
      } catch (error) {
        console.error('Failed to load cumulative balance:', error);
        setCumulativeBalance([]);
      }

    } catch (error) {
      console.error('Failed to load reports data:', error);
      toast.error('Some reports data could not be loaded');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await analyticsAPI.exportData('csv');
      if (response.success) {
        const blob = new Blob([response.data as string], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-report-${period}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Report exported successfully');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalExpenses = expensesByCategory.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = monthlyTrends.reduce((sum, item) => sum + (item.income || 0), 0);
  const totalBalance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        pageName="Reports & Analytics"
        showBackButton={true}
        onBackClick={onNavigateBack}
        onLogout={onLogout}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Controls */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div>
                  <Label htmlFor="period">Time Period</Label>
                  <select
                    id="period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="chart-type">View</Label>
                  <select
                    id="chart-type"
                    value={selectedChart}
                    onChange={(e) => setSelectedChart(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="overview">Overview</option>
                    <option value="categories">Categories</option>
                    <option value="trends">Trends</option>
                    <option value="balance">Balance</option>
                  </select>
                </div>
              </div>
              
              <Button
                onClick={handleExportReport}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Income
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(totalIncome)}
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
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Expenses
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(totalExpenses)}
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
                    <BarChart3 className={`h-8 w-8 ${totalBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Net Balance
                      </dt>
                      <dd className={`text-lg font-medium ${totalBalance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {formatCurrency(totalBalance)}
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
                    <PieChart className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Categories
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {expensesByCategory.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {selectedChart === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    {expensesByCategory.slice(0, 8).map((category, index) => {
                      const percentage = totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0;
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="text-sm text-gray-600">
                              {category.icon} {category.category}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(category.amount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Monthly Trends
                    </h3>
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    {monthlyTrends.slice(0, 6).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 w-20">
                            {trend.monthName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="text-green-600">+{formatCurrency(trend.income || 0)}</span>
                            <span className="text-gray-400 mx-2">|</span>
                            <span className="text-red-600">-{formatCurrency(trend.expenses || 0)}</span>
                          </div>
                          <div className={`text-sm font-medium ${
                            (trend.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(trend.balance || 0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedChart === 'categories' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Top Spending Categories
                </h3>
                <div className="space-y-4">
                  {topSpendingCategories.map((category, index) => {
                    const percentage = totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0;
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{category.icon || '📦'}</span>
                            <span className="font-medium text-gray-900">{category.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-medium text-gray-900">
                              {formatCurrency(category.amount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {percentage.toFixed(1)}% of total
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: category.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {selectedChart === 'trends' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Income vs Expenses Trend
                </h3>
                <div className="space-y-4">
                  {monthlyTrends.map((trend, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{trend.monthName}</h4>
                        <div className={`text-sm font-medium ${
                          (trend.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Net: {formatCurrency(trend.balance || 0)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Income</div>
                          <div className="text-lg font-medium text-green-600">
                            {formatCurrency(trend.income || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Expenses</div>
                          <div className="text-lg font-medium text-red-600">
                            {formatCurrency(trend.expenses || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedChart === 'balance' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Balance Over Time
                </h3>
                <div className="space-y-3">
                  {cumulativeBalance.slice(-10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="text-sm text-gray-600">
                        {new Date(item.date || '').toLocaleDateString()}
                      </div>
                      <div className={`text-sm font-medium ${
                        (item.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(item.balance || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
