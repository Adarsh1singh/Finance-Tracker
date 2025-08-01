import { useState, useEffect } from 'react';
import {
  Plus,
  Target,
  AlertTriangle,
  Edit,
  Trash2,
  DollarSign
} from 'lucide-react';
import { budgetAPI, categoryAPI} from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { formatCurrency } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

interface Budget {
  id: number;
  category: string;
  amount: number;
  period: string;
  spent: number;
  percentage: number;
  isActive: boolean;
}

interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color?: string;
  icon?: string;
}

const BudgetPage = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [budgetsResponse, categoriesResponse] = await Promise.all([
        budgetAPI.getAll({ period: 'monthly', active: 'true' }),
        categoryAPI.getAll()
      ]);

      if (budgetsResponse.success) {
        setBudgets((budgetsResponse.data as any)?.budgets || []);
      }

      if (categoriesResponse.success) {
        setCategories((categoriesResponse.data as any)?.categories || []);
      }

    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load budget data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
        isActive: true
      };

      if (editingBudget) {
        const response = await budgetAPI.update(editingBudget.id, data);
        if (response.success) {
          toast.success('Budget updated successfully');
        }
      } else {
        const response = await budgetAPI.create(data);
        if (response.success) {
          toast.success('Budget created successfully');
        }
      }

      setFormData({ category: '', amount: '', period: 'monthly' });
      setShowBudgetModal(false);
      setEditingBudget(null);
      loadData();
    } catch (error) {
      toast.error('Failed to save budget');
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period
    });
    setShowBudgetModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      const response = await budgetAPI.delete(id);
      if (response.success) {
        toast.success('Budget deleted successfully');
        loadData();
      }
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const handleAddBudget = () => {
    setEditingBudget(null);
    setFormData({ category: '', amount: '', period: 'monthly' });
    setShowBudgetModal(true);
  };

  const handleCloseModal = () => {
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE');
  const usedCategories = budgets.map(b => b.category);
  const availableCategories = expenseCategories.filter(cat => 
    !usedCategories.includes(cat.name) || editingBudget?.category === cat.name
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-indigo-600 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-purple-700 bg-clip-text text-transparent">
                Budget Management
              </h1>
              <p className="text-slate-600 mt-2 font-medium">Set and track your spending limits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Actions */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Manage Your Budgets</h2>
              <p className="text-sm text-gray-500">Set spending limits and track your progress</p>
            </div>
            <Button
              onClick={handleAddBudget}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Budget</span>
            </Button>
          </div>

          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Budgets
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {budgets.length}
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
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Budget Amount
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0))}
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
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Over Budget
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {budgets.filter(b => b.percentage > 100).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Budget List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Your Budgets
              </h3>
              
              {budgets.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first budget.
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleAddBudget}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Budget
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.map((budget) => {
                    const categoryDetails = categories.find(cat => cat.name === budget.category);
                    return (
                      <div key={budget.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl shadow-lg ${
                              budget.percentage > 100
                                ? 'bg-gradient-to-br from-red-500 to-rose-500'
                                : budget.percentage > 80
                                ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                                : 'bg-gradient-to-br from-green-500 to-emerald-500'
                            }`}>
                              <span className="text-white text-sm">{categoryDetails?.icon || '📦'}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-lg">{budget.category}</span>
                              <p className="text-slate-500 text-sm capitalize">{budget.period}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {budget.percentage > 90 && (
                              <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              </div>
                            )}
                            <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
                              budget.percentage > 100 ? 'text-red-700 bg-red-100' :
                              budget.percentage > 80 ? 'text-yellow-700 bg-yellow-100' : 'text-green-700 bg-green-100'
                            }`}>
                              {budget.percentage.toFixed(1)}%
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(budget)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(budget.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full ${
                              budget.percentage > 100 ? 'bg-red-500' : 
                              budget.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Spent: {formatCurrency(budget.spent)}</span>
                          <span>Budget: {formatCurrency(budget.amount)}</span>
                          <span>Remaining: {formatCurrency(Math.max(0, budget.amount - budget.spent))}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Budget Modal */}
          <Modal
            isOpen={showBudgetModal}
            onClose={handleCloseModal}
            title={editingBudget ? 'Edit Budget' : 'Create New Budget'}
            size="md"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                  required
                >
                  <option value="">Select a category</option>
                  {availableCategories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select> 
              </div>
              
              <div>
                <Label htmlFor="amount">Budget Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="period">Period</Label>
                <select
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
