import { PrismaClient, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample data for comprehensive seeding
const expenseCategories = [
  { name: 'Food & Dining', icon: '🍽️', color: '#FF6384' },
  { name: 'Transportation', icon: '🚗', color: '#36A2EB' },
  { name: 'Shopping', icon: '🛍️', color: '#FFCE56' },
  { name: 'Entertainment', icon: '🎬', color: '#4BC0C0' },
  { name: 'Bills & Utilities', icon: '⚡', color: '#9966FF' },
  { name: 'Healthcare', icon: '🏥', color: '#FF9F40' },
  { name: 'Education', icon: '📚', color: '#FF6B6B' },
  { name: 'Travel', icon: '✈️', color: '#4ECDC4' },
  { name: 'Home & Garden', icon: '🏠', color: '#45B7D1' },
  { name: 'Personal Care', icon: '💄', color: '#96CEB4' },
  { name: 'Insurance', icon: '🛡️', color: '#FFEAA7' },
  { name: 'Subscriptions', icon: '📱', color: '#DDA0DD' }
];

const incomeCategories = [
  { name: 'Salary', icon: '💼', color: '#10B981' },
  { name: 'Freelance', icon: '💻', color: '#059669' },
  { name: 'Investment', icon: '📈', color: '#047857' },
  { name: 'Business', icon: '🏢', color: '#065F46' },
  { name: 'Rental', icon: '🏘️', color: '#064E3B' },
  { name: 'Other Income', icon: '💰', color: '#022C22' }
];

// Sample transaction names for each category
const transactionNames: Record<string, string[]> = {
  'Food & Dining': ['Grocery Store', 'Restaurant Dinner', 'Coffee Shop', 'Fast Food', 'Lunch Meeting', 'Food Delivery'],
  'Transportation': ['Gas Station', 'Uber Ride', 'Public Transit', 'Car Maintenance', 'Parking Fee', 'Car Insurance'],
  'Shopping': ['Clothing Store', 'Electronics', 'Online Shopping', 'Department Store', 'Bookstore', 'Gift Purchase'],
  'Entertainment': ['Movie Theater', 'Concert Tickets', 'Streaming Service', 'Gaming', 'Sports Event', 'Museum'],
  'Bills & Utilities': ['Electricity Bill', 'Water Bill', 'Internet Bill', 'Phone Bill', 'Rent', 'Mortgage'],
  'Healthcare': ['Doctor Visit', 'Pharmacy', 'Dental Care', 'Health Insurance', 'Medical Tests', 'Therapy'],
  'Education': ['Course Fee', 'Books', 'Online Learning', 'Workshop', 'Certification', 'Training'],
  'Travel': ['Flight Tickets', 'Hotel Booking', 'Travel Insurance', 'Vacation Expenses', 'Business Trip', 'Car Rental'],
  'Home & Garden': ['Furniture', 'Home Improvement', 'Garden Supplies', 'Appliances', 'Cleaning Supplies', 'Decoration'],
  'Personal Care': ['Haircut', 'Spa Treatment', 'Cosmetics', 'Gym Membership', 'Personal Trainer', 'Wellness'],
  'Insurance': ['Life Insurance', 'Health Insurance', 'Car Insurance', 'Home Insurance', 'Travel Insurance', 'Disability Insurance'],
  'Subscriptions': ['Netflix', 'Spotify', 'Software License', 'Magazine', 'Cloud Storage', 'VPN Service'],
  'Salary': ['Monthly Salary', 'Bonus Payment', 'Overtime Pay', 'Commission', 'Annual Raise', 'Performance Bonus'],
  'Freelance': ['Web Development', 'Consulting', 'Design Work', 'Writing Project', 'Photography', 'Tutoring'],
  'Investment': ['Stock Dividends', 'Bond Interest', 'Crypto Gains', 'Real Estate', 'Mutual Funds', 'Trading Profit'],
  'Business': ['Product Sales', 'Service Revenue', 'Partnership Income', 'Licensing Fee', 'Royalties', 'Business Profit'],
  'Rental': ['Property Rent', 'Equipment Rental', 'Car Rental Income', 'Storage Rental', 'Parking Space', 'Room Rental'],
  'Other Income': ['Gift Money', 'Tax Refund', 'Cashback', 'Prize Money', 'Refund', 'Side Hustle']
};

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { email: 'demo@example.com' }
  });

  let user;
  if (existingUser) {
    console.log('📧 Using existing demo user...');
    user = existingUser;
  } else {
    // Create demo user
    console.log('👤 Creating demo user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword,
      },
    });
  }

  // Clear existing data for this user
  console.log('🧹 Clearing existing data...');
  await prisma.budget.deleteMany({ where: { userId: user.id } });
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.category.deleteMany({ where: { userId: user.id } });

  // Create categories
  console.log('📂 Creating categories...');
  const createdExpenseCategories = await Promise.all(
    expenseCategories.map(cat =>
      prisma.category.create({
        data: {
          name: cat.name,
          type: TransactionType.EXPENSE,
          color: cat.color,
          icon: cat.icon,
          userId: user.id,
          isDefault: true,
        },
      })
    )
  );

  const createdIncomeCategories = await Promise.all(
    incomeCategories.map(cat =>
      prisma.category.create({
        data: {
          name: cat.name,
          type: TransactionType.INCOME,
          color: cat.color,
          icon: cat.icon,
          userId: user.id,
          isDefault: true,
        },
      })
    )
  );

  console.log(`✅ Created ${createdExpenseCategories.length} expense categories`);
  console.log(`✅ Created ${createdIncomeCategories.length} income categories`);

  // Generate transactions for the last 6 months
  console.log('💰 Creating transactions...');
  const transactions = [];
  const now = new Date();
  
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    
    // Generate 2-3 income transactions per month
    const incomeCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < incomeCount; i++) {
      const category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
      const names = transactionNames[category.name];
      const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
      const transactionDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomDay);
      
      let amount;
      switch (category.name) {
        case 'Salary':
          amount = 4500 + Math.random() * 1500; // $4,500-$6,000
          break;
        case 'Freelance':
          amount = 800 + Math.random() * 1200; // $800-$2,000
          break;
        case 'Investment':
          amount = 200 + Math.random() * 800; // $200-$1,000
          break;
        case 'Business':
          amount = 1000 + Math.random() * 2000; // $1,000-$3,000
          break;
        case 'Rental':
          amount = 1200 + Math.random() * 800; // $1,200-$2,000
          break;
        default:
          amount = 100 + Math.random() * 500; // $100-$600
      }

      transactions.push({
        name: names[Math.floor(Math.random() * names.length)],
        amount: Math.round(amount * 100) / 100,
        description: `${category.name} transaction for ${monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        category: category.name,
        type: TransactionType.INCOME,
        date: transactionDate,
        userId: user.id,
      });
    }
    
    // Generate 15-25 expense transactions per month
    const expenseCount = Math.floor(Math.random() * 11) + 15;
    for (let i = 0; i < expenseCount; i++) {
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const names = transactionNames[category.name];
      const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
      const transactionDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomDay);
      
      let amount;
      switch (category.name) {
        case 'Bills & Utilities':
          amount = 200 + Math.random() * 300; // $200-$500
          break;
        case 'Food & Dining':
          amount = 15 + Math.random() * 85; // $15-$100
          break;
        case 'Transportation':
          amount = 25 + Math.random() * 75; // $25-$100
          break;
        case 'Shopping':
          amount = 30 + Math.random() * 170; // $30-$200
          break;
        case 'Entertainment':
          amount = 20 + Math.random() * 80; // $20-$100
          break;
        case 'Healthcare':
          amount = 50 + Math.random() * 200; // $50-$250
          break;
        case 'Travel':
          amount = 100 + Math.random() * 400; // $100-$500
          break;
        case 'Home & Garden':
          amount = 40 + Math.random() * 160; // $40-$200
          break;
        default:
          amount = 10 + Math.random() * 90; // $10-$100
      }

      transactions.push({
        name: names[Math.floor(Math.random() * names.length)],
        amount: Math.round(amount * 100) / 100,
        description: `${category.name} expense for ${monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        category: category.name,
        type: TransactionType.EXPENSE,
        date: transactionDate,
        userId: user.id,
      });
    }
  }

  // Create all transactions
  await prisma.transaction.createMany({
    data: transactions,
  });

  console.log(`✅ Created ${transactions.length} transactions`);

  // Create budgets for expense categories
  console.log('🎯 Creating budgets...');
  const budgets = expenseCategories.slice(0, 8).map(category => {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    let budgetAmount;
    switch (category.name) {
      case 'Food & Dining':
        budgetAmount = 600;
        break;
      case 'Transportation':
        budgetAmount = 300;
        break;
      case 'Bills & Utilities':
        budgetAmount = 800;
        break;
      case 'Shopping':
        budgetAmount = 400;
        break;
      case 'Entertainment':
        budgetAmount = 200;
        break;
      case 'Healthcare':
        budgetAmount = 300;
        break;
      case 'Travel':
        budgetAmount = 500;
        break;
      default:
        budgetAmount = 250;
    }

    return {
      category: category.name,
      amount: budgetAmount,
      period: 'monthly',
      startDate,
      endDate,
      userId: user.id,
    };
  });

  await prisma.budget.createMany({
    data: budgets,
  });

  console.log(`✅ Created ${budgets.length} budgets`);

  // Summary
  const totalTransactions = await prisma.transaction.count({ where: { userId: user.id } });
  const totalCategories = await prisma.category.count({ where: { userId: user.id } });
  const totalBudgets = await prisma.budget.count({ where: { userId: user.id } });

  console.log('\n🎉 Seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   👤 User: ${user.email}`);
  console.log(`   💰 Transactions: ${totalTransactions}`);
  console.log(`   📂 Categories: ${totalCategories}`);
  console.log(`   🎯 Budgets: ${totalBudgets}`);
  console.log('\n🚀 You can now login with:');
  console.log(`   📧 Email: demo@example.com`);
  console.log(`   🔑 Password: password123`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
