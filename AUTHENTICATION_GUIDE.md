# SwasthyaSathi - Authentication System Guide

## 🔐 Overview

The SwasthyaSathi app uses **phone number-based authentication** with JWT tokens for secure user management.

### Key Features
- ✅ Phone number login (+977 Nepal prefix)
- ✅ Password with moderate strength requirements
- ✅ JWT tokens (7-day expiration)
- ✅ Secure password hashing with bcrypt
- ✅ PostgreSQL database storage
- ✅ React Native mobile screens
- ✅ Express.js backend API

### Authentication Flow
1. User registers with phone number + password
2. Backend validates input and hashes password
3. User data stored in PostgreSQL
4. JWT token generated and returned
5. Token stored securely on device
6. Token included in subsequent API requests

## 📱 Mobile Screens

### Registration Screen
**Location**: `mobile/src/screens/auth/RegisterScreen.tsx`

**Features**:
- Phone number input with auto +977 prefix
- Password input with show/hide toggle
- Confirm password field
- Form validation
- Link to login screen

**Validation**:
- Full name required
- Phone: +977XXXXXXXXXX format
- Password: min 8 chars, at least 1 number
- Passwords must match

**Usage Example**:
```typescript
<RegisterScreen
  onRegisterSuccess={() => {/* Navigate to home */}}
  onNavigateToLogin={() => {/* Navigate to login */}}
/>
```

### Login Screen
**Location**: `mobile/src/screens/auth/LoginScreen.tsx`

**Features**:
- Phone number input with auto +977 prefix
- Password input with show/hide toggle
- Forgot password link (placeholder)
- Link to registration screen

**Validation**:
- Phone: +977XXXXXXXXXX format
- Password required

**Usage Example**:
```typescript
<LoginScreen
  onLoginSuccess={() => {/* Navigate to home */}}
  onNavigateToRegister={() => {/* Navigate to register */}}
/>
```

## 🔧 Backend API

### Registration Endpoint

**POST** `/api/auth/register`

**Request Body**:
```json
{
  "phoneNumber": "+9779812345678",
  "password": "Password123",
  "fullName": "John Doe"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phoneNumber": "+9779812345678",
      "fullName": "John Doe",
      "email": "",
      "country": "Nepal",
      "createdAt": "2026-01-12T...",
      "updatedAt": "2026-01-12T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:

**400 - Weak Password**:
```json
{
  "success": false,
  "error": {
    "code": "WEAK_PASSWORD",
    "message": "Password must be at least 8 characters long"
  }
}
```

**400 - Invalid Phone**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Phone number must be in format +977XXXXXXXXXX (Nepal)"
  }
}
```

**409 - Duplicate Phone**:
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_PHONE",
    "message": "Phone number already registered"
  }
}
```

### Login Endpoint

**POST** `/api/auth/login`

**Request Body**:
```json
{
  "phoneNumber": "+9779812345678",
  "password": "Password123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phoneNumber": "+9779812345678",
      "fullName": "John Doe",
      "...": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid phone number or password"
  }
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Nepal',
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_number);
```

**Key Points**:
- `phone_number` is UNIQUE and indexed
- `password_hash` stores bcrypt hashed passwords
- `full_name` is required at registration
- Other fields are optional

## 🔑 Password Requirements

### Moderate Strength (Current)
- Minimum 8 characters
- At least 1 number
- Case insensitive

### Examples
- ✅ `Password1` - Valid
- ✅ `mypass123` - Valid
- ✅ `Secure2026` - Valid
- ❌ `short1` - Too short (< 8 chars)
- ❌ `noNumbers` - No number
- ❌ `12345678` - No letters (optional, but weak)

## 🔐 Security Features

### Password Hashing
- **Algorithm**: bcrypt
- **Salt Rounds**: 10
- **Location**: `backend/src/services/auth.service.ts`

```typescript
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
```

### JWT Tokens
- **Algorithm**: HS256
- **Expiration**: 7 days
- **Secret**: Configured in `.env`
- **Payload**: `{ userId: string }`

```typescript
const token = jwt.sign({ userId }, config.jwt.secret, {
  expiresIn: '7d',
});
```

### Token Storage (Mobile)
- **Storage**: AsyncStorage (encrypted on device)
- **Key**: `@swasthyasathi_token`
- **Auto-included**: All authenticated API requests

### Phone Number Validation
- **Format**: `+977XXXXXXXXXX` (13 characters)
- **Nepal Prefix**: Automatically added if missing
- **Validation Regex**: `^\+977\d{10}$`

## 🚀 Setup Instructions

### 1. Backend Setup

**Install Dependencies**:
```bash
cd backend
npm install
```

**Configure Environment**:
Create `backend/.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swasthyasathi
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-very-secure-random-secret-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

**Run Database Migration**:
```bash
npm run migrate
```

**Start Backend**:
```bash
npm run dev
```

Server runs at `http://localhost:3000`

