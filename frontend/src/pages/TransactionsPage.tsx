import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { transactionAPI, categoryAPI } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Transaction {
  id: number;
  name: string;
  amount: number;
  description?: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  color?: string;
  icon?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: "",
    icon: "📦",
    color: "#FF6384",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">(
    "ALL"
  );
  const [filterCategory, setFilterCategory] = useState("");

  // Pagination state (backend-driven)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
    category: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  // Load data when pagination or filters change
  useEffect(() => {
    loadTransactions();
  }, [
    pagination.page,
    pagination.limit,
    searchTerm,
    filterType,
    filterCategory,
  ]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadTransactions(), loadCategories()]);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      // Build query parameters for backend pagination
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchTerm) params.search = searchTerm;
      if (filterType !== "ALL") params.type = filterType;
      if (filterCategory) params.category = filterCategory;

      const response = await transactionAPI.getAll(params);

      if (response.success) {
        const data = response.data as any;
        setTransactions(data?.transactions || []);
        setPagination(data?.pagination || pagination);
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
      toast.error("Failed to load transactions.");
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.success) {
        setCategories((response.data as any)?.categories || []);
      } else {
        console.error("Categories response:", response);
        toast.error("Failed to load categories. Please refresh the page.");
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingTransaction) {
        const response = await transactionAPI.update(
          editingTransaction.id,
          data
        );
        if (response.success) {
          toast.success("Transaction updated successfully");
          setEditingTransaction(null);
          // Reload transactions to show the updated data
          await loadTransactions();
        }
      } else {
        const response = await transactionAPI.create(data);
        if (response.success) {
          toast.success("Transaction added successfully");
          // Reset to first page and force reload
          setPagination((prev) => ({ ...prev, page: 1 }));
          // Force reload of transactions to show the new one
          await loadTransactions();
        }
      }

      setFormData({
        name: "",
        amount: "",
        description: "",
        category: "",
        type: "EXPENSE",
        date: new Date().toISOString().split("T")[0],
      });
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to save transaction");
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      name: transaction.name,
      amount: transaction.amount.toString(),
      description: transaction.description || "",
      category: transaction.category,
      type: transaction.type,
      date: transaction.date.split("T")[0],
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const response = await transactionAPI.delete(id);
      if (response.success) {
        toast.success("Transaction deleted successfully");
        // If we're on a page with only one item and it's not the first page, go back one page
        if (transactions.length === 1 && pagination.page > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          // Reload current page
          loadTransactions();
        }
      }
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  // Filter change handlers that reset to page 1
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleTypeFilterChange = (value: "ALL" | "INCOME" | "EXPENSE") => {
    setFilterType(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilterChange = (value: string) => {
    setFilterCategory(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleItemsPerPageChange = (value: number) => {
    setPagination((prev) => ({ ...prev, limit: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("ALL");
    setFilterCategory("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategoryForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const categoryData = {
        name: newCategoryForm.name.trim(),
        type: formData.type,
        icon: newCategoryForm.icon,
        color: newCategoryForm.color,
      };

      const response = await categoryAPI.create(categoryData);
      if (response.success) {
        toast.success("Category created successfully");

        // Reload categories
        await loadCategories();

        // Set the new category as selected
        setFormData((prev) => ({
          ...prev,
          category: newCategoryForm.name.trim(),
        }));

        // Reset form and close modal
        setNewCategoryForm({ name: "", icon: "📦", color: "#FF6384" });
        setShowCategoryModal(false);
      }
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleOpenCategoryModal = () => {
    setNewCategoryForm({ name: "", icon: "📦", color: "#FF6384" });
    setShowCategoryModal(true);
  };

  const availableCategories = categories.filter(
    (cat) =>
      filterType === "ALL" ||
      cat.type === filterType ||
      cat.type === formData.type
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-indigo-600 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Page Header */}
        <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Transactions
                </h1>
                <p className="text-slate-600 mt-2 font-medium">
                  Manage your income and expenses
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingTransaction(null);
                  setFormData({
                    name: "",
                    amount: "",
                    description: "",
                    category: "",
                    type: "EXPENSE",
                    date: new Date().toISOString().split("T")[0],
                  });
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Add Transaction</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="type-filter">Type</Label>
                  <select
                    id="type-filter"
                    value={filterType}
                    onChange={(e) =>
                      handleTypeFilterChange(e.target.value as any)
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="ALL">All Types</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="category-filter">Category</Label>
                  <select
                    id="category-filter"
                    value={filterCategory}
                    onChange={(e) => handleCategoryFilterChange(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="items-per-page">Items per page</Label>
                  <select
                    id="items-per-page"
                    value={pagination.limit}
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {editingTransaction ? (
                        <Edit className="h-5 w-5 text-white" />
                      ) : (
                        <Plus className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <span>
                      {editingTransaction
                        ? "Edit Transaction"
                        : "Add New Transaction"}
                    </span>
                  </h3>
                </div>
                <div className="px-6 py-6 sm:p-8">

                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <Label htmlFor="name">Transaction Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Grocery shopping"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as any,
                          category: "",
                        })
                      }
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <div className="space-y-2">
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                      >
                        <option value="">Select a category</option>
                        {availableCategories
                          .filter((cat) => cat.type === formData.type)
                          .map((category) => (
                            <option key={category.id} value={category.name}>
                              {category.icon} {category.name}
                            </option>
                          ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOpenCategoryModal}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add New Category</span>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Optional description"
                    />
                  </div>

                  <div className="md:col-span-2 flex space-x-2">
                    <Button type="submit">
                      {editingTransaction
                        ? "Update Transaction"
                        : "Add Transaction"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingTransaction(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
                </div>
              </div>
            )}

            {/* Transactions Table */}
            <div className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Transactions
                    </h3>
                    <p className="text-slate-600 mt-1">
                      {pagination.total} total transactions
                    </p>
                  </div>
                  {pagination.pages > 1 && (
                    <div className="text-sm text-gray-500">
                      Page {pagination.page} of {pagination.pages}
                    </div>
                  )}
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No transactions
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding your first transaction.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Transaction
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {transactions.map((transaction: Transaction) => {
                          // Find the category details to get icon
                          const categoryDetails = categories.find(
                            (cat) => cat.name === transaction.category
                          );

                          return (
                            <tr
                              key={transaction.id}
                              className="hover:bg-slate-50 transition-colors duration-200"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                      transaction.type === "INCOME"
                                        ? "bg-green-100"
                                        : "bg-red-100"
                                    }`}
                                  >
                                    {transaction.type === "INCOME" ? (
                                      <TrendingUp className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <TrendingDown className="h-4 w-4 text-red-600" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {transaction.name}
                                    </div>
                                    {transaction.description && (
                                      <div className="text-sm text-gray-500">
                                        {transaction.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    transaction.type === "INCOME"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {transaction.type === "INCOME"
                                    ? "Income"
                                    : "Expense"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {categoryDetails?.icon && (
                                    <span className="mr-2">
                                      {categoryDetails.icon}
                                    </span>
                                  )}
                                  <span className="text-sm text-gray-900">
                                    {transaction.category}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`text-sm font-medium ${
                                    transaction.type === "INCOME"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {transaction.type === "INCOME" ? "+" : "-"}
                                  {formatCurrency(transaction.amount)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(transaction.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(transaction)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(transaction.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handlePageChange(Math.max(1, pagination.page - 1))
                        }
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handlePageChange(
                            Math.min(pagination.pages, pagination.page + 1)
                          )
                        }
                        disabled={pagination.page === pagination.pages}
                        className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium"
                      >
                        Next
                      </Button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(pagination.page - 1) * pagination.limit + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              pagination.page * pagination.limit,
                              pagination.total
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {pagination.total}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav
                          className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                          aria-label="Pagination"
                        >
                          <Button
                            variant="outline"
                            onClick={() =>
                              handlePageChange(Math.max(1, pagination.page - 1))
                            }
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </Button>

                          {/* Page Numbers */}
                          {Array.from(
                            { length: pagination.pages },
                            (_, i) => i + 1
                          ).map((page) => {
                            // Show first page, last page, current page, and pages around current page
                            const showPage =
                              page === 1 ||
                              page === pagination.pages ||
                              Math.abs(page - pagination.page) <= 1;

                            if (
                              !showPage &&
                              page === 2 &&
                              pagination.page > 4
                            ) {
                              return (
                                <span
                                  key="ellipsis1"
                                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                                >
                                  ...
                                </span>
                              );
                            }

                            if (
                              !showPage &&
                              page === pagination.pages - 1 &&
                              pagination.page < pagination.pages - 3
                            ) {
                              return (
                                <span
                                  key="ellipsis2"
                                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                                >
                                  ...
                                </span>
                              );
                            }

                            if (!showPage) return null;

                            return (
                              <Button
                                key={page}
                                variant={
                                  pagination.page === page
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => handlePageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                  pagination.page === page
                                    ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                }`}
                              >
                                {page}
                              </Button>
                            );
                          })}

                          <Button
                            variant="outline"
                            onClick={() =>
                              handlePageChange(
                                Math.min(pagination.pages, pagination.page + 1)
                              )
                            }
                            disabled={pagination.page === pagination.pages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </Button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* New Category Modal */}
        <Modal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          title="Create New Category"
          size="md"
        >
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={newCategoryForm.name}
                onChange={(e) =>
                  setNewCategoryForm({
                    ...newCategoryForm,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., Groceries, Gas, Entertainment"
                required
              />
            </div>

            <div>
              <Label htmlFor="categoryIcon">Icon</Label>
              <div className="grid grid-cols-8 gap-2 mt-2">
                {[
                  "🍽️",
                  "🚗",
                  "🛍️",
                  "🎬",
                  "💡",
                  "🏥",
                  "📚",
                  "✈️",
                  "🏠",
                  "💄",
                  "💰",
                  "💻",
                  "📈",
                  "🏢",
                  "💵",
                  "📦",
                ].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() =>
                      setNewCategoryForm({ ...newCategoryForm, icon })
                    }
                    className={`p-3 text-xl border-2 rounded-xl hover:bg-slate-50 transition-all duration-200 ${
                      newCategoryForm.icon === icon
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-slate-300"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="categoryColor">Color</Label>
              <div className="grid grid-cols-8 gap-2 mt-2">
                {[
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56",
                  "#4BC0C0",
                  "#9966FF",
                  "#FF9F40",
                  "#FF6B6B",
                  "#4ECDC4",
                  "#45B7D1",
                  "#96CEB4",
                  "#FFEAA7",
                  "#DDA0DD",
                  "#98D8C8",
                  "#F7DC6F",
                  "#BB8FCE",
                  "#BDC3C7",
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setNewCategoryForm({ ...newCategoryForm, color })
                    }
                    className={`w-8 h-8 rounded-lg border-2 hover:scale-110 transition-all duration-200 ${
                      newCategoryForm.color === color
                        ? "border-slate-800 shadow-lg"
                        : "border-slate-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <strong>Preview:</strong>
              <span className="ml-2 inline-flex items-center">
                <span className="mr-1">{newCategoryForm.icon}</span>
                <span>{newCategoryForm.name || "Category Name"}</span>
                <span
                  className="ml-2 w-3 h-3 rounded-full"
                  style={{ backgroundColor: newCategoryForm.color }}
                ></span>
              </span>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCategoryModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Category</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default TransactionsPage;
