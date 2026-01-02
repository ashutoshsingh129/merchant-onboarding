# API Documentation

Complete API documentation for the Merchant Onboarding application, including backend and frontend API details.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Backend API Endpoints](#backend-api-endpoints)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Stripe Keys Management](#stripe-keys-management)
  - [Stripe Account Management](#stripe-account-management)
  - [Document Upload](#document-upload)
- [Frontend API Services](#frontend-api-services)
- [Request/Response Formats](#requestresponse-formats)
- [Error Handling](#error-handling)
- [Country-Specific Onboarding](#country-specific-onboarding)

## Base URL

- **Development:** `http://localhost:5000/api`
- **Production:** Set via `REACT_APP_API_BASE_URL` environment variable

## Authentication

All protected endpoints require JWT authentication. Include the token in the request header:

```
Authorization: Bearer <your_jwt_token>
```

The token is obtained from the `/api/auth/login` endpoint and should be stored in `localStorage` on the client side.

## Backend API Endpoints

### Authentication Endpoints

#### Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### Verify Token

**Endpoint:** `GET /api/auth/verify`

**Description:** Verify if the current JWT token is valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  }
}
```

#### Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user (clears cache, token remains valid until expiration).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Stripe Keys Management

All Stripe keys endpoints require authentication.

#### Store Stripe Keys

**Endpoint:** `POST /api/stripe/keys`

**Description:** Store and encrypt Stripe API keys for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "secret_key": "sk_test_...",
  "publishable_key": "pk_test_..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stripe keys saved successfully",
  "data": {
    "id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "cache_updated": true,
    "validation": {
      "account_id": "acct_1234567890",
      "account_type": "standard",
      "country": "US"
    }
  }
}
```

**Error Responses:**

**400 - Invalid Key Format:**
```json
{
  "success": false,
  "error": "Invalid secret key format",
  "message": "Secret key must start with sk_test_ or sk_live_"
}
```

**400 - Validation Failed:**
```json
{
  "success": false,
  "error": "Invalid keys",
  "message": "The provided Stripe keys are invalid or not accessible"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Access token required"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "error": "Failed to save Stripe keys",
  "message": "Error details..."
}
```

#### Get Stripe Keys

**Endpoint:** `GET /api/stripe/keys`

**Description:** Get current Stripe keys (publishable key only, secret key is never returned).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "publishable_key": "pk_test_...",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "cache_status": {
      "has_keys": true,
      "cached_at": "2024-01-15T10:30:00Z"
    }
  },
  "hasKeys": true
}
```

#### Check Keys Status

**Endpoint:** `GET /api/stripe/keys/status`

**Description:** Check if Stripe keys are configured for the user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "hasKeys": true,
  "message": "Keys are configured for this user"
}
```

#### Clear Stripe Keys

**Endpoint:** `DELETE /api/stripe/keys`

**Description:** Delete all Stripe keys for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Stripe keys cleared successfully for this user",
  "data": {
    "deleted_count": 1
  }
}
```

### Stripe Account Management

All Stripe account endpoints require authentication and configured Stripe keys.

#### Create Stripe Account

**Endpoint:** `POST /api/stripe/create-account`

**Description:** Create a new Stripe Connect account.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "custom",
  "country": "US",
  "email": "merchant@example.com",
  "business_type": "individual",
  "capabilities": {
    "card_payments": true,
    "transfers": true
  }
}
```

**Note:** The `capabilities` field is optional. If not provided, defaults to:
```json
{
  "card_payments": { "requested": true },
  "transfers": { "requested": true }
}
```

The backend automatically converts boolean values to the Stripe format with `requested: true`.

**Response:**
```json
{
  "success": true,
  "account_id": "acct_1234567890",
  "account": {
    "id": "acct_1234567890",
    "email": "merchant@example.com",
    "country": "US",
    "type": "custom",
    "business_type": "individual",
    "created": 1691234567
  }
}
```

#### Create Account Link

**Endpoint:** `POST /api/stripe/create-account-link`

**Description:** Generate an onboarding link for a Stripe account.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "account_id": "acct_1234567890",
  "refresh_url": "http://localhost:3000/reauth",
  "return_url": "http://localhost:3000/return"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://connect.stripe.com/setup/c/acct_1234567890/abc123",
  "expires_at": 1691234567
}
```

#### Direct Merchant Onboarding

**Endpoint:** `POST /api/stripe/direct-onboard`

**Description:** Complete merchant onboarding with all required information. This endpoint routes to country-specific handlers based on the account country.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (US Individual):**
```json
{
  "account_id": "acct_1234567890",
  "business_type": "individual",
  "individual_first_name": "John",
  "individual_last_name": "Doe",
  "individual_email": "john.doe@example.com",
  "individual_phone": "+15551234567",
  "individual_dob_day": 15,
  "individual_dob_month": 6,
  "individual_dob_year": 1990,
  "individual_address_line1": "123 Main Street",
  "individual_address_line2": "Apt 4B",
  "individual_address_city": "New York",
  "individual_address_state": "NY",
  "individual_address_postal_code": "10001",
  "individual_address_country": "US",
  "business_profile_mcc": "5734",
  "business_profile_url": "https://example.com",
  "tos_acceptance_date": 1691234567,
  "tos_acceptance_ip": "203.0.113.1",
  "external_account_object": "bank_account",
  "external_account_country": "US",
  "external_account_currency": "usd",
  "external_account_account_number": "1234567890",
  "individual_verification_document_front": "file_xxx",
  "individual_verification_document_back": "file_yyy"
}
```

**Request Body (US Company):**
```json
{
  "account_id": "acct_1234567890",
  "business_type": "company",
  "company_name": "ABC Technologies LLC",
  "company_tax_id": "12-3456789",
  "company_structure": "private_corporation",
  "company_address_line1": "123 Main St",
  "company_address_city": "New York",
  "company_address_state": "NY",
  "company_address_postal_code": "10001",
  "company_address_country": "US",
  "representative_first_name": "Jane",
  "representative_last_name": "Smith",
  "representative_email": "jane.smith@company.com",
  "representative_dob_day": 10,
  "representative_dob_month": 3,
  "representative_dob_year": 1985,
  "representative_address_line1": "456 Business Ave",
  "representative_address_city": "New York",
  "representative_address_state": "NY",
  "representative_address_postal_code": "10002",
  "representative_address_country": "US",
  "representative_relationship_title": "CEO",
  "business_profile_mcc": "5734",
  "tos_acceptance_date": 1691234567,
  "external_account_object": "bank_account",
  "external_account_country": "US",
  "external_account_currency": "usd",
  "external_account_account_number": "1234567890",
  "company_verification_document_front": "file_xxx",
  "representative_verification_document_front": "file_yyy"
}
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "acct_1234567890",
    "email": "merchant@example.com",
    "country": "US",
    "type": "custom",
    "business_type": "individual",
    "charges_enabled": true,
    "payouts_enabled": true,
    "details_submitted": true
  },
  "external_account": {
    "id": "ba_1234567890",
    "object": "bank_account",
    "country": "US",
    "currency": "usd",
    "last4": "7890",
    "default_for_currency": true
  }
}
```

**Supported Countries:**
- **US** (United States) - Default handler
- **GB/UK** (United Kingdom)
- **JP** (Japan)
- **FR** (France)
- **GR** (Greece)
- **CY** (Cyprus)
- **SE** (Sweden)

**Country Detection:**
The handler is automatically selected based on the country code from:
1. `company_address_country` (for company accounts)
2. `individual_address_country` (for individual accounts)
3. `external_account_country` (fallback)
4. Defaults to US if none provided

Each country has specific field requirements. See [Country-Specific Onboarding](#country-specific-onboarding) for details.

#### Get Account Information

**Endpoint:** `GET /api/stripe/account/:account_id`

**Description:** Retrieve information about a specific Stripe account.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "acct_1234567890",
    "email": "merchant@example.com",
    "country": "US",
    "type": "custom",
    "business_type": "individual",
    "charges_enabled": true,
    "payouts_enabled": true,
    "details_submitted": true,
    "created": 1691234567
  }
}
```

