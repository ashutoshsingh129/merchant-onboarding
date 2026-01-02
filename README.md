# Merchant Onboarding Application

A full-stack application for onboarding merchants using Stripe Connect. This application allows you to create Stripe merchant accounts, manage onboarding processes, and generate onboarding links for merchants to complete their setup.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables Setup](#environment-variables-setup)
- [Running the Application](#running-the-application)
- [Authentication](#authentication)
- [Database Setup](#database-setup)
- [Available Scripts](#available-scripts)
- [Technologies Used](#technologies-used)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Features

### Frontend (React + TypeScript + Material-UI)
- Modern, responsive UI for merchant onboarding
- JWT-based authentication system
- Form to create Stripe merchant accounts
- Direct onboarding forms for multiple countries (US, UK, Japan, France, Greece, Cyprus, Sweden)
- Document upload functionality for identity verification
- Success modal showing account details
- Generate and copy onboarding links
- Dashboard to view and manage merchant accounts
- Dark/Light theme support
- Protected routes with authentication

### Backend (Node.js + Express + Stripe)
- RESTful API for Stripe integration
- JWT authentication middleware
- Create merchant accounts
- Direct merchant onboarding with country-specific handlers
- Generate secure onboarding links
- Retrieve account information
- Document upload to Stripe
- User management with PostgreSQL
- Encrypted storage of Stripe keys
- Rate limiting and security features

## Project Structure

```
merchant-onboarding/
├── Client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Dashboard/     # Dashboard component
│   │   │   ├── DirectOnboardForm/  # Country-specific onboarding forms
│   │   │   ├── Login/         # Login component
│   │   │   ├── MerchantOnboarding/ # Merchant onboarding form
│   │   │   ├── ProtectedRoute/    # Route protection
│   │   │   └── StripeKeysForm/    # Stripe keys configuration
│   │   ├── services/          # API services
│   │   ├── store/             # Redux store
│   │   ├── theme/             # MUI theme configuration
│   │   └── utils/             # Utility functions
│   └── package.json
├── server/                    # Express.js backend server
│   ├── config/                # Database configuration
│   ├── middleware/            # Authentication middleware
│   ├── routes/                # API routes
│   │   ├── handlers/          # Country-specific handlers
│   │   ├── auth.js            # Authentication routes
│   │   ├── stripe.js          # Stripe API routes
│   │   └── stripeKeys.js      # Stripe keys management
│   ├── scripts/               # Setup scripts
│   ├── utils/                 # Utility functions
│   ├── server.js              # Main server file
│   └── package.json
└── package.json               # Root package.json
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (v6 or higher) or **yarn**
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Stripe Account** with API keys - [Sign up](https://stripe.com)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd merchant-onboarding
   ```

2. **Install all dependencies:**
   ```bash
   npm run setup
   ```
   
   Or install manually:
   ```bash
   npm install
   cd Client && npm install && cd ..
   cd server && npm install && cd ..
   ```

## Environment Variables Setup

### Backend Environment Variables (`server/.env`)

Create a `.env` file in the `server/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Onboarding URLs
REFRESH_URL=http://localhost:3000/reauth
RETURN_URL=http://localhost:3000/return

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=merchant_onboarding
DB_PASSWORD=your_database_password
DB_PORT=5432

# Encryption Key (for encrypting Stripe keys in database)
# Generate a 32-byte hex string: openssl rand -hex 32
ENCRYPTION_KEY=your-64-character-hex-encryption-key-here
```

**Important Notes:**
- `JWT_SECRET`: Use a strong, random string in production. Generate one using: `openssl rand -base64 32`
- `ENCRYPTION_KEY`: Must be exactly 64 hexadecimal characters (32 bytes). Generate using: `openssl rand -hex 32`
- `DB_PASSWORD`: Your PostgreSQL database password
- In production, set `NODE_ENV=production` and use production database credentials

### Frontend Environment Variables (`Client/.env`)

Create a `.env` file in the `Client/` directory with the following variables:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000

# Frontend URL (optional, for redirects)
REACT_APP_FRONTEND_URL=http://localhost:3000

# Environment
REACT_APP_ENVIRONMENT=development

# Application Info (optional)
REACT_APP_APP_NAME=Merchant Onboarding
REACT_APP_VERSION=1.0.0
```

**Important Notes:**
- `REACT_APP_API_BASE_URL`: Should match your backend server URL
- For production, update to your production API URL
- All React environment variables must be prefixed with `REACT_APP_`

## Running the Application

### Option 1: Run Both Servers Together (Recommended)

From the root directory:

```bash
npm start
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend server on `http://localhost:3000`

### Option 2: Run Servers Separately

#### Start Backend Server

```bash
cd server
npm run dev
```

The backend will start on `http://localhost:5000`

#### Start Frontend Server

In a new terminal:

```bash
cd Client
npm start
```

The frontend will start on `http://localhost:3000`

## Authentication

The application uses JWT (JSON Web Tokens) for authentication.

### Default Admin Credentials

After running the setup script, you can login with:

- **Email:** `sal@simplypaymentsgroup.com`
- **Password:** `stripe2025!`

**Note:** These credentials are created automatically by the setup script. Change the password in production!

### Authentication Flow

1. User logs in with email and password
2. Server validates credentials and returns a JWT token
3. Token is stored in `localStorage` on the client
4. Token is included in API requests via `Authorization: Bearer <token>` header
5. Protected routes verify the token before allowing access

### Protected Routes

All Stripe-related endpoints require authentication:
- `/api/stripe/*` - All Stripe operations
- `/api/stripe/keys/*` - Stripe keys management

Public endpoints:
- `/api/auth/login` - User login
- `/api/auth/verify` - Token verification
- `/api/health` - Health check

## Database Setup

The application uses PostgreSQL for storing:
- User accounts
- Encrypted Stripe API keys

### Create Database

1. **Connect to PostgreSQL:**
   ```bash
   psql -U postgres
   ```

2. **Create the database:**
   ```sql
   CREATE DATABASE merchant_onboarding;
   ```

3. **Exit PostgreSQL:**
   ```sql
   \q
   ```

### Initialize Database Tables

The database tables are automatically created when you start the server for the first time. The server will:

1. Create `users` table
2. Create `stripe_keys` table
3. Create necessary indexes
4. Run the setup script to create the admin user

### Manual Database Setup

If you need to manually run the setup:

```bash
cd server
npm run setup-users
```

## Available Scripts

### Root Directory

- `npm start` - Start both backend and frontend servers
- `npm run dev` - Same as `npm start` (alias)
- `npm run start:server` - Start only the backend server
- `npm run start:client` - Start only the frontend server
- `npm run build` - Build the frontend for production
- `npm run setup` - Install all dependencies (root, backend, frontend)

### Backend (`server/`)

- `npm start` - Start server in production mode
- `npm run dev` - Start server with nodemon (auto-restart)
- `npm run setup-users` - Run user setup script

### Frontend (`Client/`)

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Technologies Used

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Axios/Fetch** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Stripe API** - Payment processing
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet.js** - Security headers
- **Express Rate Limit** - Rate limiting
- **Multer** - File upload handling

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password encryption
- **Encrypted Storage** - Stripe keys encrypted in database
- **Rate Limiting** - Protection against brute force attacks
- **CORS Protection** - Configured allowed origins
- **Helmet.js** - Security headers
- **Input Validation** - Server-side validation
- **Environment Variables** - Sensitive data in .env files

## Deployment

### Backend Deployment

1. Set all environment variables in your hosting platform
2. Ensure PostgreSQL database is accessible
3. Run database migrations on first deploy
4. Use production Stripe keys
5. Set `NODE_ENV=production`

### Frontend Deployment

1. Build the application:
   ```bash
   cd Client
   npm run build
   ```

2. Deploy the `build/` folder to your hosting platform
3. Set environment variables in your hosting platform
4. Configure API URL to point to your backend

### Environment Variables for Production

**Backend:**
- Use production database credentials
- Use production Stripe keys (`sk_live_*` and `pk_live_*`)
- Set strong `JWT_SECRET` and `ENCRYPTION_KEY`
- Update `FRONTEND_URL` to production URL
- Set `NODE_ENV=production`

**Frontend:**
- Set `REACT_APP_API_BASE_URL` to production API URL
- Set `REACT_APP_ENVIRONMENT=production`
- Update `REACT_APP_FRONTEND_URL` to production URL

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **CORS Errors**
   - Verify `FRONTEND_URL` in backend `.env` matches frontend URL
   - Check browser console for blocked origins

3. **Authentication Errors**
   - Verify JWT_SECRET is set in backend `.env`
   - Check token expiration settings
   - Clear browser localStorage and login again

4. **Stripe API Errors**
   - Verify Stripe keys are correct
   - Check if keys are configured in the application (use Stripe Keys Form)
   - Ensure Stripe account has Connect enabled

5. **Port Already in Use**
   - Change `PORT` in backend `.env` if 5000 is occupied
   - Change React default port: `PORT=3001 npm start`

6. **Module Not Found Errors**
   - Run `npm install` in root, Client, and server directories
   - Delete `node_modules` and `package-lock.json`, then reinstall

### Getting Help

- Check server logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure all dependencies are installed
- Check database connection and table creation

## Additional Resources

- [API Documentation](./API.md) - Detailed API endpoint documentation
- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe API Reference](https://stripe.com/docs/api)

## License

MIT License - see LICENSE file for details
