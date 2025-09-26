# Merchant Onboarding Backend

A Node.js Express server that handles Stripe merchant account creation and onboarding link generation.

## Features

- Create Stripe merchant accounts
- Generate onboarding links for merchants
- Retrieve account information
- Secure API endpoints with rate limiting and CORS

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Stripe account with API keys

### Installation

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your actual Stripe API keys:
   ```
   STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key_here
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   REFRESH_URL=http://localhost:3000/reauth
   RETURN_URL=http://localhost:3000/return
   ```

### Running the Server

Development mode (with auto-restart):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Create Stripe Account

- **POST** `/api/stripe/create-account`
- **Body:**
  ```json
  {
    "type": "custom",
    "country": "NL",
    "email": "merchant@example.com",
    "business_type": "individual",
    "capabilities": {
      "card_payments": true,
      "transfers": true
    }
  }
  ```

### Create Account Link

- **POST** `/api/stripe/create-account-link`
- **Body:**
  ```json
  {
    "account_id": "acct_1234567890",
    "refresh_url": "http://localhost:3000/reauth",
    "return_url": "http://localhost:3000/return"
  }
  ```

### Get Account Information

- **GET** `/api/stripe/account/:account_id`

### Health Check

- **GET** `/api/health`

## Environment Variables

| Variable                 | Description                           | Default                      |
| ------------------------ | ------------------------------------- | ---------------------------- |
| `STRIPE_SECRET_KEY`      | Stripe secret API key                 | Required                     |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable API key            | Required                     |
| `PORT`                   | Server port                           | 5000                         |
| `NODE_ENV`               | Environment                           | development                  |
| `FRONTEND_URL`           | Frontend URL for CORS                 | http://localhost:3000        |
| `REFRESH_URL`            | Default refresh URL for account links | http://localhost:3000/reauth |
| `RETURN_URL`             | Default return URL for account links  | http://localhost:3000/return |

## Security Features

- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Input validation
- Error handling

## Stripe Integration

This backend integrates with Stripe's Connect platform to:

1. Create merchant accounts
2. Generate secure onboarding links
3. Track account status and capabilities

Make sure you have:

- A Stripe account
- Connect enabled (for custom accounts)
- Test API keys for development
- Live API keys for production
