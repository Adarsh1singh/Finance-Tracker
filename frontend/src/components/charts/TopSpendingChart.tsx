import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface SpendingData {
  category: string;
  amount: number;
  color: string;
  icon: string;
}

interface TopSpendingChartProps {
  data: SpendingData[];
  title?: string;
  limit?: number;
}

const TopSpendingChart = ({ data, title = "Top Spending Categories", limit = 10 }: TopSpendingChartProps) => {
  const [showModal, setShowModal] = useState(false);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{data.icon}</span>
            <span className="font-medium text-gray-900">{label}</span>
          </div>
          <p className="text-sm text-gray-600">
            Amount: <span className="font-semibold text-gray-900">{formatCurrency(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Remove the custom bar component that's causing the infinite loop

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No spending data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Chart shows all data, only legend is limited
  const maxLegendVisible = 4;
  const chartData = data.slice(0, limit);
  const legendData = chartData.slice(0, maxLegendVisible);
  const hiddenCount = chartData.length - maxLegendVisible;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
          <div className="w-6 h-6 text-white">📊</div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="category"
              tick={{ fontSize: 12 }}
              stroke="#666"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="amount"
              radius={[4, 4, 0, 0]}
              fill="#8884d8"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Compact Legend */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {legendData.map((item, index) => (
          <div key={index} className="flex items-center space-x-1 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-600 font-medium">{item.category}</span>
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
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">
            {formatCurrency(chartData.reduce((sum, item) => sum + item.amount, 0))}
          </span>
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
                {chartData.map((item, index) => (
                  <div key={`modal-${index}`} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium text-slate-700">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">{formatCurrency(item.amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Total:</span>
                <span className="font-bold text-slate-900 text-lg">
                  {formatCurrency(chartData.reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopSpendingChart;