#### Get All Accounts (Paginated)

**Endpoint:** `GET /api/stripe/accounts`

**Description:** Get paginated list of all Stripe accounts.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of accounts per page (default: 10, max: 100)
- `starting_after` (optional): Account ID to start after (cursor pagination)
- `ending_before` (optional): Account ID to end before (cursor pagination)

**Example:**
```
GET /api/stripe/accounts?limit=25&starting_after=acct_xxx
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "acct_1234567890",
        "email": "merchant@example.com",
        "country": "US",
        "business_type": "individual",
        "created": 1691234567,
        "business_profile": {
          "name": null,
          "url": null,
          "mcc": "5734"
        },
        "capabilities": {
          "card_payments": "active",
          "transfers": "active"
        },
        "charges_enabled": true,
        "payouts_enabled": true,
        "details_submitted": true,
        "requirements": {
          "disabled_reason": null
        },
        "tos_acceptance": {
          "date": 1691234567,
          "ip": "203.0.113.1",
          "user_agent": null
        }
      }
    ],
    "has_more": true,
    "total_count": null,
    "url": "/v1/accounts"
  }
}
```

#### Get Single Account by ID

**Endpoint:** `GET /api/stripe/accounts/:account_id`

**Description:** Get detailed information about a specific account.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "acct_1234567890",
    "email": "merchant@example.com",
    "country": "US",
    "business_type": "individual",
    "created": 1691234567,
    "business_profile": {
      "name": null,
      "url": "https://example.com",
      "mcc": "5734"
    },
    "capabilities": {
      "card_payments": "active",
      "transfers": "active"
    },
    "charges_enabled": true,
    "payouts_enabled": true,
    "details_submitted": true,
    "requirements": {
      "disabled_reason": null
    },
    "tos_acceptance": {
      "date": 1691234567,
      "ip": "203.0.113.1",
      "user_agent": null
    }
  }
}
```

#### Create External Account

**Endpoint:** `POST /api/stripe/create-external-account`

**Description:** Add a bank account to a Stripe account.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "account_id": "acct_1234567890",
  "object": "bank_account",
  "country": "US",
  "currency": "usd",
  "account_number": "1234567890",
  "routing_number": "110000000",
  "default_for_currency": true
}
```

