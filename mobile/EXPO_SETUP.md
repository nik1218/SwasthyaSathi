# SwasthyaSathi - Expo Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/emilylehnert/SwasthyaSathi/mobile
yarn install
```

### 2. Start Expo Development Server

```bash
npx expo start
```

This will:
- Start the Metro bundler
- Show a QR code in your terminal
- Open Expo DevTools in your browser

### 3. View on Your Phone

#### Option A: Using Expo Go App (Recommended for Testing)

1. **Download Expo Go:**
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. **Scan the QR Code:**
   - **iOS**: Open Camera app and point at the QR code
   - **Android**: Open Expo Go app and tap "Scan QR Code"

3. **Wait for the app to load** (first time may take 1-2 minutes)

4. **You should see the SwasthyaSathi app with 4 tabs:**
   - 🏠 Home (blue background)
   - 📋 Records (purple background)
   - 📸 Scanner (green background)
   - 👤 Profile (orange background)

#### Option B: Using iOS Simulator (macOS only)

```bash
npx expo start --ios
```

#### Option C: Using Android Emulator

```bash
npx expo start --android
```

## 📱 Testing the App

Once the app loads on your phone:

1. **Test Navigation:** Tap each tab at the bottom
2. **Verify Colors:** Each screen should have a different background color
3. **Check Header:** "SwasthyaSathi" should appear at the top
4. **Test Hot Reload:**
   - Edit any screen file (e.g., `src/screens/HomeTab.tsx`)
   - Change some text
   - Save the file
   - App should automatically reload with your changes

## 🔧 Available Commands

```bash
# Start development server with QR code
npx expo start

# Start and open on iOS simulator
npx expo start --ios

# Start and open on Android emulator
npx expo start --android

# Clear cache and restart
npx expo start --clear

# Type check
yarn typecheck

# Clean and reinstall
yarn clean
yarn install
```

## ❗ Troubleshooting

### Problem: "Unable to resolve module..."

**Solution:**
```bash
# Clear Metro cache
npx expo start --clear

# Or clear everything and reinstall
rm -rf node_modules
yarn install
npx expo start --clear
```

### Problem: "Can't connect to Expo server"

**Solution:**
- Make sure your phone and computer are on the **same WiFi network**
- Disable VPN if you have one running
- Try using tunnel mode: `npx expo start --tunnel`

### Problem: QR code doesn't work on iOS

**Solution:**
- iOS Camera app should detect it automatically
- If not, manually type the URL shown in terminal into Expo Go app
- Or use the "exp://" link from the terminal

### Problem: "Metro bundler failed to start"

**Solution:**
```bash
# Kill any running Metro processes
killall -9 node

# Restart
npx expo start
```

### Problem: Shared package types not found

**Solution:**
```bash
# Build the shared package first
cd /Users/emilylehnert/SwasthyaSathi/shared
yarn build

# Then restart Expo
cd /Users/emilylehnert/SwasthyaSathi/mobile
npx expo start --clear
```

### Problem: "Expo Go app won't connect"

**Solutions to try:**
1. Restart Expo server: Stop (Ctrl+C) and run `npx expo start` again
2. Restart Expo Go app on your phone
3. Use tunnel mode: `npx expo start --tunnel` (slower but more reliable)
4. Check firewall settings on your computer

### Problem: App loads but shows blank screen

**Solution:**
```bash
# Check for errors in terminal
# Usually a syntax or import error

# Reload the app
# Shake your phone and tap "Reload"
# Or press 'r' in the terminal
```

## 📂 Project Structure

```
mobile/
├── App.js                    # Entry point
├── app.json                  # Expo configuration
├── babel.config.js          # Babel configuration
├── metro.config.js          # Metro bundler config
├── package.json             # Dependencies
└── src/
    ├── App.tsx              # Main app with navigation
    └── screens/
        ├── HomeTab.tsx      # Home screen (blue)
        ├── RecordsTab.tsx   # Records screen (purple)
        ├── ScannerTab.tsx   # Scanner screen (green)
        └── ProfileTab.tsx   # Profile screen (orange)
```

## 🎨 Live Development

Expo supports hot reloading:

1. Make changes to any `.tsx` file
2. Save the file
3. App automatically updates on your phone
4. No need to manually reload!

Example: Try changing the emoji or text in `HomeTab.tsx`:
```typescript
<Text style={styles.title}>🏥 Home</Text>
```

Save and watch it update instantly on your phone!

## 🔄 Refresh Options

While the app is running, you can:
- **Press 'r' in terminal** - Reload app
- **Press 'm' in terminal** - Toggle menu
- **Shake your phone** - Open developer menu
- **Double-tap with 3 fingers** - (Android) Open developer menu

## 📊 What You Should See

### Home Tab (Blue)
- Background: Light blue (#E3F2FD)
- Icon: 🏠
- Text: "Welcome to SwasthyaSathi"

### Records Tab (Purple)
- Background: Light purple (#F3E5F5)
- Icon: 📋
- Text: "Medical Records"

### Scanner Tab (Green)
- Background: Light green (#E8F5E9)
- Icon: 📸
- Text: "Document Scanner"

### Profile Tab (Orange)
- Background: Light orange (#FFF3E0)
- Icon: 👤
- Text: "User Profile"

## 🌐 Network Requirements

**Important:** Your phone and computer MUST be on the same WiFi network!

If you're having connection issues:
1. Check both devices are on the same WiFi
2. Disable any VPN
3. Use tunnel mode as a fallback:
   ```bash
   npx expo start --tunnel
   ```

## ✅ Success Checklist

- [ ] Ran `yarn install` successfully
- [ ] Started server with `npx expo start`
- [ ] See QR code in terminal
- [ ] Scanned QR code with Expo Go app
- [ ] App loaded on phone
- [ ] Can see all 4 tabs
- [ ] Can switch between tabs
- [ ] Each tab has different color
- [ ] Header shows "SwasthyaSathi"

## 🎉 Next Steps

Once you verify everything works:
1. Start building out the real UI for each screen
2. Connect to the backend API
3. Add authentication flow
4. Implement document upload
5. Add Claude AI integration

## 📞 Need Help?

Common terminal output you should see:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

If you see this, you're good to go! 🚀
