import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { TransactionType } from '@prisma/client';

// Create Budget
export const createBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, amount, period, startDate, endDate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!category || !amount || !period || !startDate || !endDate) {
      res.status(400).json({ 
        success: false,
        message: 'Category, amount, period, start date, and end date are required' 
      });
      return;
    }

    const validPeriods = ['weekly', 'monthly', 'yearly'];
    if (!validPeriods.includes(period)) {
      res.status(400).json({ 
        success: false,
        message: 'Period must be weekly, monthly, or yearly' 
      });
      return;
    }

    // Check if budget already exists for this category and period
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId,
        category,
        period,
        startDate: { lte: new Date(endDate) },
        endDate: { gte: new Date(startDate) }
      }
    });

    if (existingBudget) {
      res.status(400).json({ 
        success: false,
        message: 'Budget already exists for this category and period' 
      });
      return;
    }

    const budget = await prisma.budget.create({
      data: {
        category,
        amount: parseFloat(amount),
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: { budget }
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get Budgets
export const getBudgets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { period, active } = req.query;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const where: any = { userId };
    
    if (period) {
      where.period = period;
    }

    if (active === 'true') {
      const now = new Date();
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    }

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: { startDate: 'desc' }
    });

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await prisma.transaction.aggregate({
          where: {
            userId,
            category: budget.category,
            type: TransactionType.EXPENSE,
            date: {
              gte: budget.startDate,
              lte: budget.endDate
            }
          },
          _sum: { amount: true }
        });

        const spent = spending._sum.amount || 0;
        const remaining = budget.amount - spent;
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        return {
          ...budget,
          spent,
          remaining,
          percentage: Math.round(percentage * 100) / 100,
          status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Budgets retrieved successfully',
      data: { budgets: budgetsWithSpending }
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get Budget by ID
export const getBudgetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const budget = await prisma.budget.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!budget) {
      res.status(404).json({ success: false, message: 'Budget not found' });
      return;
    }

    // Calculate spending
    const spending = await prisma.transaction.aggregate({
      where: {
        userId,
        category: budget.category,
        type: TransactionType.EXPENSE,
        date: {
          gte: budget.startDate,
          lte: budget.endDate
        }
      },
      _sum: { amount: true }
    });

    const spent = spending._sum.amount || 0;
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    const budgetWithSpending = {
      ...budget,
      spent,
      remaining,
      percentage: Math.round(percentage * 100) / 100,
      status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
    };

    res.status(200).json({
      success: true,
      message: 'Budget retrieved successfully',
      data: { budget: budgetWithSpending }
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update Budget
export const updateBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category, amount, period, startDate, endDate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Check if budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!existingBudget) {
      res.status(404).json({ success: false, message: 'Budget not found' });
      return;
    }

    if (period && !['weekly', 'monthly', 'yearly'].includes(period)) {
      res.status(400).json({ 
        success: false,
        message: 'Period must be weekly, monthly, or yearly' 
      });
      return;
    }

    const updateData: any = {};
    if (category !== undefined) updateData.category = category;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (period !== undefined) updateData.period = period;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);

    const budget = await prisma.budget.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: { budget }
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete Budget
export const deleteBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Check if budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!existingBudget) {
      res.status(404).json({ success: false, message: 'Budget not found' });
      return;
    }

    await prisma.budget.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
