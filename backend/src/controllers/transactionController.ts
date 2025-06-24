import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { TransactionType } from '@prisma/client';

// Create Transaction
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, amount, description, category, type, date } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!name || !amount || !category || !type) {
      res.status(400).json({ 
        success: false,
        message: 'Name, amount, category, and type are required' 
      });
      return;
    }

    if (!Object.values(TransactionType).includes(type)) {
      res.status(400).json({ 
        success: false,
        message: 'Type must be either INCOME or EXPENSE' 
      });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        name,
        amount: parseFloat(amount),
        description: description || null,
        category,
        type,
        date: date ? new Date(date) : new Date(),
        userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get All Transactions for User
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, type, category, startDate, endDate, search } = req.query;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build where clause
    const where: any = { userId };
    
    if (type && Object.values(TransactionType).includes(type as TransactionType)) {
      where.type = type;
    }
    
    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.transaction.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get Transaction by ID
export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!transaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update Transaction
export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, amount, description, category, type, date } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!existingTransaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }

    if (type && !Object.values(TransactionType).includes(type)) {
      res.status(400).json({ 
        success: false,
        message: 'Type must be either INCOME or EXPENSE' 
      });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type;
    if (date !== undefined) updateData.date = new Date(date);

    const transaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete Transaction
export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!existingTransaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }

    await prisma.transaction.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
