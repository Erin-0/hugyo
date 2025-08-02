# Hugyo! - Anime Card Battle Game

A real-time 1v1 anime character battle game built with React and Firebase.

## Features

- **Real-time Multiplayer**: Battle against other players in real-time
- **Anime Characters**: Random anime characters from Jikan API
- **AI-Powered Battles**: Gemini AI determines battle outcomes
- **User Authentication**: Firebase Auth for secure login/registration
- **Live Statistics**: Track wins, losses, and game history
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Realtime Database**
   - **Firestore Database**

4. Get your Firebase configuration:
   - Go to Project Settings > General > Your apps
   - Click "Add app" and select Web
   - Copy the configuration object

5. Replace the configuration in `src/lib/firebase.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456789012345678"
   };
   ```

### 2. Gemini API Configuration

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini
3. Replace the API key in `src/lib/gemini.js`:
   ```javascript
   const GEMINI_API_KEY = 'your-gemini-api-key-here';
   ```

### 3. Firebase Security Rules

#### Realtime Database Rules
```json
{
  "rules": {
    "matchmaking": {
      ".read": true,
      ".write": true,
      "$uid": {
        ".validate": "auth != null && auth.uid == $uid"
      }
    },
    "gameRooms": {
      ".read": true,
      ".write": true,
      "$roomId": {
        "players": {
          "$uid": {
            ".validate": "auth != null && (auth.uid == $uid || root.child('gameRooms').child($roomId).child('players').hasChild(auth.uid))"
          }
        },
        "playerCards": {
          "$uid": {
            ".read": "auth != null && auth.uid == $uid",
            ".write": "auth != null && auth.uid == $uid"
          }
        }
      }
    }
  }
}
```

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Installation and Running

1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Game Rules

1. **Matchmaking**: Players join a queue and are matched with opponents
2. **Card Selection**: Each player receives 5 random anime character cards
3. **Rounds**: Players have 20 seconds to select their strongest character
4. **Battle Resolution**: Gemini AI compares characters and determines the winner
5. **Scoring**: First player to reach 3 points wins the match
6. **Statistics**: Win/loss records are automatically updated

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Auth, Realtime Database, Firestore)
- **APIs**: 
  - Jikan API (anime character data)
  - Gemini Flash API (character comparison)
- **State Management**: Custom React hooks
- **Styling**: Tailwind CSS with custom animations

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── LoginScreen.jsx
│   ├── MatchmakingScreen.jsx
│   ├── GameScreen.jsx
│   └── GameFinishedScreen.jsx
├── hooks/               # Custom React hooks
│   ├── useAuth.js
│   └── useGame.js
├── lib/                 # Utility libraries
│   ├── firebase.js      # Firebase configuration
│   ├── gemini.js        # Gemini API integration
│   └── jikan.js         # Jikan API integration
├── App.jsx              # Main application component
└── main.jsx             # Application entry point
```

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your preferred hosting service:
   - Firebase Hosting
   - Vercel
   - Netlify
   - GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the GitHub repository.

