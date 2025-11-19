# EVERSPEAK React Native Mobile App

A React Native/Expo mobile application for grief support and honoring loved ones. This app connects to the EVERSPEAK Express backend API.

## Features

✅ **Personas** - Create and manage personas for your loved ones
✅ **Memories** - Add categorized memories with importance weighting
✅ **Conversation Room** - AI-powered conversations with personas
✅ **Journal** - Reflect and process your thoughts
✅ **Home** - Quick access dashboard
✅ **Settings** - App configuration

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- EVERSPEAK backend running at `localhost:3000`

## Installation

1. Navigate to the client folder:
```bash
cd C:\Users\ishla\Desktop\EVERSPEAK\client
```

2. Install dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npm start
```

## Running the App

### iOS Simulator (Mac only)
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Expo Go (Physical Device)
1. Install Expo Go app on your iOS or Android device
2. Scan the QR code shown in the terminal
3. Make sure your device is on the same network as your development machine

### Web (for testing UI only)
```bash
npm run web
```

**Note:** The web version is for UI testing only. For full functionality including backend API calls, use iOS or Android.

## Backend Setup

The mobile app requires the EVERSPEAK Express backend to be running:

1. Open a new terminal
2. Navigate to the EVERSPEAK root folder:
```bash
cd C:\Users\ishla\Desktop\EVERSPEAK
```

3. Start the backend server:
```bash
npm run dev
```

The backend should now be running at `http://localhost:3000`

## Environment Configuration

The app is configured to connect to `http://localhost:3000/api` by default.

To change the API URL, edit `.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Project Structure

```
client/
├── App.tsx                 # Root component with navigation
├── index.js               # Entry point
├── app.json               # Expo configuration
├── screens/               # Main app screens
│   ├── HomeScreen.tsx
│   ├── ConversationScreen.tsx
│   ├── JournalScreen.tsx
│   ├── MemoriesScreen.tsx
│   ├── PersonasScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/            # Navigation configuration
│   └── MainTabNavigator.tsx
├── components/            # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorMessage.tsx
├── services/              # API integration
│   ├── api.ts
│   ├── personaService.ts
│   ├── journalService.ts
│   └── chatService.ts
├── hooks/                 # Custom React hooks
│   └── usePersona.ts
├── constants/             # Theme and design system
│   └── theme.ts
├── types/                 # TypeScript type definitions
│   └── index.ts
└── utils/                 # Utility functions
    └── storage.ts
```

## Tech Stack

- **React Native** 0.81.5
- **Expo** SDK 54
- **TypeScript**
- **React Navigation** (Tab + Stack navigators)
- **AsyncStorage** for local persistence
- **date-fns** for date formatting
- **Expo Linear Gradient** for UI effects

## API Endpoints Used

The mobile app communicates with these backend endpoints:

- `POST /api/message` - Send chat messages
- `GET /api/personas` - Get all personas
- `POST /api/personas` - Create persona
- `PUT /api/personas/:id` - Update persona
- `DELETE /api/personas/:id` - Delete persona
- `GET /api/personas/:id/memories` - Get persona memories
- `POST /api/personas/:id/memories` - Create memory
- `PUT /api/personas/:id/memories/:memoryId` - Update memory
- `DELETE /api/personas/:id/memories/:memoryId` - Delete memory
- `GET /api/journal` - Get all journal entries
- `POST /api/journal` - Create journal entry
- `PUT /api/journal/:id` - Update journal entry
- `DELETE /api/journal/:id` - Delete journal entry

## Deployment with Expo EAS

To deploy the app for internal distribution:

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure the project:
```bash
eas build:configure
```

4. Build for iOS (internal):
```bash
eas build --platform ios --profile development
```

5. Build for Android (internal):
```bash
eas build --platform android --profile development
```

## Troubleshooting

### Backend Connection Issues

If you see "Failed to connect to server" errors:

1. Ensure the backend is running at `http://localhost:3000`
2. Test the backend: `curl http://localhost:3000/api/test`
3. Check that .env has the correct API URL
4. For Android emulator, you may need to use `http://10.0.2.2:3000/api` instead of localhost

### Metro Bundler Issues

If you encounter Metro bundler errors:
```bash
npm start -- --reset-cache
```

### Module Resolution Errors

Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

## Development Notes

- The selected persona is persisted using AsyncStorage
- Messages are stored in component state (not persisted between sessions)
- All API calls include error handling with user-friendly messages
- The dark theme matches the EVERSPEAK brand colors

## Next Steps

Future enhancements to consider:

- [ ] Add the 6-step Setup Wizard
- [ ] Implement Bulk Memory Import
- [ ] Add Voice-to-Text recording
- [ ] Implement Persona Booster (accuracy audit)
- [ ] Add Snapshot system (version control)
- [ ] Implement Settings/Calibration sliders
- [ ] Add offline support with local database
- [ ] Implement push notifications
- [ ] Add biometric authentication

## Support

For issues or questions:
- Check the EVERSPEAK backend logs
- Review the Expo documentation: https://docs.expo.dev
- Check React Navigation docs: https://reactnavigation.org

---

**Built with ❤️ using React Native and Expo**
