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

## 3. Installation and Usage

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

# 4. Team Responsibilities

The following table summarizes the responsibilities of each member in the Website and Mobile App development.

### 4.1. Website and Mobile App

| Area | Responsibilities |
|---|---|
| **A. WEBSITE** | |
| Database | **Vu Xuan Anh:** Configured MongoDB, Mongoose, and the main data models. **Nguyen Dieu My:** Prepared and verified the sample data. |
| Authentication and Authorization | **Vu Xuan Anh:** Developed session-based authentication, password hashing, and Admin/User authorization. **Nguyen Dieu My:** Designed and tested the login and registration interfaces. |
| Document Management | **Vu Xuan Anh:** Developed document routes, database queries, upload, download, search, and filtering. **Nguyen Dieu My:** Designed and tested the document list and detail pages. |
| Comments and Ratings | **Vu Xuan Anh:** Developed the APIs and database operations for comments and ratings. **Nguyen Dieu My:** Designed the rating form and public comment section. |
| Advertisement Popup | **Vu Xuan Anh:** Developed the one-minute timer and cookie-based display logic. **Nguyen Dieu My:** Designed and tested the popup interface. |
| Contact Page | **Vu Xuan Anh:** Developed the contact API and database storage. **Nguyen Dieu My:** Designed the contact information section and feedback form. |
| Admin Dashboard | **Vu Xuan Anh:** Developed protected Admin routes, website view tracking, content updates, and data management. **Nguyen Dieu My:** Designed and tested the dashboard, forms, and management tables. |
| Responsive Web UI | **Nguyen Dieu My:** Designed the website UI and responsive layouts for mobile, tablet, and desktop. **Vu Xuan Anh:** Developed the main HTML structure and Grid/Flexbox layouts. |
| Project Organization | **Vu Xuan Anh:** Organized the backend, routes, database functions, and configuration. **Nguyen Dieu My:** Organized EJS views, CSS, JavaScript, and public resources. |
| External Libraries | Both members used native HTML, CSS, and JavaScript for the website interface and only necessary backend libraries. |
| **B. MOBILE APP** | |
| API Integration | **Vu Xuan Anh:** Configured the server connection and resolved LAN/Hotspot connection issues. **Nguyen Dieu My:** Developed the API service functions in `services/api.js`. |
| Main Screen | **Vu Xuan Anh:** Developed document loading, search, and category filtering. **Nguyen Dieu My:** Designed and tested the document list interface. |
| Login and Registration | **Vu Xuan Anh:** Developed authentication and persistent login using AsyncStorage. **Nguyen Dieu My:** Designed and tested the authentication forms. |
| Document Detail | **Vu Xuan Anh:** Developed document retrieval and login-based access control. **Nguyen Dieu My:** Designed and tested the detail screen. |
| Comments and Ratings | **Vu Xuan Anh:** Integrated the comment and rating APIs. **Nguyen Dieu My:** Designed and tested the rating form and comment list. |
| Contact Screen | **Vu Xuan Anh:** Integrated the contact API. **Nguyen Dieu My:** Designed and tested the contact information and feedback form. |
| App UI and Structure | **Nguyen Dieu My:** Designed the UI and organized `screens`, `components`, and `services`. **Vu Xuan Anh:** Configured navigation, networking, and mobile layout adjustments. |
| External Libraries | Both members mainly used React Native Core Components and only necessary navigation and storage libraries. |

### 4.2. Additional Work

- **Sample Data:** Prepared and verified the sample MongoDB dataset and uploaded files.
- **Database Export:** Exported the database using MongoDB Database Tools and organized the `sample-data` folder.
- **Documentation:** Prepared the project report, README files, installation guide, and sample data instructions.
- **Mobile Testing:** Tested the application on both Android and iOS using Expo Go.
- **Network Support:** Added API timeout handling and documented LAN, Hotspot, and Windows network configuration.

### 4.3. Completion Assessment

The project has completed all required Website and Mobile App features. Additional supporting features were also implemented to improve usability and better match the practical workflow of the document-sharing website.
