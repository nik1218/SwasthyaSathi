# SwasthyaSathi - Quick Start Guide

Get SwasthyaSathi running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (should be >= 18)
node --version

# Check Yarn
yarn --version

# Check PostgreSQL
psql --version
```

## Setup Steps

### 1. Install Dependencies

```bash
cd SwasthyaSathi
yarn install
yarn shared:build
```

### 2. Setup Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE swasthyasathi;"

# Setup environment
cd backend
cp .env.example .env

# Edit backend/.env with your database password
# Then run migrations
yarn migrate
```

### 3. Configure Services

**Required Environment Variables in `backend/.env`:**

```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=any_random_string_here
CLAUDE_API_KEY=your_claude_api_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET_NAME=your_bucket_name
```

**Get your API keys:**
- Claude API: https://console.anthropic.com/
- AWS S3: https://aws.amazon.com/s3/

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd SwasthyaSathi
yarn backend
```

**Terminal 2 - Mobile:**
```bash
cd SwasthyaSathi
yarn mobile:ios    # For iOS
# or
yarn mobile:android  # For Android
```

## Testing the App

1. Server should be running at `http://localhost:3000`
2. Test health endpoint: `curl http://localhost:3000/health`
3. Open the mobile app in simulator/emulator
4. Register a new account
5. Upload a test document
6. View your documents

## Common Commands

```bash
# Root directory commands
yarn backend          # Start backend server
yarn mobile          # Start Metro bundler
yarn mobile:ios      # Run iOS app
yarn mobile:android  # Run Android app
yarn typecheck       # Type check all packages
yarn clean          # Clean all builds

# Backend commands
cd backend
yarn dev            # Start with hot reload
yarn build          # Build for production
yarn migrate        # Run database migrations

# Mobile commands
cd mobile
yarn ios            # Run on iOS
yarn android        # Run on Android
yarn start          # Start Metro bundler
```

## Project Structure Overview

```
SwasthyaSathi/
├── mobile/         # React Native app
├── backend/        # Express API server
├── shared/         # Shared TypeScript types
└── README.md       # Full documentation
```

## API Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/my-documents` - Get documents

## Troubleshooting

**Database connection error?**
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

**Metro bundler issues?**
```bash
cd mobile
yarn start --reset-cache
```

**iOS build fails?**
```bash
cd mobile/ios
pod install
cd ..
yarn ios
```

**Android build fails?**
```bash
cd mobile/android
./gradlew clean
cd ..
yarn android
```

## Need Help?

Check the full README.md for detailed documentation and troubleshooting.

Happy coding! 🚀
