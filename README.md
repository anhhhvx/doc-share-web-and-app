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

- [Git](https://git-scm.com/install/) for cloning the repository.
- [Node.js](https://nodejs.org/en/download) for running the website and mobile project. npm is included with Node.js.
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) for the database.
- Expo Go or an Android/iOS emulator (ver 54)

### Clone Repository

```bash
git clone https://github.com/anhhhvx/doc-share-web-and-app.git
cd doc-share-web-and-app
```

### Sample Data (optional)

Prepared MongoDB data and sample uploaded files are available in the [`sample-data`](sample-data/) folder.

See the [sample data instructions](sample-data/README.md) for database restoration and usage. Restoring the sample database is optional because the project automatically initializes the basic data when it runs for the first time.

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

3. Open the app with Expo Go or an emulator through the QR code. 

### Note

The application was tested using Expo Go on both Android and iOS:
- Android: The laptop was connected to the phone's Personal Hotspot, and the Windows network profile was set to Private.
- iOS: We suscessfully tested with both Personal Hotspot and Normal Wifi, but the Windows network profile on the laptop need to be set to Public.
