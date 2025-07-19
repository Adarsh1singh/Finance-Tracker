import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface ExpenseData {
  category: string;
  amount: number;
  color: string;
  icon: string;
}

interface ExpensesPieChartProps {
  data: ExpenseData[];
  title?: string;
}

const ExpensesPieChart = ({ data, title = "Expenses by Category" }: ExpensesPieChartProps) => {
  const [showModal, setShowModal] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{data.icon}</span>
            <span className="font-medium">{data.category}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Amount: <span className="font-semibold text-gray-900">{formatCurrency(data.amount)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-semibold text-gray-900">{((data.amount / data.total) * 100).toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };



  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No expense data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total for percentage calculation
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  // Chart shows all data, only legend is limited
  const maxLegendVisible = 4;
  const sortedData = [...dataWithTotal].sort((a, b) => b.amount - a.amount);

  // Legend shows only first few categories
  const legendData = sortedData.slice(0, maxLegendVisible);
  const hiddenCount = sortedData.length - maxLegendVisible;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
          <div className="w-6 h-6 text-white">📊</div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
              dataKey="amount"
              nameKey="category"
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Compact Legend */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {legendData.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center space-x-1 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600 font-medium">{entry.category}</span>
          </div>
        ))}
        {hiddenCount > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer hover:underline"
          >
            +{hiddenCount} more
          </button>
        )}
      </div>

      <div className="mt-4 text-center bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-3 border border-slate-200">
        <p className="text-sm text-slate-600">
          Total Expenses: <span className="font-bold text-slate-900 text-lg">{formatCurrency(total)}</span>
        </p>
      </div>

      {/* Modal for All Categories */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">All Categories</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="overflow-y-auto max-h-96">
              <div className="space-y-2">
                {sortedData.map((entry, index) => (
                  <div key={`modal-${index}`} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-lg">{entry.icon}</span>
                      <span className="font-medium text-slate-700">{entry.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">{formatCurrency(entry.amount)}</div>
                      <div className="text-xs text-slate-500">
                        {((entry.amount / total) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Total:</span>
                <span className="font-bold text-slate-900 text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPieChart;
