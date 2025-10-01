# Complete Document Upload Integration - Stripe Verification

## ✅ All Document Upload Features Implemented

This document provides a comprehensive overview of **ALL** document upload capabilities integrated into the merchant onboarding form based on Stripe's official documentation.

---

## 📋 Document Types Supported

### **Individual Accounts (US)**

#### 1. Identity Document (ID)
- **Purpose**: Proof of identity
- **Fields**: 
  - `individual[verification][document][front]`
  - `individual[verification][document][back]`
- **Accepted Documents**: Driver's license, passport, national ID card

#### 2. Additional Document (Address Proof)
- **Purpose**: Proof of residential address
- **Fields**: 
  - `individual[verification][additional_document][front]`
  - `individual[verification][additional_document][back]`
- **Accepted Documents**: Utility bill, bank statement, official government correspondence

---

### **Company Accounts (US)**

#### 1. Company Verification Document
- **Purpose**: Proof of legal entity
- **Fields**: 
  - `company[verification][document][front]`
  - `company[verification][document][back]`
- **Accepted Documents**: IRS Letter 147C, SS-4 confirmation letter, EIN Assistance Letter

#### 2. Representative Identity Document (ID)
- **Purpose**: Proof of representative's identity
- **Fields**: 
  - `person[verification][document][front]`
  - `person[verification][document][back]`
- **Accepted Documents**: Driver's license, passport, national ID card

#### 3. Representative Additional Document (Address Proof)
- **Purpose**: Proof of representative's residential address
- **Fields**: 
  - `person[verification][additional_document][front]`
  - `person[verification][additional_document][back]`
- **Accepted Documents**: Utility bill, bank statement, official correspondence

#### 4. Owner/Beneficial Owner Identity Document (ID)
- **Purpose**: Proof of owner's identity (for owners with 25%+ ownership)
- **Fields**: 
  - `person[verification][document][front]`
  - `person[verification][document][back]`
- **Accepted Documents**: Driver's license, passport, national ID card

#### 5. Owner Additional Document (Address Proof)
- **Purpose**: Proof of owner's residential address
- **Fields**: 
  - `person[verification][additional_document][front]`
  - `person[verification][additional_document][back]`
- **Accepted Documents**: Utility bill, bank statement, official correspondence

---

## 🎯 Implementation Summary

### Backend (Server)

**New Endpoint**: `POST /api/stripe/upload-document`
- Accepts multipart/form-data file uploads
- Uploads directly to Stripe's File API
- Returns file ID for use in account/person creation
- Automatically cleans up temporary files

**Enhanced Endpoint**: `POST /api/stripe/direct-onboard`

**New Parameters Accepted**:
```javascript
// Individual verification
individual_verification_document_front
individual_verification_document_back
individual_verification_additional_document_front
individual_verification_additional_document_back

// Company verification
company_verification_document_front
company_verification_document_back

// Representative verification
representative_verification_document_front
representative_verification_document_back
representative_verification_additional_document_front
representative_verification_additional_document_back

// Owner verification
owner_verification_document_front
owner_verification_document_back
owner_verification_additional_document_front
owner_verification_additional_document_back
```

---

### Frontend (Client)

#### Upload UI Components Added:

**Individual Account Form**:
- ✅ ID Document Upload (Front/Back) - 2 buttons
- ✅ Address Proof Upload (Front/Back) - 2 buttons

**Company Account Form**:
- ✅ Company Document Upload (Front/Back) - 2 buttons
- ✅ Representative ID Upload (Front/Back) - 2 buttons
- ✅ Representative Address Proof Upload (Front/Back) - 2 buttons
- ✅ Owner ID Upload (Front/Back) - 2 buttons (when owner is separate)
- ✅ Owner Address Proof Upload (Front/Back) - 2 buttons (when owner is separate)

#### Total Upload Buttons:
- **Individual**: 4 upload buttons
- **Company (Representative is Owner)**: 8 upload buttons
- **Company (Separate Owner)**: 12 upload buttons

---

## 📊 Complete Feature Matrix

| Account Type | Person Type | Document Type | Front | Back | Status |
|-------------|-------------|---------------|-------|------|--------|
| Individual | Self | Identity Document | ✅ | ✅ | Implemented |
| Individual | Self | Additional Document | ✅ | ✅ | Implemented |
| Company | Company | Verification Document | ✅ | ✅ | Implemented |
| Company | Representative | Identity Document | ✅ | ✅ | Implemented |
| Company | Representative | Additional Document | ✅ | ✅ | Implemented |
| Company | Owner | Identity Document | ✅ | ✅ | Implemented |
| Company | Owner | Additional Document | ✅ | ✅ | Implemented |

