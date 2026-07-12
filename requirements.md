# Document Sharing Platform Requirements

This file lists the required runtime versions and project dependencies.

Run `npm install` inside each project folder to install the dependencies from `package.json`.

## 1. Development Tools

- Git 2.40 or later
- Node.js 20 LTS or later
- npm 10 or later
- MongoDB Community Server 7.0 or later
- Expo Go compatible with Expo SDK 54
- Android Studio, optional for Android Emulator
- Xcode, optional for iOS Simulator on macOS

## 2. Web Application

**Folder:** `doc-share-web`

### Runtime

- Node.js `>= 20`
- MongoDB `>= 7.0`

### Dependencies

| Package | Version |
|---|---:|
| bcrypt | 6.0.0 |
| ejs | 6.0.1 |
| express | 5.2.1 |
| express-session | 1.19.0 |
| mongoose | 9.7.4 |

### Installation

```bash
cd doc-share-web
npm install
node app.js
```

Default address:

```text
http://localhost:3000
```

### Optional Environment Variables

- `PORT`: Web server port, default is `3000`
- `MONGODB_URI`: MongoDB connection string, default is `mongodb://127.0.0.1:27017/doc-share-web`
- `SESSION_SECRET`: Secret value used to protect login sessions

## 3. Mobile Application

**Folder:** `doc-share-app`

### Runtime

- Node.js `>= 20`
- Expo SDK `54`
- React `19.0.0`
- React Native `0.78.0`

### Dependencies

| Package | Version |
|---|---:|
| @react-native-async-storage/async-storage | 2.2.0 |
| @react-navigation/bottom-tabs | 7.18.8 |
| @react-navigation/native | 7.3.8 |
| @react-navigation/stack | 7.10.11 |
| expo | 54.0.0 |
| expo-status-bar | 2.1.0 |
| react | 19.0.0 |
| react-native | 0.78.0 |
| react-native-gesture-handler | 2.28.0 |
| react-native-safe-area-context | 5.6.0 |
| react-native-screens | 4.16.0 |

### Installation

```bash
cd doc-share-app
npm install
npx expo start
```

### Network Requirements

- The computer and phone must use the same local network.
- Update `doc-share-app/config.js` with the computer's local IPv4 address.
- Example: `http://172.20.10.3:3000`

## 4. Verification Commands

```bash
git --version
node --version
npm --version
mongod --version
npx expo --version
```
