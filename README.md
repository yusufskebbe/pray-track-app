# Namaz Takip

A mobile application for Muslims to track and manage their missed prayers (Kaza Namazı). Built with React Native and Expo for iOS, Android, and Web platforms.

## Features

- **Daily Prayer Times**: View accurate prayer times based on your selected city in Turkey
- **Missed Prayer Tracking**: Add and manage missed prayers (Kaza Namazı) by type and date
- **Prayer List**: View all missed prayers grouped by prayer type with expandable details
- **Progress Tracking**: Visual indicator showing your prayer completion progress
- **Dark/Light Theme**: Automatic theme support with manual toggle option
- **City Selection**: Choose from all 81 cities in Turkey for accurate prayer times
- **Daily Hadith**: Inspirational hadith displayed on the home screen
- **Offline Support**: Local SQLite database for offline data persistence

## Screenshots

<!-- Add your app screenshots here -->

## Prayer Types Supported

| Turkish Name | English Name |
| ------------ | ------------ |
| İmsak        | Fajr         |
| Öğle         | Dhuhr        |
| İkindi       | Asr          |
| Akşam        | Maghrib      |
| Yatsı        | Isha         |

## Tech Stack

- **Framework**: [Expo](https://expo.dev) (SDK 54)
- **Language**: TypeScript
- **UI**: React Native
- **Navigation**: Expo Router (file-based routing)
- **Database**: expo-sqlite (local storage)
- **State Management**: React Context API
- **Icons**: @expo/vector-icons (Ionicons)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pray-track-app.git
cd pray-track-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npx expo start
```

### Running the App

After starting the development server, you can run the app on:

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app
- **Web Browser**: Press `w` in the terminal

## Project Structure

```
pray-track-app/
├── app/                    # App screens (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── list.tsx       # Missed prayers list
│   │   └── settings.tsx   # Settings screen
│   └── _layout.tsx        # Root layout
├── assets/                 # Images and static assets
├── config/                 # Configuration files
├── contexts/              # React Context providers
│   ├── add-prayer-context.tsx
│   ├── city-context.tsx
│   └── theme-context.tsx
├── hooks/                 # Custom React hooks
├── services/              # Database and API services
│   └── database.service.ts
└── types/                 # TypeScript type definitions
    └── prayer.types.ts
```

## Building for Production

### Using EAS Build

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Configure your project:

```bash
eas build:configure
```

3. Build for iOS:

```bash
eas build --platform ios
```

4. Build for Android:

```bash
eas build --platform android
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for public distribution.

## Contact

Yusuf Kebbe - [@yusufskebbe](https://github.com/yusufskebbe)

---
