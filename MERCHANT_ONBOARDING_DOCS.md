# Merchant Onboarding API Documentation

This document provides comprehensive information about the merchant onboarding process, including field requirements for individual and company profiles, API endpoints, and request/response formats.

## Table of Contents

1. [Individual Profile Fields](#individual-profile-fields)
2. [Company Profile Fields](#company-profile-fields)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Handling](#error-handling)

---

## Individual Profile Fields

When `business_type` is set to `"individual"`, the following fields are required:

### Personal Information
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `individual_first_name` | string | Yes | First name of the individual | "John" |
| `individual_last_name` | string | Yes | Last name of the individual | "Doe" |
| `individual_email` | string | Yes | Email address | "john.doe@example.com" |
| `individual_phone` | string | Yes | Phone number | "+15551234567" |
| `individual_dob_day` | number | Yes | Day of birth (1-31) | 15 |
| `individual_dob_month` | number | Yes | Month of birth (1-12) | 6 |
| `individual_dob_year` | number | Yes | Year of birth | 1990 |

### Address Information
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `individual_address_line1` | string | Yes | Street address | "123 Main Street" |
| `individual_address_line2` | string | No | Apartment, suite, unit | "Apt 4B" |
| `individual_address_city` | string | Yes | City | "New York" |
| `individual_address_state` | string | Yes | State/Province | "NY" |
| `individual_address_postal_code` | string | Yes | ZIP/Postal code | "10001" |
| `individual_address_country` | string | Yes | Country code (ISO 2-letter) | "US" |

### Business Information
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `business_type` | string | Yes | Type of business | "individual" |
| `business_profile_mcc` | string | Yes | Merchant Category Code | "5734" |
| `business_profile_url` | string | No | Business website URL | "https://example.com" |

---

## Company Profile Fields

When `business_type` is set to `"company"`, the following fields are required:

### Company Information
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `company_name` | string | Yes | Legal company name | "ABC Technologies LLC" |
| `company_tax_id` | string | Yes | Tax ID/EIN | "12-3456789" |
| `company_structure` | string | Yes | Legal structure | "private_corporation" |

### Company Address
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `company_address_line1` | string | Yes | Street address | "123 Main St" |
| `company_address_city` | string | Yes | City | "New York" |
| `company_address_state` | string | Yes | State/Province | "NY" |
| `company_address_postal_code` | string | Yes | ZIP/Postal code | "10001" |
| `company_address_country` | string | Yes | Country code (ISO 2-letter) | "US" |

### Representative Person Information
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `representative_first_name` | string | Yes | First name of representative | "Jane" |
| `representative_last_name` | string | Yes | Last name of representative | "Smith" |
| `representative_email` | string | Yes | Email address | "jane.smith@company.com" |
| `representative_dob_day` | number | Yes | Day of birth (1-31) | 10 |
| `representative_dob_month` | number | Yes | Month of birth (1-12) | 3 |
| `representative_dob_year` | number | Yes | Year of birth | 1985 |
| `representative_relationship_title` | string | Yes | Job title | "CEO" |

### Representative Address
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `representative_address_line1` | string | Yes | Street address | "456 Business Ave" |
| `representative_address_city` | string | Yes | City | "New York" |
| `representative_address_state` | string | Yes | State/Province | "NY" |
| `representative_address_postal_code` | string | Yes | ZIP/Postal code | "10002" |
| `representative_address_country` | string | Yes | Country code (ISO 2-letter) | "US" |

### Valid Company Structure Values
| Value | Description |
|-------|-------------|
| `government_instrumentality` | Government Instrumentality |
| `governmental_unit` | Governmental Unit |
| `incorporated_non_profit` | Incorporated Non-profit |
| `multi_member_llc` | Multi-member LLC |
| `private_corporation` | Private Corporation |
| `private_partnership` | Private Partnership |
| `public_corporation` | Public Corporation |
| `public_partnership` | Public Partnership |
| `tax_exempt_government_instrumentality` | Tax Exempt Government Instrumentality |
| `unincorporated_association` | Unincorporated Association |
| `unincorporated_non_profit` | Unincorporated Non-profit |

---

## Common Fields (Both Individual and Company)

### Terms of Service Acceptance
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `tos_acceptance_date` | number | Yes | Unix timestamp of ToS acceptance | 1691234567 |
| `tos_acceptance_ip` | string | No | IP address of user accepting ToS | "203.0.113.1" |

### External Account (Bank Account)
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `external_account_object` | string | Yes | Type of external account | "bank_account" |
| `external_account_country` | string | Yes | Country code (ISO 2-letter) | "US" |
| `external_account_currency` | string | Yes | Currency code (ISO 3-letter) | "usd" |
| `external_account_account_number` | string | Yes | Bank account number or IBAN | "1234567890" |

### Account Information
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `account_id` | string | Yes | Stripe account ID | "acct_1SAA85KHetaYuagI" |

---

## API Endpoints

### 1. Create Stripe Account

**Endpoint:** `POST /api/stripe/create-account`

**Description:** Creates a new Stripe account for merchant onboarding.

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

**Response:**
```json
{
  "success": true,
  "account_id": "acct_1SAA85KHetaYuagI",
  "account": {
    "id": "acct_1SAA85KHetaYuagI",
    "email": "merchant@example.com",
    "country": "US",
    "type": "custom",
    "business_type": "individual",
    "created": 1691234567
  }
}
```

### 2. Direct Merchant Onboarding

**Endpoint:** `POST /api/stripe/direct-onboard`

**Description:** Completes merchant onboarding with all required information.

**Request Body (Individual):**
```json
{
  "account_id": "acct_1SAA85KHetaYuagI",
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
  "business_type": "individual",
  "business_profile_mcc": "5734",
  "business_profile_url": "https://example.com",
  "tos_acceptance_date": 1691234567,
  "tos_acceptance_ip": "203.0.113.1",
  "external_account_object": "bank_account",
  "external_account_country": "US",
  "external_account_currency": "usd",
  "external_account_account_number": "1234567890"
}
```

**Request Body (Company):**
```json
{
  "account_id": "acct_1SAA85KHetaYuagI",
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
  "business_profile_url": "https://company.com",
  "tos_acceptance_date": 1691234567,
  "tos_acceptance_ip": "203.0.113.1",
  "external_account_object": "bank_account",
  "external_account_country": "US",
  "external_account_currency": "usd",
  "external_account_account_number": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "acct_1SAA85KHetaYuagI",
    "email": "merchant@example.com",
    "country": "US",
    "type": "custom",
    "business_type": "individual",
    "individual": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com"
    },
    "charges_enabled": true,
    "payouts_enabled": true,
    "details_submitted": true,
    "created": 1691234567
  },
  "external_account": {
    "id": "ba_1SAA85KHetaYuagI",
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

### 3. Create External Account

**Endpoint:** `POST /api/stripe/create-external-account`

**Description:** Creates an external bank account for an existing Stripe account.

**Request Body:**
```json
{
  "account_id": "acct_1SAA85KHetaYuagI",
  "object": "bank_account",
  "country": "NL",
  "currency": "eur",
  "account_number": "NL91ABNA0417164300",
  "default_for_currency": true
}
```

**Response:**
```json
{
  "success": true,
  "external_account": {
    "id": "ba_1SAA85KHetaYuagI",
    "object": "bank_account",
    "country": "NL",
    "currency": "eur",
    "last4": "4300",
    "bank_name": "ABN AMRO BANK",
    "default_for_currency": true,
    "created": 1691234567
  }
}
```

### 4. Get Account Information

**Endpoint:** `GET /api/stripe/account/:account_id`

**Description:** Retrieves information about a Stripe account.

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "acct_1SAA85KHetaYuagI",
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

### 5. Create Account Link

**Endpoint:** `POST /api/stripe/create-account-link`

**Description:** Creates an account link for Stripe-hosted onboarding.

**Request Body:**
```json
{
  "account_id": "acct_1SAA85KHetaYuagI",
  "refresh_url": "https://localhost:3000/reauth",
  "return_url": "https://localhost:3000/return"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://connect.stripe.com/setup/c/acct_1SAA85KHetaYuagI/abc123",
  "expires_at": 1691234567
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "error": "Missing required fields",
  "required": ["account_id", "individual_first_name", "individual_last_name"]
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to onboard merchant",
  "message": "Invalid company[structure]: The value provided is not valid."
}
```

### Validation Rules

1. **Required Fields:** All marked as "Yes" in the field tables must be provided
2. **Date Validation:** DOB fields must be valid dates
3. **Email Validation:** Email addresses must be in valid format
4. **Phone Validation:** Phone numbers should include country code
5. **Country Codes:** Must be valid ISO 2-letter country codes
6. **Currency Codes:** Must be valid ISO 3-letter currency codes
7. **Company Structure:** Must be one of the valid values listed above

---

## Usage Examples

### Frontend Integration

```typescript
import { directOnboardMerchant } from '../services/stripeApi';

const formData = {
  account_id: 'acct_1SAA85KHetaYuagI',
  individual_first_name: 'John',
  individual_last_name: 'Doe',
  // ... other required fields
};

try {
  const response = await directOnboardMerchant(formData);
  if (response.success) {
    console.log('Merchant onboarded successfully:', response.account);
  }
} catch (error) {
  console.error('Onboarding failed:', error.message);
}
```

### cURL Examples

**Create Account:**
```bash
curl -X POST http://localhost:5000/api/stripe/create-account \
  -H "Content-Type: application/json" \
  -d '{
    "type": "custom",
    "country": "US",
    "email": "merchant@example.com",
    "business_type": "individual"
  }'
```

**Direct Onboarding:**
```bash
curl -X POST http://localhost:5000/api/stripe/direct-onboard \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "acct_1SAA85KHetaYuagI",
    "individual_first_name": "John",
    "individual_last_name": "Doe",
    "individual_email": "john.doe@example.com",
    "individual_phone": "+15551234567",
    "individual_dob_day": 15,
    "individual_dob_month": 6,
    "individual_dob_year": 1990,
    "individual_address_line1": "123 Main Street",
    "individual_address_city": "New York",
    "individual_address_state": "NY",
    "individual_address_postal_code": "10001",
    "individual_address_country": "US",
    "business_type": "individual",
    "business_profile_mcc": "5734",
    "tos_acceptance_date": 1691234567,
    "external_account_object": "bank_account",
    "external_account_country": "US",
    "external_account_currency": "usd",
    "external_account_account_number": "1234567890"
  }'
```

---

## Notes

- All timestamps are Unix timestamps (seconds since epoch)
- Country codes should be ISO 3166-1 alpha-2 (2-letter codes)
- Currency codes should be ISO 4217 (3-letter codes)
- Phone numbers should include country code with + prefix
- External account creation is optional but recommended for payouts
- Company structure values must match Stripe's current valid options
- ToS acceptance date is automatically set to current timestamp if not provided