**Required Fields:**
- `account_id` - Stripe account ID
- `object` - Type of external account (e.g., "bank_account")
- `country` - Country code (ISO 2-letter)
- `currency` - Currency code (ISO 3-letter)
- `account_number` - Bank account number

**Optional Fields:**
- `default_for_currency` - Set as default for the currency (default: true)

**Response:**
```json
{
  "success": true,
  "external_account": {
    "id": "ba_1234567890",
    "object": "bank_account",
    "country": "US",
    "currency": "usd",
    "last4": "7890",
    "bank_name": "STRIPE TEST BANK",
    "default_for_currency": true,
    "created": 1691234567
  }
}
```

#### Delete Account

**Endpoint:** `DELETE /api/stripe/accounts/:account_id`

**Description:** Delete a Stripe account.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "deleted": true,
  "account_id": "acct_1234567890",
  "message": "Account deleted successfully"
}
```

#### Reject Account

**Endpoint:** `POST /api/stripe/accounts/:account_id/reject`

**Description:** Reject a Stripe account (for compliance/verification issues).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "fraud"
}
```

**Valid reasons:** `fraud`, `terms_of_service`, `other`

**Error Response (Invalid Reason):**
```json
{
  "error": "Invalid reason",
  "valid_reasons": ["fraud", "terms_of_service", "other"]
}
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "acct_1234567890",
    "email": "merchant@example.com",
    "country": "US",
    "type": "custom",
    "business_type": "individual",
    "charges_enabled": false,
    "payouts_enabled": false,
    "details_submitted": true,
    "requirements": { ... },
    "created": 1691234567
  },
  "message": "Account rejected successfully"
}
```

### Document Upload

#### Upload Document

**Endpoint:** `POST /api/stripe/upload-document`

**Description:** Upload a verification document to Stripe (identity document, address proof, etc.).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `file`: File (image or PDF, max 10MB) - **Required**
- `purpose`: String (optional, default: "identity_document")

**Error Response (No File):**
```json
{
  "error": "No file uploaded"
}
```

**File Upload Process:**
1. File is temporarily stored on server using Multer
2. File is uploaded to Stripe's File API
3. Temporary file is automatically deleted after upload
4. File ID is returned for use in onboarding forms

**Supported File Types:**
- Images: PNG, JPG, JPEG, GIF
- Documents: PDF

**Response:**
```json
{
  "success": true,
  "file_id": "file_1SD2oaGRPKTxZdwraM51LBbV",
  "file": {
    "id": "file_1SD2oaGRPKTxZdwraM51LBbV",
    "object": "file",
    "purpose": "identity_document",
    "filename": "id_front.png",
    "size": 123456,
    "type": "png",
    "created": 1691234567
  }
}
```

**Document Types Supported:**

**For Individual Accounts:**
- `individual_verification_document_front` - ID document front
- `individual_verification_document_back` - ID document back
- `individual_verification_additional_document_front` - Address proof front
- `individual_verification_additional_document_back` - Address proof back

**For Company Accounts:**
- `company_verification_document_front` - Company document front
- `company_verification_document_back` - Company document back
- `representative_verification_document_front` - Representative ID front
- `representative_verification_document_back` - Representative ID back
- `representative_verification_additional_document_front` - Representative address proof front
- `representative_verification_additional_document_back` - Representative address proof back
- `owner_verification_document_front` - Owner ID front (if separate owner)
- `owner_verification_document_back` - Owner ID back (if separate owner)
- `owner_verification_additional_document_front` - Owner address proof front (if separate owner)
- `owner_verification_additional_document_back` - Owner address proof back (if separate owner)

## Frontend API Services

The frontend uses service classes to interact with the backend API.

### API Service (`src/services/api.ts`)

Main API service for general operations:

