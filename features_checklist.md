# Project Features & Security Checklist

This document tracks the implementation status of key features and security measures for the Google Drive Clone project.

## Core Features
- [x] **Single Upload**: Upload individual files to the drive with checksum verification.
- [x] **Multi Upload**: Support for selecting and uploading multiple files simultaneously using Multer.
- [x] **Folder Upload**: Upload entire folder structures with recursive file/folder creation on the backend.
- [x] **Download**: Highly performant file downloads directly piped from MinIO.
- [x] **Multi/Bulk Download**: Select multiple items and download them as a compressed ZIP file.
- [x] **Folder Download**: Download entire directory structures as a ZIP archive.
- [x] **Selection UI**: Visual feedback for selecting individual files and folders.
- [x] **Multi-Select**: Support for Ctrl/Shift selection and drag-to-select functionality.
- [x] **Starred Files**: Mark important files and folders for quick access.
- [x] **Trash System**: Secure deletion system with auto-permanent purge after 30 days.
- [x] **Search**: Real-time search for files and folders by name.

## Security Measures
- [x] **Helmet.js**: Configured with strict Content Security Policy (CSP) headers to prevent XSS and clickjacking.
- [x] **HPP (HTTP Parameter Pollution)**: Middleware to prevent parameter pollution attacks on search and filter routes.
- [x] **Pino Logging**: Structured, high-performance JSON logging for auditing and debugging.
- [x] **Express Validator**: Server-side validation and sanitization for all user inputs (emails, names, passwords).
- [x] **Global Rate Limiting**: Distributed rate limiting using Redis to prevent DDoS and brute-force attacks.
- [x] **Auth-Specific Rate Limiting**: Dedicated stricter limits for login and sign-in endpoints.
- [x] **Silent Refresh Tokens**: Dual-token system (Access + Refresh) to maintain secure, persistent sessions.
- [x] **CSURF Protection**: CSRF protection for all POST/PUT/DELETE requests using double-submit cookie pattern.
- [x] **Secure Cookies**: All cookies are set with `httpOnly`, `sameSite: "lax"`, and conditional `secure` flags.
- [x] **Bcrypt Hashing**: Adaptive salt rounds used for secure password storage.
- [x] **Rolling Sessions**: Redis-backed sessions that automatically extend as long as the user is active.

## Infrastructure
- [x] **MinIO / S3**: Reliable object storage for file persistence.
- [x] **MongoDB / Mongoose**: Metadata management and relational-like querying for files.
- [x] **Redis**: Used for session storage, distributed rate limiting, and result caching.
- [x] **Docker Orchestration**: Complete stack containerization (App, DB, Redis, MinIO, Caddy).
- [x] **Caddy / SSL**: Automated certificate management and reverse proxy (Production-ready).
