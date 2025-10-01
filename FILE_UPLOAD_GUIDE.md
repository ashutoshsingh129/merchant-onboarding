# Identity Document Upload Feature

This guide explains how to use the identity document upload feature for merchant onboarding.

## Overview

The file upload feature allows merchants to upload identity verification documents (driver's license, passport, etc.) as part of the direct onboarding process. Documents are uploaded to Stripe's file API and automatically attached to the appropriate account or person.

## How It Works

### For Individual Accounts (US)
1. User fills out the individual onboarding form
2. User can optionally upload 1 or 2 identity documents (front and back)
3. Files are uploaded to Stripe with `purpose: identity_document`
4. Upon form submission, file IDs are attached to `individual[verification][document][front]` and `individual[verification][document][back]`

### For Company Accounts (US)
1. User fills out company information and representative details
2. User can optionally upload 1 or 2 identity documents for the representative
3. Files are uploaded to Stripe with `purpose: identity_document`
4. Upon form submission, file IDs are attached to the representative person's `verification.document.front` and `verification.document.back`

## Technical Implementation

### Backend API

#### Upload Document Endpoint
```
POST /api/stripe/upload-document
Content-Type: multipart/form-data

Body:
- file: File (image or PDF)
- purpose: string (default: "identity_document")

Response:
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
    "created": 1234567890
  }
}
```

#### Direct Onboard Endpoint (Updated)
```
POST /api/stripe/direct-onboard

Additional Body Parameters:
- individual_verification_document_front: string (file ID)
- individual_verification_document_back: string (file ID)
- representative_verification_document_front: string (file ID)
- representative_verification_document_back: string (file ID)
```

### Frontend Implementation

#### File Upload UI
- Upload buttons are displayed in the form based on business type
- Buttons show upload status: "Upload", "Uploading...", or "Uploaded: filename"
- Green checkmark icon appears when file is successfully uploaded
- Accepts image files (PNG, JPG, etc.) and PDF files

#### Upload Process
1. User selects a file via the upload button
2. File is immediately uploaded to Stripe via the upload API
3. Returned file ID is stored in form state
4. File ID is included when form is submitted

## Usage Example

### Individual Account

```typescript
// 1. Upload identity document
const file = new File([...], "id_front.png");
const response = await uploadDocument(file, "identity_document");
// Returns: { success: true, file_id: "file_xxx" }

// 2. Submit onboarding form with file ID
await directOnboardMerchant({
  account_id: "acct_xxx",
  individual_first_name: "John",
  individual_last_name: "Doe",
  // ... other fields
  individual_verification_document_front: "file_xxx"
});
```

### Company Account

```typescript
// 1. Upload representative's identity document
const file = new File([...], "rep_id_front.png");
const response = await uploadDocument(file, "identity_document");

// 2. Submit onboarding form with file ID
await directOnboardMerchant({
  account_id: "acct_xxx",
  business_type: "company",
  company_name: "ABC Corp",
  representative_first_name: "Jane",
  representative_last_name: "Smith",
  // ... other fields
  representative_verification_document_front: "file_xxx"
});
```

## Supported File Types

- Images: PNG, JPG, JPEG, GIF
- Documents: PDF

## File Size Limits

Stripe has the following limits for identity document uploads:
- Maximum file size: 10 MB
- Supported formats: PNG, JPG, PDF

## Security

- Files are temporarily stored on the server during upload
- Files are immediately uploaded to Stripe's secure storage
- Temporary files are automatically deleted after upload
- File IDs are used instead of raw file data in API requests

## Error Handling

- If file upload fails, an error message is displayed
- User can retry file upload without losing form data
- Files are optional - form can be submitted without documents
- Invalid file types are rejected by the browser's file picker

## Testing

To test the file upload feature:

1. Start the backend server: `cd server && npm run dev`
2. Start the frontend: `cd client && npm start`
3. Navigate to the direct onboarding form
4. Fill out the form and click an upload button
5. Select an image or PDF file
6. Wait for "Uploaded: filename" confirmation
7. Submit the form

The uploaded file ID will be included in the account update request to Stripe.

