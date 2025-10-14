# JWT Authentication Setup

This application now includes JWT-based authentication. Here's how it works:

## Authentication Flow

1. **Application Start**: When the app loads, it checks for an existing JWT token in localStorage
2. **Token Verification**: If a token exists, it's verified with the server
3. **Login Required**: If no valid token exists, users are redirected to the login page
4. **Protected Routes**: All main application routes require authentication

## Login Credentials

**Demo User:**
- Email: `admin@example.com`
- Password: `password123`

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - User logout (optional)

### Protected Endpoints
All Stripe-related endpoints now require authentication:
- `GET /api/stripe/keys/status` - Check if keys are configured
- `POST /api/stripe/keys` - Store Stripe keys
- `DELETE /api/stripe/keys` - Clear Stripe keys
- `GET /api/stripe/accounts` - Get merchant accounts
- `GET /api/stripe/accounts/:id` - Get specific merchant account

## Features

### Login Component
- Email/password validation
- Error handling
- Loading states
- Responsive design

### Protected Routes
- Automatic redirection to login if not authenticated
- Token verification on app load
- Seamless user experience

### Header Menu
- User email display
- Logout functionality (clears JWT token)
- Clear Configured Keys button (clears Stripe keys from database)

## Security Features

- JWT tokens stored in localStorage
- Automatic token expiration (24 hours)
- Server-side token verification
- Protected API endpoints
- Password hashing with bcrypt
- CORS configuration

## Environment Variables

Create a `.env` file in the server directory with:

```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

## Usage

1. Start the server: `npm start` (in server directory)
2. Start the client: `npm start` (in client directory)
3. Navigate to `http://localhost:3000`
4. Login with the demo credentials
5. Configure Stripe keys if needed
6. Use the application normally

## Logout vs Clear Keys

- **Logout**: Clears the JWT token, user must login again
- **Clear Keys**: Clears Stripe keys from database, user remains logged in but needs to reconfigure keys
