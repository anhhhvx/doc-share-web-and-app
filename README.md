# Document Sharing Platform

## 1. Main Features

### Website
- User registration, login, logout, and role-based access for Admin and User.
- Document listing, search, category filtering, detail pages, upload, download, and Google Drive links.
- Public comments and 1–5 star ratings.
- Contact form and promotional popup controlled by cookies.
- Admin dashboard for website statistics (views), content, documents, comments, users, and contact messages.
- Responsive interface for desktop, tablet, and mobile devices.

### Mobile App
- React Native application built with Expo.
- Connects to the website through REST APIs.
- Main document screen, login/register screen, document detail screen, comment/rating form, and contact screen.
- Local login-session storage with AsyncStorage.

## 2. Completion Status

The main website and mobile requirements are completed and connected to MongoDB. Authentication, document display, comments, ratings, contact forms, administration, responsive layouts, and mobile API communication are operational. Final testing is still required for different devices, network environments, and edge cases.

## 3. Team Responsibilities

| Member | Responsibilities |
|---|---|
| Vu Xuan Anh | ...|
| Nguyen Dieu My |... |

## 4. Installation and Usage

### Requirements
- Node.js
- MongoDB Community Server
- Expo Go or an Android/iOS emulator

### Run the Website

```bash
cd doc-share-web
npm install
node app.js
```

Open:

```text
http://localhost:3000
```

Default administrator account:

```text
Username: admin
Password: 123456
```

### Run the Mobile App

The computer and phone must use the same network.

1. Update `doc-share-app/config.js` with the computer's local IPv4 address (use ipconfig to get the ipv4 - for example 172.20.10.3):

```js
export const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000';
```

2. Start the app:

```bash
cd doc-share-app
npm install
npx expo start
```

If the app cannot connect to the server, try switching the Windows network profile between Private and Public.

3. Open the app with Expo Go or an emulator. 

### Note

The application was tested using Expo Go on both Android and iOS:
- Android: The laptop was connected to the phone's Personal Hotspot, and the Windows network profile was set to Private.
- iOS: A Personal Hotspot was also used for a more stable connection, but the Windows network profile on the laptop was set to Public.
