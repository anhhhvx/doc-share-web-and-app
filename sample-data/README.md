# Sample Data Usage

This folder contains the sample MongoDB data and uploaded document files used by the Document Sharing Platform.

The sample data includes categories, comments, contact messages, document records, and user accounts. Some PDF files are already available in the `doc-share-web/uploads` folder.

You can restore the sample data by following the instructions below or create new data, including comments, contact messages, documents, and user accounts, directly through the application interface.

> Note: Basic data is automatically initialized when the project runs for the first time. Therefore, you can skip the database restoration step and create additional comments, contact messages, documents, and user accounts directly through the application interface. 

> Restore the provided database only when you want to use the complete prepared sample dataset.
## Folder Structure

```text
sample-data/
├── mongodb-dump/
│   └── doc-share-web/
│       ├── users.bson
│       ├── documents.bson
│       ├── categories.bson
│       ├── comments.bson
│       ├── contacts.bson
│       └── sites.bson
└── uploads/
    └── uploaded document files
```

## Requirements

- MongoDB Community Server
- MongoDB Database Tools
- The project source code

Make sure MongoDB is running before restoring the data.

## Restore MongoDB Data

Open PowerShell in the project root folder and run:

```powershell
mongorestore --db doc-share-web ".\sample-data\mongodb-dump\doc-share-web"
```

To replace existing collections with the sample data, use:

```powershell
mongorestore --drop --db doc-share-web ".\sample-data\mongodb-dump\doc-share-web"
```

> The `--drop` option deletes the existing collections before restoring them.

If `mongorestore` is not available in `PATH`, run:

```powershell
& "C:\Program Files\MongoDB\Tools\100\bin\mongorestore.exe" --drop --db doc-share-web ".\sample-data\mongodb-dump\doc-share-web"
```

## Restore Uploaded Files

Copy the files from:

```text
sample-data/uploads
```

to:

```text
doc-share-web/uploads
```

PowerShell command:

```powershell
Copy-Item ".\sample-data\uploads\*" ".\doc-share-web\uploads" -Recurse -Force
```

## Run the Website

```powershell
cd doc-share-web
npm install
node app.js
```

Open:

```text
http://localhost:3000
```

## Default Administrator Account

```text
Username: admin
Password: 123456
```

## Verify the Restored Data

Check that the website displays the sample users, categories, documents, comments, contact messages, and uploaded files.

The database name must remain:

```text
doc-share-web
```