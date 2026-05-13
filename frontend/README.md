# ⬡ ELYVAULT — Cloud Based Secure File Sharing

## Project Overview
ELYVAULT is a full-stack cloud-based file sharing application that allows users to securely upload, store, download, and share files using AWS services.

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **Cloud Storage:** AWS S3
- **Authentication:** AWS Cognito
- **Security:** Presigned URLs (1hr expiry)

## Features
- User signup, login, email verification (AWS Cognito)
- Upload any file type (text, images, PDF, CSV, JSON, etc.)
- Secure file storage on AWS S3 (private bucket)
- Download files via secure presigned URLs
- Share files with anyone via a temporary link
- Delete files from the vault
- Real-time storage stats dashboard
- Animated cyberpunk UI

##  How to Run

### Prerequisites
- Node.js installed
- AWS account with S3 bucket and Cognito User Pool

### Backend
\`\`\`
cd backend
node server.js
\`\`\`

### Frontend
\`\`\`
cd frontend
npm start
\`\`\`

### Environment Variables (backend/.env)
\`\`\`
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-2
S3_BUCKET_NAME=your_bucket
COGNITO_USER_POOL_ID=your_pool_id
COGNITO_CLIENT_ID=your_client_id
\`\`\`

## Project Structure
\`\`\`
secure-file-sharing/
├── backend/
│   ├── server.js
│   ├── .env
│   └── routes/
│       └── files.js
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── public/
        └── index.html
\`\`\`

## Security
- All files stored in private S3 bucket
- Access via temporary presigned URLs only
- User authentication via AWS Cognito
- Email verification required