```typescript
import { apiService } from '../services/api';

// Check Stripe keys status
const status = await apiService.checkKeysStatus();

// Store Stripe keys
await apiService.storeStripeKeys({
  secret_key: 'sk_test_...',
  publishable_key: 'pk_test_...'
});

// Clear Stripe keys
await apiService.clearStripeKeys();

// Get merchant accounts (paginated)
const accounts = await apiService.getMerchantAccounts({
  limit: 25,
  starting_after: 'acct_xxx'
});

// Get single merchant account
const account = await apiService.getMerchantAccountById('acct_xxx');
```

### Stripe API Service (`src/services/stripeApi.ts`)

Stripe-specific operations:

```typescript
import {
  createStripeAccount,
  createAccountLink,
  directOnboardMerchant,
  uploadDocument,
  createExternalAccount,
  getAccountInfo,
  deleteMerchantAccount,
  rejectMerchantAccount,
  clearStripeKeys,
  checkKeysStatus
} from '../services/stripeApi';

// Create account
const account = await createStripeAccount({
  type: 'custom',
  country: 'US',
  email: 'merchant@example.com',
  business_type: 'individual',
  capabilities: {
    card_payments: true,
    transfers: true
  }
});

// Upload document
const uploadResult = await uploadDocument(file, 'identity_document');

// Direct onboard
await directOnboardMerchant({
  account_id: 'acct_xxx',
  business_type: 'individual',
  individual_first_name: 'John',
  individual_last_name: 'Doe',
  // ... other required fields
  individual_verification_document_front: uploadResult.file_id
});

// Get account info
const accountInfo = await getAccountInfo('acct_xxx');

// Delete account
await deleteMerchantAccount('acct_xxx');

// Reject account
await rejectMerchantAccount({
  account_id: 'acct_xxx',
  reason: 'fraud'
});

// Check keys status
const keysStatus = await checkKeysStatus();

// Clear Stripe keys
await clearStripeKeys();
```

## Request/Response Formats

### Standard Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (valid token but insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Error Handling

### Common Error Scenarios

1. **Missing Authentication Token**
   ```json
   {
     "success": false,
     "message": "Access token required"
   }
   ```

2. **Invalid Token**
   ```json
   {
     "success": false,
     "message": "Invalid or expired token"
   }
   ```

3. **Stripe Keys Not Configured**
   ```json
   {
     "error": "Stripe keys not configured",
     "message": "No Stripe secret key found for this user. Please configure your Stripe keys first."
   }
   ```

4. **Validation Errors**
   ```json
   {
     "error": "Missing required fields",
     "required": ["account_id", "individual_first_name"]
   }
   ```

5. **Stripe API Errors**
   ```json
   {
     "error": "Failed to onboard merchant",
     "message": "Invalid company[structure]: The value provided is not valid."
   }
   ```

## Country-Specific Onboarding

The application supports direct onboarding for multiple countries. Each country has specific field requirements handled by dedicated handlers in `server/routes/handlers/`.

### Supported Countries

- **US** - United States (`USA.js`) - Default handler
- **GB/UK** - United Kingdom (`UK.js`) - Accepts both GB and UK country codes
- **JP** - Japan (`Japan.js`)
- **FR** - France (`France.js`)
- **GR** - Greece (`Greece.js`)
- **CY** - Cyprus (`Cyprus.js`)
- **SE** - Sweden (`Sweden.js`)

### Country-Specific Requirements

Each country handler validates and processes fields according to Stripe's requirements for that country. The handler is automatically selected based on the country code from the request body in the following priority:

1. `company_address_country` (for company accounts)
2. `individual_address_country` (for individual accounts)
3. `external_account_country` (fallback)
4. Defaults to US if none provided

**Handler Location:** `server/routes/handlers/`

**Handler Selection Logic:**
- Country codes are converted to uppercase before matching
- UK accepts both "GB" and "UK" country codes
- All handlers extend a base handler class for common functionality

For detailed field requirements for each country, refer to:
- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Required Verification Information](https://docs.stripe.com/connect/required-verification-information)

## Rate Limiting

The API implements multi-tier rate limiting:

- **Global Rate Limit:** 100 requests per 15 minutes per IP
  - Applied to all routes except health check and OPTIONS requests
  - Uses standard headers for rate limit information
  
- **Write Operations Rate Limit:** 60 requests per minute per IP
  - Applied only to write operations (POST, PUT, DELETE) under `/api/stripe`
  - GET requests are exempt from this limit
  - OPTIONS requests are exempt from this limit

- **Exempt Routes:**
  - `/api/health` - Health check endpoint
  - All OPTIONS requests (preflight CORS)

**Rate Limit Headers:**
Rate limit headers are included in responses:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Remaining requests in window
- `X-RateLimit-Reset` - Time when rate limit resets

**Rate Limit Error Response:**
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Health Check

**Endpoint:** `GET /api/health`

**Description:** Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

This endpoint does not require authentication and is exempt from rate limiting.


