import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface BalanceData {
  date: string;
  balance: number;
  income?: number;
  expenses?: number;
  monthName?: string;
}

interface CumulativeBalanceChartProps {
  data: BalanceData[];
  title?: string;
}

const CumulativeBalanceChart = ({ data, title = "Cumulative Balance Over Time" }: CumulativeBalanceChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{formatDate(label)}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  data.balance >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">Balance</span>
              </div>
              <span className={`text-sm font-semibold ${
                data.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(data.balance)}
              </span>
            </div>
            {data.income !== undefined && (
              <div className="flex items-center justify-between space-x-4">
                <span className="text-xs text-gray-500">Income</span>
                <span className="text-xs text-green-600">{formatCurrency(data.income)}</span>
              </div>
            )}
            {data.expenses !== undefined && (
              <div className="flex items-center justify-between space-x-4">
                <span className="text-xs text-gray-500">Expenses</span>
                <span className="text-xs text-red-600">{formatCurrency(data.expenses)}</span>
              </div>
            )}
          </div>
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
            <p>No balance data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate min and max for better scaling
  const balances = data.map(d => d.balance);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  const isAllPositive = minBalance >= 0;
  const isAllNegative = maxBalance <= 0;

  // Determine gradient colors based on balance trend
  const getGradientId = () => {
    if (isAllPositive) return 'positiveGradient';
    if (isAllNegative) return 'negativeGradient';
    return 'mixedGradient';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="mixedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
              stroke="#666"
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Zero line reference */}
            <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
            
            <Area
              type="monotone"
              dataKey="balance"
              stroke={isAllPositive ? '#10B981' : isAllNegative ? '#EF4444' : '#6366F1'}
              strokeWidth={2}
              fill={`url(#${getGradientId()})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500">Current Balance</p>
          <p className={`text-sm font-semibold ${
            data[data.length - 1]?.balance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(data[data.length - 1]?.balance || 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Highest Balance</p>
          <p className="text-sm font-semibold text-green-600">
            {formatCurrency(maxBalance)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Lowest Balance</p>
          <p className="text-sm font-semibold text-red-600">
            {formatCurrency(minBalance)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CumulativeBalanceChart;
