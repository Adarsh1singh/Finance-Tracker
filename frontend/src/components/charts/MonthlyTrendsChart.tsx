import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  monthName?: string;
}

interface MonthlyTrendsChartProps {
  data: MonthlyData[];
  title?: string;
  type?: 'line' | 'area';
}

const MonthlyTrendsChart = ({ data, title = "Monthly Income vs Expenses", type = 'area' }: MonthlyTrendsChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{formatMonth(label)}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 capitalize">{entry.dataKey}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          {payload.length > 0 && (
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Net Balance</span>
                <span className={`text-sm font-semibold ${
                  payload[0].payload.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(payload[0].payload.balance)}
                </span>
              </div>
            </div>
          )}
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
            <div className="text-4xl mb-2">📈</div>
            <p>No trend data available</p>
          </div>
        </div>
      </div>
    );
  }

  const processedData = data.map(item => ({
    ...item,
    monthName: formatMonth(item.month)
  }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
          <div className="w-6 h-6 text-white">📈</div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="monthName" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.6}
                name="Expenses"
              />
            </AreaChart>
          ) : (
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="monthName" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                name="Expenses"
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#6366F1"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#6366F1', strokeWidth: 2, r: 3 }}
                name="Balance"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendsChart;