### 2. Mobile Setup

**Install Dependencies**:
```bash
cd mobile
npm install
```

**Update API Base URL**:
Edit `mobile/src/services/api.service.ts`:
```typescript
// For iOS Simulator
const API_BASE_URL = 'http://localhost:3000/api';

// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000/api';

// For Physical Device (use your computer's IP)
const API_BASE_URL = 'http://192.168.x.x:3000/api';
```

**Start Expo**:
```bash
npx expo start
```

## 🧪 Testing the Authentication

### Test Registration

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+9779812345678",
    "password": "TestPassword123",
    "fullName": "Test User"
  }'
```

### Test Login

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+9779812345678",
    "password": "TestPassword123"
  }'
```

### Test Authenticated Request

```bash
curl -X GET http://localhost:3000/api/documents/my-documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 📦 Files Modified/Created

### Backend
- ✅ `shared/src/types.ts` - Updated auth types
- ✅ `backend/src/database/schema.sql` - Phone-based schema
- ✅ `backend/src/services/auth.service.ts` - Phone auth logic
- ✅ `backend/src/routes/auth.routes.ts` - Phone validation

### Mobile
- ✅ `mobile/src/screens/auth/LoginScreen.tsx` - New login screen
- ✅ `mobile/src/screens/auth/RegisterScreen.tsx` - New register screen
- ✅ `mobile/src/services/api.service.ts` - Updated for phone auth
- ✅ `mobile/src/App.tsx` - Added auth flow

## 🎯 Usage in Mobile App

### Check if Authenticated
```typescript
import apiService from './services/api.service';

const isLoggedIn = await apiService.isAuthenticated();
```

### Register New User
```typescript
try {
  const result = await apiService.register({
    phoneNumber: '+9779812345678',
    password: 'Password123',
    fullName: 'John Doe',
  });

  console.log('User registered:', result.user);
  console.log('Token:', result.token);
} catch (error) {
  console.error('Registration failed:', error);
}
```

### Login User
```typescript
try {
  const result = await apiService.login({
    phoneNumber: '+9779812345678',
    password: 'Password123',
  });

  console.log('Login successful:', result.user);
} catch (error) {
  console.error('Login failed:', error);
}
```

### Logout User
```typescript
await apiService.logout();
```

## 🔄 Authentication State Flow

```
App Launch
    ↓
Check for Token
    ↓
┌───────────────┬───────────────┐
│  Token Found  │  No Token     │
│               │               │
↓               ↓               │
Validate Token  Show Login      │
    │           Screen          │
    │               │           │
┌───┴───┐           │           │
│ Valid │ Invalid   │           │
│       │           │           │
↓       ↓           ↓           │
Show    Clear       Register/   │
Main    Token       Login       │
Tabs    ↓           ↓           │
        Show Login  Success     │
        Screen      ↓           │
                    Show Main   │
                    Tabs        │
└───────────────────────────────┘
```

## ⚠️ Important Notes

### Security
1. **Never commit** `.env` files
2. **Change JWT_SECRET** in production
3. **Use HTTPS** in production
4. **Implement rate limiting** for login attempts
5. **Add CAPTCHA** for production (optional)

### Phone Numbers
1. Format is **strictly enforced**: `+977XXXXXXXXXX`
2. Must be **10 digits** after +977
3. Auto-formatting helps users
4. No spaces or dashes in storage

### Tokens
1. Tokens expire after **7 days**
2. Stored in **AsyncStorage** (device)
3. Auto-removed on **401 errors**
4. Re-login required after expiration

### Database
1. Run migrations before first use
2. Phone numbers are **unique**
3. Passwords are **always hashed**
4. Never store plain text passwords

## 🚧 Future Enhancements

### Phase 2 (Future)
- [ ] OTP verification for phone numbers
- [ ] Password reset via SMS
- [ ] Biometric authentication (fingerprint/face)
- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication (2FA)
- [ ] Session management
- [ ] Device tracking
- [ ] Login history

### Phase 3 (Future)
- [ ] Email verification (optional)
- [ ] Phone number change workflow
- [ ] Account deletion
- [ ] Privacy settings
- [ ] Security audit logs

## 📞 Support

For issues with authentication:
1. Check backend logs in `backend/logs/`
2. Verify database connection
3. Ensure migrations ran successfully
4. Check JWT_SECRET is set
5. Verify phone number format

## ✅ Checklist

Before deploying authentication:

- [ ] Database migrations completed
- [ ] `.env` file configured
- [ ] JWT_SECRET is secure and random
- [ ] Backend server running
- [ ] Mobile app can reach backend
- [ ] Registration works
- [ ] Login works
- [ ] Token persistence works
- [ ] Logout works
- [ ] Protected routes require auth
- [ ] Error handling is user-friendly

---

**Authentication System Complete!** 🎉

You now have a fully functional phone-based authentication system ready for SwasthyaSathi!
