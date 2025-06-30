import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { TransactionType } from '@prisma/client';

// Get Dashboard Summary
export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { period = 'month' } = req.query; // month, week, year

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Get total income and expenses
    const [totalIncome, totalExpenses, recentTransactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: TransactionType.INCOME,
          date: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: TransactionType.EXPENSE,
          date: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          amount: true,
          category: true,
          type: true,
          date: true
        }
      })
    ]);

    const income = totalIncome._sum.amount || 0;
    const expenses = totalExpenses._sum.amount || 0;
    const balance = income - expenses;

    res.status(200).json({
      success: true,
      message: 'Dashboard summary retrieved successfully',
      data: {
        summary: {
          income,
          expenses,
          balance,
          period
        },
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get Expense by Category
export const getExpensesByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { period = 'month' } = req.query;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: { gte: startDate }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    });

    // Get category details
    const categories = await prisma.category.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE
      }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.name] = {
        color: cat.color || undefined,
        icon: cat.icon || undefined
      };
      return acc;
    }, {} as Record<string, { color?: string; icon?: string }>);

    // Generate better colors for categories
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'
    ];

    const chartData = expensesByCategory.map((item, index) => ({
      category: item.category,
      amount: item._sum.amount || 0,
      color: categoryMap[item.category]?.color || colors[index % colors.length],
      icon: categoryMap[item.category]?.icon || '📦'
    }));

    // If no expenses found, provide sample structure with user's categories
    if (chartData.length === 0) {
      const sampleData = categories.slice(0, 3).map((cat, index) => ({
        category: cat.name,
        amount: 0,
        color: cat.color || colors[index],
        icon: cat.icon || '📦'
      }));

      return res.status(200).json({
        success: true,
        message: 'No expenses found for this period',
        data: {
          chartData: sampleData,
          period,
          total: 0,
          isEmpty: true
        }
      });
    }

    const total = chartData.reduce((sum, item) => sum + item.amount, 0);

    res.status(200).json({
      success: true,
      message: 'Expenses by category retrieved successfully',
      data: {
        chartData,
        period,
        total,
        isEmpty: false
      }
    });
  } catch (error) {
    console.error('Get expenses by category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get Monthly Trends
export const getMonthlyTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { months = 6 } = req.query;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const monthsCount = parseInt(months as string) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount);

    // Get monthly data
    const monthlyData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', date) as month,
        type,
        SUM(amount) as total
      FROM transactions 
      WHERE "userId" = ${userId} 
        AND date >= ${startDate}
      GROUP BY DATE_TRUNC('month', date), type
      ORDER BY month ASC
    ` as Array<{
      month: Date;
      type: TransactionType;
      total: number;
    }>;

    // Process data for chart
    const monthlyTrends: Record<string, { income: number; expenses: number }> = {};
    
    monthlyData.forEach(item => {
      const monthKey = item.month.toISOString().substring(0, 7); // YYYY-MM format
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (item.type === TransactionType.INCOME) {
        monthlyTrends[monthKey].income = Number(item.total);
      } else {
        monthlyTrends[monthKey].expenses = Number(item.total);
      }
    });

    const chartData = Object.entries(monthlyTrends).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses
    }));

    res.status(200).json({
      success: true,
      message: 'Monthly trends retrieved successfully',
      data: { chartData }
    });
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Export Data
export const exportData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { format = 'json', startDate, endDate } = req.query;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        name: true,
        amount: true,
        description: true,
        category: true,
        type: true,
        date: true,
        createdAt: true
      }
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'ID,Name,Amount,Description,Category,Type,Date,Created At\n';
      const csvData = transactions.map(t => 
        `${t.id},"${t.name}",${t.amount},"${t.description || ''}","${t.category}","${t.type}","${t.date.toISOString()}","${t.createdAt.toISOString()}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(csvHeader + csvData);
    } else {
      // Return JSON format
      res.status(200).json({
        success: true,
        message: 'Data exported successfully',
        data: { transactions }
      });
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
