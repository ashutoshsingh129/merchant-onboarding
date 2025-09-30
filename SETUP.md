# Merchant Onboarding Dashboard Setup

## Overview
This application provides a dashboard to manage and monitor Stripe merchant accounts with pagination support.

## Features
- ✅ Real-time Stripe account data
- ✅ Paginated table view
- ✅ Material-UI icons for status indicators
- ✅ Business type indicators (Company/Individual)
- ✅ Capability status (Card payments, Transfers)
- ✅ Terms of Service acceptance tracking
- ✅ Account status monitoring (Active/Pending/Disabled)

## Setup Instructions

### 1. Server Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```env
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # CORS Configuration
   FRONTEND_URL=http://localhost:3000

   # Onboarding URLs
   REFRESH_URL=https://localhost:3000/reauth
   RETURN_URL=https://localhost:3000/return
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Client Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the client:
   ```bash
   npm start
   ```

## API Endpoints

### Get Merchant Accounts (with pagination)
```
GET /api/stripe/accounts?limit=10&starting_after=acct_xxx&ending_before=acct_yyy
```

### Get Single Merchant Account
```
GET /api/stripe/accounts/:account_id
```

## Dashboard Features

### Table Columns
- **Account ID**: Stripe account identifier
- **Email**: Account email address
- **Business Type**: Company or Individual (with icons)
- **Country**: Account country code
- **Status**: Active, Pending, or Disabled (with status icons)
- **Capabilities**: Card payments and Transfers status
- **TOS Accepted**: Terms of Service acceptance status
- **Created**: Account creation date

### Status Icons
- ✅ **CheckCircle**: Active status, accepted TOS, active capabilities
- ⏳ **Pending**: Pending status, pending capabilities
- ❌ **Cancel**: Disabled status, inactive capabilities
- ⚠️ **Warning**: TOS not accepted
- 🏢 **Business**: Company business type
- 👤 **Person**: Individual business type

### Pagination
- Supports 5, 10, 25, 50 rows per page
- Uses Stripe's cursor-based pagination
- Shows total count when available

## Data Flow
1. Client calls backend API with pagination parameters
2. Backend calls Stripe API with proper authentication
3. Backend transforms Stripe response to match frontend interface
4. Frontend displays data with Material-UI components and icons

## Environment Variables

### Server (.env)
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

### Client
- `REACT_APP_API_BASE_URL`: Backend API URL (default: http://localhost:5000)

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure `FRONTEND_URL` in server .env matches your client URL
2. **Stripe API errors**: Verify your `STRIPE_SECRET_KEY` is correct
3. **Port conflicts**: Change `PORT` in server .env if 5000 is occupied

### Development Tips
- Use browser dev tools to inspect API calls
- Check server logs for Stripe API responses
- Verify environment variables are loaded correctly
