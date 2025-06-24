import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { TransactionType } from '@prisma/client';

// Default categories to create for new users
const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: 'Food & Dining', type: TransactionType.EXPENSE, color: '#FF6B6B', icon: '🍽️' },
  { name: 'Transportation', type: TransactionType.EXPENSE, color: '#4ECDC4', icon: '🚗' },
  { name: 'Shopping', type: TransactionType.EXPENSE, color: '#45B7D1', icon: '🛍️' },
  { name: 'Entertainment', type: TransactionType.EXPENSE, color: '#96CEB4', icon: '🎬' },
  { name: 'Bills & Utilities', type: TransactionType.EXPENSE, color: '#FFEAA7', icon: '💡' },
  { name: 'Healthcare', type: TransactionType.EXPENSE, color: '#DDA0DD', icon: '🏥' },
  { name: 'Education', type: TransactionType.EXPENSE, color: '#98D8C8', icon: '📚' },
  { name: 'Travel', type: TransactionType.EXPENSE, color: '#F7DC6F', icon: '✈️' },
  { name: 'Other', type: TransactionType.EXPENSE, color: '#BDC3C7', icon: '📦' },
  
  // Income categories
  { name: 'Salary', type: TransactionType.INCOME, color: '#2ECC71', icon: '💰' },
  { name: 'Freelance', type: TransactionType.INCOME, color: '#3498DB', icon: '💻' },
  { name: 'Investment', type: TransactionType.INCOME, color: '#9B59B6', icon: '📈' },
  { name: 'Gift', type: TransactionType.INCOME, color: '#E74C3C', icon: '🎁' },
  { name: 'Other Income', type: TransactionType.INCOME, color: '#1ABC9C', icon: '💵' }
];

// Create default categories for a user
export const createDefaultCategories = async (userId: number): Promise<void> => {
  try {
    const categoriesData = DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      userId,
      isDefault: true
    }));

    await prisma.category.createMany({
      data: categoriesData,
      skipDuplicates: true
    });
  } catch (error) {
    console.error('Error creating default categories:', error);
    throw error;
  }
};

// Get Categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { type } = req.query;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const where: any = { userId };
    if (type && Object.values(TransactionType).includes(type as TransactionType)) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });

    // If no categories exist for this user, create default ones
    if (categories.length === 0) {
      await createDefaultCategories(userId);

      // Fetch categories again after creation
      const newCategories = await prisma.category.findMany({
        where,
        orderBy: [
          { isDefault: 'desc' },
          { name: 'asc' }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: { categories: newCategories }
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Create Category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, color, icon } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!name || !type) {
      res.status(400).json({ 
        success: false,
        message: 'Name and type are required' 
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

    // Check if category already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        userId,
        type
      }
    });

    if (existingCategory) {
      res.status(400).json({ 
        success: false,
        message: 'Category already exists' 
      });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        color: color || '#BDC3C7',
        icon: icon || '📦',
        userId,
        isDefault: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update Category
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!existingCategory) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    // Don't allow updating default categories' names
    if (existingCategory.isDefault && name && name !== existingCategory.name) {
      res.status(400).json({ 
        success: false,
        message: 'Cannot change name of default categories' 
      });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete Category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!existingCategory) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    // Don't allow deleting default categories
    if (existingCategory.isDefault) {
      res.status(400).json({ 
        success: false,
        message: 'Cannot delete default categories' 
      });
      return;
    }

    // Check if category is being used in transactions
    const transactionCount = await prisma.transaction.count({
      where: {
        category: existingCategory.name,
        userId
      }
    });

    if (transactionCount > 0) {
      res.status(400).json({ 
        success: false,
        message: `Cannot delete category. It is used in ${transactionCount} transaction(s)` 
      });
      return;
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
