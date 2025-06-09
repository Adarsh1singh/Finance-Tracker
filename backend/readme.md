backend/
├── src/
│   ├── config/                 # Database and app-level configuration
│   │   └── db.ts               # Initialize Prisma client
│
│   ├── controllers/            # Route handlers
│   │   └── authController.ts
│
│   ├── middleware/             # Auth middleware, error handlers
│   │   └── authMiddleware.ts
│
│   ├── routes/                 # Route definitions
│   │   └── authRoutes.ts
│
│   ├── services/               # Business logic
│   │   └── authService.ts
│
│   ├── utils/                  # Helper functions (e.g., JWT, hashing)
│   │   └── jwt.ts
│
│   ├── server.ts               # Entry point
│   
│
├── prisma/
│   ├── schema.prisma           # Prisma data model
│   └── seed.ts                 # Optional: seeding script
│
├── .env                        # Environment variables (DB URL, JWT secret)
├── package.json
├── tsconfig.json
├── README.md