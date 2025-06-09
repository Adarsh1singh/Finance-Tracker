# Expense Tracker - Authentication System

A complete authentication system built with React, TypeScript, Node.js, Express, PostgreSQL, and Prisma.

## 🚀 Features

- ✅ **User Registration** - Create new accounts with email and password
- ✅ **User Login** - Secure authentication with JWT tokens
- ✅ **Protected Routes** - Dashboard accessible only to authenticated users
- ✅ **Token Validation** - Automatic token verification and refresh
- ✅ **Responsive Design** - Beautiful UI with Tailwind CSS
- ✅ **Form Validation** - Client-side validation with Zod
- ✅ **Error Handling** - Comprehensive error handling and user feedback

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** database
- **Prisma** ORM for database operations
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **React Hook Form** for form handling
- **Zod** for validation
- **React Hot Toast** for notifications

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **PostgreSQL** database
- **npm** or **yarn**

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

You need to provide your PostgreSQL database credentials. Update the `backend/.env` file:

```env
# Database - UPDATE THESE WITH YOUR CREDENTIALS
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker?schema=public"

# JWT Secret - CHANGE THIS IN PRODUCTION
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL="http://localhost:5173"
```

### 3. Database Migration

After setting up your database credentials:

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations (creates tables)
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view your database
npx prisma studio
```

### 4. Start the Application

```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend development server
cd frontend
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

## 📚 API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| GET | `/api/auth/validate` | Validate token | Yes |

### Example API Usage

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Login User:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 🗄️ Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table (for future features)
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  amount DECIMAL NOT NULL,
  description VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  type transaction_type DEFAULT 'EXPENSE',
  date TIMESTAMP DEFAULT NOW(),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Server-side and client-side validation
- **CORS Protection**: Configured for specific origins
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## 🎨 UI Components

The frontend uses a modern design system with:

- **Responsive Layout**: Works on desktop and mobile
- **Form Validation**: Real-time validation feedback
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success and error notifications

## 🚧 Next Steps

This authentication system is ready for expansion. You can add:

1. **Transaction Management**: CRUD operations for expenses/income
2. **Categories**: Custom expense categories
3. **Reports**: Charts and analytics
4. **Budget Tracking**: Monthly budget limits
5. **Data Export**: CSV/PDF export functionality

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Prisma Migration Error**
   - Run `npx prisma generate` first
   - Check database permissions
   - Verify schema syntax

3. **CORS Error**
   - Check `FRONTEND_URL` in backend `.env`
   - Verify frontend is running on correct port

4. **JWT Token Error**
   - Check `JWT_SECRET` in `.env`
   - Clear browser localStorage
   - Verify token format

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker"
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
