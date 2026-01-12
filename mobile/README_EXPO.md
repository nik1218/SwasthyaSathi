# SwasthyaSathi Mobile - Expo Version

## 🎉 What's New

Your React Native app has been converted to use Expo! You can now:
- View the app on your phone instantly using Expo Go
- See live updates when you change code
- Test on both iOS and Android without simulators
- No need for Xcode or Android Studio for development

## 🚀 Super Quick Start

```bash
# 1. Go to mobile directory
cd /Users/emilylehnert/SwasthyaSathi/mobile

# 2. Install dependencies (first time only)
yarn install

# 3. Start Expo
npx expo start
```

Then:
1. Download **Expo Go** app on your phone
2. Scan the QR code that appears
3. App will load on your phone!

## 📱 Get Expo Go App

- **iOS**: https://apps.apple.com/app/expo-go/id982107779
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent

## 📂 What Changed

### Files Modified:
- `package.json` - Added Expo dependencies
- `babel.config.js` - Updated for Expo
- `metro.config.js` - Updated for Expo
- `src/App.tsx` - Simplified with 4-tab navigation

### Files Added:
- `App.js` - Expo entry point
- `app.json` - Expo configuration
- `src/screens/HomeTab.tsx` - Blue home screen
- `src/screens/RecordsTab.tsx` - Purple records screen
- `src/screens/ScannerTab.tsx` - Green scanner screen
- `src/screens/ProfileTab.tsx` - Orange profile screen
- `EXPO_SETUP.md` - Detailed setup guide

### Files Preserved:
- All your previous screens (Login, Register, etc.)
- API service files
- Shared types integration

## 🎨 Current App Structure

The app now has a simple bottom tab navigation with 4 tabs:

1. **Home Tab** 🏠 (Light Blue)
   - Welcome screen
   - Entry point for users

2. **Records Tab** 📋 (Light Purple)
   - Medical records list
   - Document management

3. **Scanner Tab** 📸 (Light Green)
   - Document upload
   - Camera/file picker

4. **Profile Tab** 👤 (Light Orange)
   - User profile
   - Settings

Each tab has:
- Different background color (so you can see navigation works)
- Emoji icon
- Placeholder content
- "SwasthyaSathi" header

## ✅ How to Test

### 1. Start the Server
```bash
cd /Users/emilylehnert/SwasthyaSathi/mobile
npx expo start
```

You should see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go
```

### 2. Open on Phone
- Open Expo Go app
- Scan the QR code
- Wait 30-60 seconds for first load
- App should appear!

### 3. Test Navigation
- Tap each tab icon at the bottom
- Verify each screen has different color:
  - Home = Blue
  - Records = Purple
  - Scanner = Green
  - Profile = Orange

### 4. Test Live Reload
- Open `src/screens/HomeTab.tsx`
- Change the title text
- Save the file
- Watch it update on your phone instantly!

## 🔧 Useful Commands

```bash
# Start Expo
npx expo start

# Clear cache and restart
npx expo start --clear

# Open on iOS simulator (macOS)
npx expo start --ios

# Open on Android emulator
npx expo start --android

# Use tunnel mode (if on different networks)
npx expo start --tunnel
```

## ❗ Common Issues

### "Can't connect to development server"

**Solution 1: Same WiFi**
- Make sure phone and computer are on the SAME WiFi network
- Not guest network, same network

**Solution 2: Use Tunnel**
```bash
npx expo start --tunnel
```
This is slower but works across different networks.

### "Module not found: @swasthyasathi/shared"

**Solution:**
```bash
# Build the shared package
cd ../shared
yarn build

# Restart Expo
cd ../mobile
npx expo start --clear
```

### "Expo Go won't scan QR code"

**iOS:** Point Camera app at QR code (don't open Expo Go first)
**Android:** Open Expo Go app first, then tap "Scan QR Code"

### "Metro bundler won't start"

**Solution:**
```bash
# Kill any running Metro processes
killall -9 node

# Clear and restart
npx expo start --clear
```

## 🎯 Next Steps

Now that you have Expo working:

1. **Test the basic navigation** ✅
2. **Try live reload by editing screens** ✅
3. **Start building real UI** - Replace placeholder screens
4. **Add authentication** - Integrate login/register flows
5. **Connect backend** - Wire up API calls
6. **Add document upload** - Use Expo Image Picker
7. **Integrate Claude AI** - Document analysis

## 📖 Documentation

- **Quick Setup**: See `EXPO_SETUP.md` for detailed instructions
- **Troubleshooting**: Check the troubleshooting section in `EXPO_SETUP.md`
- **Expo Docs**: https://docs.expo.dev/

## 🌟 Advantages of Expo

1. **Instant Preview** - See changes on your phone in seconds
2. **No Build Tools** - No Xcode or Android Studio needed
3. **Live Reload** - Automatic updates when you save
4. **Easy Sharing** - Share app via QR code with anyone
5. **Cross Platform** - One codebase, works on iOS and Android
6. **OTA Updates** - Push updates without app store review

## 🚨 Important Notes

- Keep your phone and computer on the same WiFi network
- First load might take 1-2 minutes
- Subsequent reloads are much faster
- If stuck, try `npx expo start --clear`

## 💡 Development Tips

1. **Keep Terminal Open** - Don't close the terminal window
2. **Watch for Errors** - Terminal shows all errors
3. **Use 'r' to Reload** - Press 'r' in terminal to reload app
4. **Shake to Debug** - Shake phone to open dev menu
5. **Clear Cache** - If something weird happens, clear cache

## ✨ What Works Now

- ✅ Bottom tab navigation
- ✅ 4 working screens
- ✅ Live reload/hot reload
- ✅ TypeScript support
- ✅ Shared package integration
- ✅ React Navigation
- ✅ Expo Go compatibility

## 🔄 Switching Between Versions

Your old React Native code is still there. If you need to:

**Use Expo (Current):**
```bash
npx expo start
```

**Use Regular React Native:**
```bash
yarn start  # (old way)
```

## 📞 Getting Help

If you run into issues:

1. Check `EXPO_SETUP.md` troubleshooting section
2. Try `npx expo start --clear`
3. Make sure phone and computer on same WiFi
4. Try tunnel mode: `npx expo start --tunnel`
5. Restart Expo Go app on phone

---

**Ready to see your app on your phone? Just run:**

```bash
cd mobile && npx expo start
```

Then scan the QR code with Expo Go! 🚀📱
