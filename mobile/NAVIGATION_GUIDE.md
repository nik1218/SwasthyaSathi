# SwasthyaSathi - Navigation Structure Guide

## 📱 Navigation Overview

The app uses **React Navigation** with a **bottom tab navigator** featuring 4 main sections.

## 🎯 Tab Structure

### 1. Home Tab
- **Icon**: Feather `home` icon
- **Label**: "Home"
- **Color**: Blue (#007AFF) when active
- **Purpose**: Main dashboard showing health overview
- **Features**:
  - Upcoming appointments
  - Recent medical records
  - Health reminders
  - Quick actions

### 2. Records Tab
- **Icon**: Feather `folder` icon
- **Label**: "Records"
- **Color**: Blue (#007AFF) when active
- **Purpose**: Medical records management
- **Features**:
  - Lab reports and test results
  - Prescriptions and medications
  - X-rays, CT scans, MRI scans
  - Medical certificates
  - Vaccination records

### 3. Scanner Tab
- **Icon**: Feather `camera` icon
- **Label**: "Scanner"
- **Color**: Blue (#007AFF) when active
- **Purpose**: Main action - document upload and scanning
- **Features**:
  - Capture photos of documents
  - Upload from gallery
  - AI text extraction with Claude
  - Automatic categorization
  - Medical insights generation

### 4. Profile Tab
- **Icon**: Feather `user` icon
- **Label**: "Profile"
- **Color**: Blue (#007AFF) when active
- **Purpose**: User account and settings
- **Features**:
  - Personal information
  - Medical history & conditions
  - Emergency contacts
  - Privacy & security settings
  - Notification preferences

## 🎨 Design System

### Colors
- **Primary Blue**: `#007AFF` (active tabs, buttons, headers)
- **Inactive Gray**: `#8E8E93` (inactive tabs)
- **Background**: `#F8F9FA` (light gray)
- **Card Background**: `#FFFFFF` (white)
- **Text Primary**: `#1A1A1A` (dark gray)
- **Text Secondary**: `#666666` (medium gray)
- **Border**: `#E5E5EA` (light gray)

### Typography
- **Title**: 28px, Bold (700)
- **Subtitle**: 16px, Regular (400)
- **Description**: 15px, Medium (500)
- **Feature Items**: 14px, Regular (400)
- **Tab Labels**: 11px, Semibold (600)

### Spacing
- **Container Padding**: 20px
- **Vertical Spacing**: 40px
- **Icon Container**: 120x120px
- **Card Border Radius**: 16px
- **Button Border Radius**: 20px

### Shadows
- **Icon Container**: Subtle blue shadow
- **Cards**: Minimal black shadow (0.05 opacity)
- **Tab Bar**: Light shadow at top

## 📂 File Structure

```
mobile/src/
├── App.tsx                    # Main navigation setup
└── screens/
    ├── HomeTab.tsx           # Home dashboard screen
    ├── RecordsTab.tsx        # Medical records screen
    ├── ScannerTab.tsx        # Document scanner screen
    └── ProfileTab.tsx        # User profile screen
```

## 🔧 Navigation Configuration

### Header Style
- **Background**: Blue (#007AFF)
- **Title**: "SwasthyaSathi" (centered)
- **Text Color**: White
- **No Border**: Clean, seamless look

### Tab Bar Style
- **Background**: White
- **Height**: 65px
- **Border Top**: 1px light gray (#E5E5EA)
- **Padding**: 8px top/bottom
- **Shadow**: Subtle elevation
- **Icons**: 24-28px (slightly larger when active)
- **Labels**: 11px, semibold

## 🚀 How to Test

### Start the App
```bash
cd /Users/emilylehnert/SwasthyaSathi/mobile
npx expo start
```

### Test Checklist
- [ ] All 4 tabs visible at bottom
- [ ] Icons display correctly (home, folder, camera, user)
- [ ] Active tab shows in blue
- [ ] Inactive tabs show in gray
- [ ] Tapping tabs switches screens
- [ ] Each screen shows correct content
- [ ] Icons slightly enlarge when active
- [ ] Header shows "SwasthyaSathi"
- [ ] Smooth animations between tabs
- [ ] Status bar shows correctly

### Visual Testing
1. **Home Tab**: Should show home icon and blue circular background
2. **Records Tab**: Should show folder icon with feature list
3. **Scanner Tab**: Should show camera icon with AI features
4. **Profile Tab**: Should show user icon with settings list

### Interactive Testing
1. Tap each tab multiple times
2. Verify active state changes
3. Check icon size changes
4. Verify smooth transitions
5. Test on both iOS and Android

## 📸 Expected Appearance

### Tab Bar (Bottom)
```
[Home] [Records] [Scanner] [Profile]
  🏠      📁        📸         👤
Blue    Gray      Gray      Gray
```

### Active Tab
```
[Home]
  🏠  (larger, blue)
 Home (blue text)
```

### Header (Top)
```
┌─────────────────────────────┐
│      SwasthyaSathi         │  (White text on blue)
└─────────────────────────────┘
```

## 🎯 Screen Components

Each placeholder screen has:
1. **Icon Container** - Large circular background with Feather icon
2. **Title** - Screen name in bold
3. **Subtitle** - Brief description
4. **Description Box** - White card with feature list
5. **Status Badge** - "Coming Soon" blue badge

### Common Layout
```
┌─────────────────────────┐
│                         │
│      [ Icon ]           │
│                         │
│   Screen Title          │
│   Subtitle text         │
│                         │
│   ┌─────────────────┐   │
│   │ Description     │   │
│   │ • Feature 1     │   │
│   │ • Feature 2     │   │
│   │ • Feature 3     │   │
│   └─────────────────┘   │
│                         │
│   [ Coming Soon ]       │
│                         │
└─────────────────────────┘
```

## 🔄 State Management

Currently using:
- **React Navigation** for navigation state
- Local component state for UI
- No global state management yet

Future considerations:
- Context API for user session
- Redux or Zustand for app state
- React Query for server state

## 📱 Platform Differences

### iOS
- Tab bar respects safe area
- Icons render smoothly
- Shadows display nicely

### Android
- Tab bar elevation for shadow effect
- Material ripple on tab press
- Hardware back button (not implemented yet)

## 🚧 Future Enhancements

### Navigation Features to Add
- [ ] Deep linking support
- [ ] Push notification navigation
- [ ] Tab badge counts (for unread items)
- [ ] Gesture navigation
- [ ] Stack navigation within tabs
- [ ] Modal screens
- [ ] Authentication flow

### UX Improvements
- [ ] Tab press haptic feedback
- [ ] Loading states
- [ ] Error boundaries
- [ ] Offline mode indicators
- [ ] Accessibility labels
- [ ] Screen reader support

## 🐛 Known Issues

None currently! Navigation works smoothly on Expo Go.

## 💡 Development Tips

### Update Tab Icons
Edit `src/App.tsx`, line 69-120:
```typescript
tabBarIcon: ({ color, focused }) => (
  <Feather
    name="home"  // Change icon name here
    size={focused ? 26 : 24}
    color={color}
  />
)
```

### Update Tab Colors
Edit `src/App.tsx`, line 37-38:
```typescript
tabBarActiveTintColor: '#007AFF',  // Active color
tabBarInactiveTintColor: '#8E8E93',  // Inactive color
```

### Update Screen Content
Edit individual screen files in `src/screens/`:
- `HomeTab.tsx`
- `RecordsTab.tsx`
- `ScannerTab.tsx`
- `ProfileTab.tsx`

### Add New Screen
1. Create new screen file in `src/screens/`
2. Import in `src/App.tsx`
3. Add `<Tab.Screen>` component
4. Configure icon and label

## 📚 Resources

- **React Navigation Docs**: https://reactnavigation.org/
- **Feather Icons**: https://feathericons.com/
- **Expo Vector Icons**: https://icons.expo.fyi/
- **React Native Docs**: https://reactnative.dev/

## ✅ Testing Results

After implementing:
- ✅ Navigation renders correctly
- ✅ All 4 tabs functional
- ✅ Icons display properly
- ✅ Active/inactive states work
- ✅ Smooth animations
- ✅ Clean, professional design
- ✅ Matches design system
- ✅ Works on Expo Go

## 🎉 Ready to Use!

The navigation is fully functional and ready for development. Start adding real functionality to each screen!

```bash
# View on your phone
cd mobile
npx expo start
# Scan QR code with Expo Go
```

---

**Navigation Setup Complete!** 🚀

All 4 tabs are working with professional Feather icons and clean, minimal styling. Ready for the next phase of development!
