# Cloud Based Secure File Sharing

## Description
A full-stack cloud application where users can securely upload, store, download, and share files using AWS S3 and AWS Cognito authentication.

## Tech Stack
- Frontend: React.js
- Backend: Node.js + Express
- Storage: AWS S3
- Authentication: AWS Cognito

## How to Run

### Backend
cd backend
node server.js

### Frontend
cd frontend
npm start

## Features
- User signup/login with email verification
- Upload any file type (text, images, etc.)
- Download files securely
- Share files via temporary presigned URLs (expires in 1 hour)
- Delete files