---

## 🔧 Technical Details

### File Upload Process

1. **User selects file** via upload button
2. **File is immediately uploaded** to Stripe via `/upload-document` endpoint
3. **Stripe returns file ID** (e.g., `file_1SD2oaGRPKTxZdwraM51LBbV`)
4. **File ID is stored** in form state
5. **Upon form submission**, file IDs are included in the direct-onboard request
6. **Backend attaches file IDs** to appropriate Stripe API fields

### File Requirements

- **Accepted Formats**: PNG, JPG, JPEG, GIF, PDF
- **Maximum Size**: 10 MB (Stripe limit)
- **Quality**: Clear, legible, in color
- **Screenshots**: Not acceptable
- **All uploads are optional** - form works with or without documents

---

## 📁 Files Modified

### Backend
- ✅ `server/routes/stripe.js` - Added upload endpoint + document handling
- ✅ `server/server.js` - Increased body size limits
- ✅ `server/package.json` - Added multer dependency
- ✅ `server/.gitignore` - Added uploads directory
- ✅ `server/uploads/` - Created with .gitignore

### Frontend
- ✅ `client/src/services/stripeApi.ts` - Added uploadDocument() + 14 new field types
- ✅ `client/src/components/DirectOnboardForm/DirectOnboardForm.tsx` - Added all upload UI
  - 4 upload sections for individual
  - 8 upload sections for company (when rep is owner)
  - 12 upload sections for company (with separate owner)

---

## 🎨 UI/UX Features

### Upload Button States
- **Default**: Cloud icon + "Upload [Document Type]"
- **Uploading**: "Uploading..." with disabled state
- **Uploaded**: Green checkmark + "Uploaded: filename.png"

### Visual Feedback
- ✅ Green checkmark icon when upload succeeds
- ✅ Filename display after successful upload
- ✅ Loading state during upload
- ✅ Error messages if upload fails
- ✅ Disabled state prevents duplicate uploads

### User Experience
- All uploads are clearly labeled
- Optional uploads marked as "(Optional)"
- Helper text explains what documents are needed
- Front/Back buttons grouped together
- Responsive design works on all screen sizes

---

## 🚀 Testing Guide

### Individual Account Test
```bash
1. Start servers (backend + frontend)
2. Create individual account
3. Open Direct Onboard form
4. Scroll to "Identity Verification (Optional)"
5. Upload ID (front + back)
6. Upload Address Proof (front + back)
7. Submit form
8. Verify in Stripe Dashboard
```

### Company Account Test
```bash
1. Start servers (backend + frontend)
2. Create company account
3. Open Direct Onboard form
4. Fill company information
5. Upload Company Document (2 files)
6. Fill representative information
7. Upload Representative ID (2 files)
8. Upload Representative Address Proof (2 files)
9. If separate owner:
   - Fill owner information
   - Upload Owner ID (2 files)
   - Upload Owner Address Proof (2 files)
10. Submit form
11. Verify in Stripe Dashboard
```

---

## 📖 Stripe Documentation References

- [Required Verification Information](https://docs.stripe.com/connect/required-verification-information)
- [Acceptable Verification Documents](https://docs.stripe.com/acceptable-verification-documents?country=US&document-type=entity)
- [File Upload API](https://docs.stripe.com/api/files)
- [Account Update API](https://docs.stripe.com/api/accounts/update)
- [Person API](https://docs.stripe.com/api/persons)

---

## 🎯 Compliance Checklist

- ✅ Individual identity verification documents
- ✅ Individual address verification documents
- ✅ Company legal entity documents
- ✅ Representative identity documents
- ✅ Representative address documents
- ✅ Owner/beneficial owner identity documents
- ✅ Owner/beneficial owner address documents
- ✅ Proper file format validation
- ✅ File size limits enforced
- ✅ Secure file handling (temp files deleted)
- ✅ File IDs properly attached to Stripe objects

---

## 💡 Key Features

1. **Complete Coverage**: All document types required by Stripe are supported
2. **Flexible**: Works for both individual and company accounts
3. **User-Friendly**: Clear labels and visual feedback
4. **Secure**: Files uploaded directly to Stripe's secure storage
5. **Optional**: Form works with or without document uploads
6. **Validated**: Only accepts approved file formats
7. **Efficient**: Temporary files automatically cleaned up
8. **Integrated**: No separate API calls needed - all handled in one submission

---

## 🎉 Status: COMPLETE

All document upload features required by Stripe for both individual and company account verification have been successfully implemented and integrated into the direct onboarding form.

