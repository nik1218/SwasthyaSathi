# SwasthyaSathi (Health Companion)

A comprehensive healthcare mobile application for Nepal, built with React Native and Node.js.

## Project Overview

SwasthyaSathi is a mobile-first healthcare application that helps users manage their medical records, upload and store medical documents, and leverage AI (Claude API) to analyze and extract insights from medical documents.

### Features (MVP)

- User authentication (register/login)
- User profiles with medical information
- Document upload and storage (AWS S3)
- AI-powered document analysis using Claude API
- Secure data management with PostgreSQL

## Tech Stack

### Mobile App
- **React Native** 0.73.2 - Cross-platform mobile development (iOS + Android)
- **TypeScript** - Type-safe development
- **React Navigation** - Navigation management
- **Axios** - HTTP client for API calls

### Backend API
- **Node.js** with **Express** - REST API server
- **TypeScript** - Type-safe backend development
- **PostgreSQL** - Relational database
- **AWS S3** - Document storage
- **Claude API** (Anthropic) - AI document processing
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Shared
- **TypeScript types** - Shared type definitions between mobile and backend

## Project Structure

```
SwasthyaSathi/
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── screens/       # App screens (Login, Register, Home, etc.)
│   │   ├── services/      # API service layer
│   │   ├── navigation/    # Navigation configuration
│   │   └── App.tsx        # Main app component
│   └── package.json
├── backend/               # Node.js/Express API server
│   ├── src/
│   │   ├── database/     # Database connection and migrations
│   │   ├── middleware/   # Express middleware (auth, etc.)
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utilities (logger, etc.)
│   │   ├── config.ts     # Configuration management
│   │   └── server.ts     # Server entry point
│   └── package.json
├── shared/               # Shared TypeScript types
│   ├── src/
│   │   └── types.ts
│   └── package.json
└── package.json          # Root package.json (monorepo)
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **Yarn** >= 1.22.0
- **PostgreSQL** >= 13
- **React Native development environment**:
  - For iOS: Xcode (macOS only)
  - For Android: Android Studio and Android SDK

## Getting Started

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd SwasthyaSathi

# Install all dependencies (monorepo)
yarn install

# Build shared types
yarn shared:build
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE swasthyasathi;

# Exit psql
\q
```

#### Run Migrations

```bash
# Navigate to backend directory
cd backend

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
# Then run migrations
yarn migrate
```

### 3. Configure Environment Variables

#### Backend Configuration

Edit `backend/.env` with your credentials:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swasthyasathi
DB_USER=postgres
DB_PASSWORD=your_database_password

# JWT Secret (generate a random string)
JWT_SECRET=your_very_secure_random_string_here

# AWS S3 Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=swasthyasathi-documents

# Claude API Key (get from https://console.anthropic.com/)
CLAUDE_API_KEY=sk-ant-api03-...
```

#### Mobile Configuration

Edit `mobile/src/services/api.service.ts` and update the `API_BASE_URL`:

```typescript
// For iOS Simulator
const API_BASE_URL = 'http://localhost:3000/api';

// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000/api';

// For physical device (use your computer's IP)
const API_BASE_URL = 'http://192.168.x.x:3000/api';
```

### 4. Set Up AWS S3

1. Create an AWS account at https://aws.amazon.com/
2. Create an S3 bucket for document storage
3. Create an IAM user with S3 permissions
4. Generate access keys and add them to your `.env` file

### 5. Get Claude API Key

1. Sign up at https://console.anthropic.com/
2. Create an API key
3. Add it to your `backend/.env` file

## Running the Application

### Start the Backend Server

```bash
# From the root directory
yarn backend

# Or navigate to backend directory
cd backend
yarn dev
```

The server will start at `http://localhost:3000`

### Start the Mobile App

#### iOS (macOS only)

```bash
# From the root directory
yarn mobile:ios

# Or navigate to mobile directory
cd mobile
yarn ios
```

#### Android

```bash
# From the root directory
yarn mobile:android

# Or navigate to mobile directory
cd mobile
yarn android
```

### Start Metro Bundler (if not started automatically)

```bash
# From the root directory
yarn mobile

# Or navigate to mobile directory
cd mobile
yarn start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Documents

- `POST /api/documents/upload` - Upload document (requires auth)
- `GET /api/documents/my-documents` - Get user's documents (requires auth)

### Health Check

- `GET /health` - Server health check

## Database Schema

### Users Table
- User authentication and profile information
- Fields: id, email, password_hash, full_name, date_of_birth, gender, etc.

### User Profiles Table
- Extended medical information
- Fields: blood_group, allergies, chronic_conditions, medications, etc.

### Documents Table
- Medical document metadata
- Fields: id, user_id, type, title, file_url, file_size, etc.

### Document AI Analysis Table
- AI-processed document insights
- Fields: document_id, extracted_text, summary, insights

## Development Workflow

### Type Checking

```bash
# Check types in all packages
yarn typecheck
```

### Linting

```bash
# Lint all packages
yarn lint
```

### Building

```bash
# Build backend
yarn backend:build

# Build shared types
yarn shared:build
```

### Cleaning

```bash
# Clean all build artifacts and node_modules
yarn clean
```

## Dependency Choices Explained

### Backend Dependencies

- **@anthropic-ai/sdk**: Official Claude API SDK for AI document processing
- **@aws-sdk/client-s3**: Official AWS SDK for S3 file storage
- **bcrypt**: Industry-standard password hashing for security
- **jsonwebtoken**: JWT token generation for stateless authentication
- **pg**: PostgreSQL client for database operations
- **express-validator**: Request validation middleware
- **helmet**: Security headers middleware
- **winston**: Professional logging library
- **multer**: Multipart form data handling for file uploads

### Mobile Dependencies

- **@react-navigation**: Standard navigation library for React Native
- **axios**: Promise-based HTTP client with interceptor support
- **react-native-document-picker**: Native document picker for iOS/Android
- **react-native-image-picker**: Native image picker for iOS/Android
- **@react-native-async-storage/async-storage**: Persistent key-value storage

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `brew services start postgresql` (macOS)
- Verify database credentials in `.env`
- Check if database exists: `psql -U postgres -l`

### React Native Build Issues

```bash
# iOS - Clean build
cd mobile/ios && pod install && cd ..
yarn ios --reset-cache

# Android - Clean build
cd mobile/android && ./gradlew clean && cd ..
yarn android --reset-cache
```

### Metro Bundler Issues

```bash
# Reset Metro cache
cd mobile
yarn start --reset-cache
```

### Type Errors

```bash
# Rebuild shared types
cd shared
yarn build
```

## Security Considerations

- Never commit `.env` files to version control
- Use strong JWT secrets in production
- Enable HTTPS in production
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
- Use AWS IAM roles with minimal permissions
- Regularly update dependencies for security patches

## Next Steps

After completing the MVP setup, consider implementing:

- Appointment booking system
- Doctor consultations
- Prescription management
- Health metrics tracking
- Push notifications
- Offline support
- Biometric authentication

## Support

For issues and questions:
- Review the troubleshooting section
- Check the project structure and configuration files
- Ensure all prerequisites are properly installed

## License

Proprietary - SwasthyaSathi Healthcare App

---

Built with ❤️ for the people of Nepal
