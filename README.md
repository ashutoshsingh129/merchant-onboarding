# Merchant Onboarding Application

A full-stack application for onboarding merchants using Stripe Connect. This application allows you to create Stripe merchant accounts and generate onboarding links for merchants to complete their setup.

## Features

- **Frontend (React + TypeScript + Material-UI)**
  - Modern, responsive UI for merchant onboarding
  - Form to create Stripe merchant accounts
  - Success modal showing account details
  - Generate and copy onboarding links
  - Dark/Light theme support

- **Backend (Node.js + Express + Stripe)**
  - RESTful API for Stripe integration
  - Create merchant accounts
  - Generate secure onboarding links
  - Retrieve account information
  - Rate limiting and security features

## Project Structure

```
Merchant Onboarding Final/
├── backend/                    # Express.js backend server
│   ├── routes/                # API routes
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables
├── simplypay_frontend-template_project/  # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── MerchantOnboarding/  # Merchant onboarding form
│   │   │   ├── Dashboard/     # Dashboard component
│   │   │   └── Layout/        # Layout component
│   │   ├── services/          # API services
│   │   └── store/             # Redux store
│   └── package.json           # Frontend dependencies
└── README.md                  # This file
```

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Stripe account with API keys

### Option 1: Start Both Servers at Once (Recommended)

```bash
# From the root directory
cd "Merchant Onboardig Final"

# Install all dependencies (root, backend, and frontend)
npm install

# Set up environment variables
# Edit backend/.env file with your Stripe API keys
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key_here

# Start both backend and frontend servers
npm start
```

This will start:

- Backend server on `http://localhost:5000`
- Frontend server on `http://localhost:3000`

### Option 2: Start Servers Separately

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
# Edit .env file with your Stripe API keys
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key_here

# Start the backend server
npm run dev
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd simplypay_frontend-template_project

# Install dependencies
npm install

# Start the frontend development server
npm start
```

### Access the Application

1. Open your browser and go to `http://localhost:3000`
2. Navigate to "Merchant Onboarding" from the top navigation
3. Fill out the merchant form and create an account
4. Generate onboarding links for merchants

## Available Scripts (Root Package.json)

From the root directory, you can use these npm scripts:

- `npm start` - Start both backend and frontend servers
- `npm run dev` - Same as npm start (alias)
- `npm run start:backend` - Start only the backend server
- `npm run start:frontend` - Start only the frontend server
- `npm run build` - Build the frontend for production
- `npm run setup` - Install all dependencies (root, backend, frontend)

## Usage

### Creating a Merchant Account

1. Fill out the merchant onboarding form:
   - Select account type (Custom, Express, Standard)
   - Choose country
   - Enter merchant email
   - Select business type
   - Configure capabilities (Card Payments, Transfers)

2. Click "Create Account" to create the Stripe account

3. A success modal will show:
   - Account ID
   - Account details
   - Generate onboarding link button

### Generating Onboarding Links

1. After account creation, click "Generate Onboarding Link"
2. The link will be generated and displayed
3. Copy the link to send to the merchant
4. Merchant can use this link to complete their onboarding

## API Endpoints

### Backend API

- `POST /api/stripe/create-account` - Create a new Stripe merchant account
- `POST /api/stripe/create-account-link` - Generate onboarding link
- `GET /api/stripe/account/:account_id` - Get account information
- `GET /api/health` - Health check

## Environment Variables

### Backend (.env)

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
REFRESH_URL=http://localhost:3000/reauth
RETURN_URL=http://localhost:3000/return
```

### Frontend

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Stripe Configuration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Enable Stripe Connect in your dashboard
3. Get your API keys from the Stripe dashboard
4. Update the `.env` file with your keys

## Development

### Backend Development

```bash
cd backend
npm run dev  # Starts with nodemon for auto-restart
```

### Frontend Development

```bash
cd simplypay_frontend-template_project
npm start    # Starts React development server
```

## Production Deployment

1. Update environment variables for production
2. Use production Stripe keys
3. Build the frontend: `npm run build`
4. Deploy backend and frontend to your hosting platform

## Security Features

- Rate limiting on API endpoints
- CORS protection
- Input validation
- Secure environment variable handling
- Helmet.js security headers

## Technologies Used

### Frontend

- React 19
- TypeScript
- Material-UI (MUI)
- Redux Toolkit
- React Router

### Backend

- Node.js
- Express.js
- Stripe API
- CORS
- Helmet.js
- Express Rate Limit

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
