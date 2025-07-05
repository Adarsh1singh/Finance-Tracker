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
import Header from '@/components/Header';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

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

interface BudgetPageProps {
  onNavigateBack: () => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

const BudgetPage = ({ onLogout, onNavigate }: BudgetPageProps) => {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        pageName="Budget Management"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                      <div key={budget.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{categoryDetails?.icon || '📦'}</span>
                            <span className="font-medium text-gray-900">{budget.category}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {budget.percentage > 90 && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${
                              budget.percentage > 100 ? 'text-red-600' : 
                              budget.percentage > 80 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {budget.percentage.toFixed(1)}%
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(budget)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(budget.id)}
                              className="text-red-600 hover:text-red-900"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 cursor-pointer"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
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
      </main>
    </div>
  );
};

export default BudgetPage;
