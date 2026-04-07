# 🚀 Google Drive Enterprise Clone (MERN)

A visually stunning, high-performance, and enterprise-grade file storage and management system. Build with a highly polished design system, fluid micro-animations, and a robust security architecture.

### 🌐 **[View Live Demo](https://google-drive-ecru.vercel.app)**

---

## 📦 App Capabilities & Features

### 🌐 Frontend (Modern JavaScript + EJS)

- **"Stunning UI/UX"**: Built with a custom design system utilizing glassmorphism, dynamic gradients, and smooth transitions.
- **"Single Upload"**: Support for individual file uploads with instant metadata synchronization to the database.
- **"Multi-Upload & Progress"**: Parallel upload stream for multiple files with real-time UI feedback (progress bars).
- **"Folder & Navigation"**: Upload and browse entire directory structures recursively with breadcrumb navigation.
- **"Multi-Selection"**: Advanced selection logic supporting Ctrl/Shift clicks and drag-to-select for bulk operations.
- **"Favorites & Starred"**: One-click system to mark important materials for quick retrieval in the "Starred" view.
- **"Trash & Auto-Purge"**: Secure deletion system with 30-day retention and auto-permanent purge logic running via backend cron.
- **"Real-time Search"**: Fast, indexed searching across all user-owned files and folders.
- **"Trash & Auto-Purge"**: Secure deletion system with 30-day retention and auto-permanent purge logic.

### ⚙️ Backend & Storage (Node.js + Express)

- **"Redis Caching"**: Accelerated performance for frequent data queries (like file listings) using an in-memory Redis cluster.
- **"Response Compression"**: All API responses are compressed via gzip to reduce bandwidth and speed up page loads.
- **"MinIO Object Storage"**: Enterprise-grade S3-compatible infrastructure for highly scalable file and folder management.
- **"Secure Multi-Download"**: Server-side zipping using `archiver` for bulk downloads without client-side lag.
- **"JWT Authentication"**: Secure, stateless session management with short-lived tokens and refresh logic.
- **"CSRF Protection"**: Robust defense against cross-site request forgery using `csurf`.

---

## 🛡️ Security Architecture

We prioritize the safety of your data with an enterprise-grade security stack.

### 1. **"Helmet.js"** 🔒

- **What is it?**: A security-focused middleware for Express.
- **Why we use it?**: It sets 15+ HTTP security headers, protecting against common threats like **Clickjacking**, **Cross-Site Scripting (XSS)**, and **MIME-sniffing**.

### 2. **"HPP (HTTP Parameter Pollution)"** 🛡️

- **What is it?**: A security middleware that scans the endpoint URL parameters.
- **Why we use it?**: To prevent attackers from confusing the server with multiple parameters of the same name, which could potentially bypass input validation or business logic.

### 4. **"Express Rate Limiting"** ⏳

- **What is it?**: A mechanism to limit the volume of requests a single IP can make.
- **Why we use it?**: We apply two levels of protection:
  - **"Global API Limiting"**: Prevents DDoS and resource exhaustion.
  - **"Auth-Specific Limiting"**: Stricter limits on login/signin attempts to mitigate brute-force and credential-stuffing attacks.

### 5. **"Dual-Token Authentication"** 🔑

- **"Short-lived Access Tokens"**: JWTs expire in **15 minutes** to minimize the impact of token leakage.
- **"Silent Refresh Tokens"**: A long-lived refresh token is used to issue new access tokens automatically, maintaining a secure yet seamless session.
- **"Rolling Sessions"**: Session expiry resets on every interaction to keep active users logged in.

### 6. **"Input Validation (Express Validator)"** ✅

- **What is it?**: A powerful set of validation and sanitization tools.
- **Why we use it?**: Every piece of user input (emails, names, filenames) is strictly validated and sanitized to prevent **SQL/NoSQL Injection** and **Stored XSS**.

### 7. **"CSRF Protection"** 🛡️

- **What is it?**: Defense against Cross-Site Request Forgery.
- **Why we use it?**: We use `csurf` to ensure all state-changing operations originate from our own frontend, preventing unauthorized actions on behalf of the user.

### 8. **"Supabase Object Storage"** 🛡️

- **What is it?**: Enterprise-grade S3-compatible infrastructure via Supabase for highly scalable file management.

### 9. **"MongoDB Atlas"** 🛡️

- **What is it?**: Globally distributed database for metadata and user accounts.

### 10. **"Redis Caching"** 🛡️

- **What is it?**: Accelerated performance for frequent data queries using Upstash Redis.

### 11. **"Secure Multi-Download"** 🛡️

- **What is it?**: Server-side zipping using `archiver` for bulk downloads.

- **"CSRF & JWT Security"**: Robust defense against security threats using cookie-based token rotation and `csurf`.

---

## 🏗️ Technology Stack

- **Frontend**: EJS, Vanilla CSS, Modern JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose)
- **Object Storage**: Supabase (S3 Compatible)
- **Caching**: Redis (Upstash)
- **Deployment**: Vercel (Serverless Functions)

---

## 🚀 Deployment & Development

This project is optimized for **Cloud-Native** deployment on Vercel and does not require Docker.

### 1. **"Cloud Orchestration"** ☁️

We use a serverless architecture to ensure the application is always available and scales automatically:

- **Vercel**: Hosts the API and Frontend.
- **MongoDB Atlas**: Manages the persistent data.
- **Supabase**: Handles all file and binary storage.

### 2. **"Local Quick Start"** 💻

To run this project locally without Docker:

```bash
# 1. Clone the repository
git clone [your-repo-link]

# 2. Install dependencies
npm install

# 3. Set up your .env file
# (Contact the owner for the required DB_URL and STORAGE keys)

# 4. Start the development server
npm run dev
```

**Visit [http://localhost:4000](http://localhost:4000) to start developing!**

---
