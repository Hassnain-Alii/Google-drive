# 🚀 Google Drive Enterprise Clone (MERN)

A visually stunning, high-performance, and enterprise-grade file storage and management system. This application features a highly polished design system, fluid micro-animations, and a robust security architecture, making it a state-of-the-art deployment.

---

## 📦 App Capabilities & Features

### 🌐 Frontend (Modern JavaScript + EJS)

- **"Stunning UI/UX"**: Built with a custom design system utilizing glassmorphism, dynamic gradients, and smooth transitions.
- **"Single Upload"**: Support for individual file uploads with instant metadata synchronization to the database.
- **"Multi-Upload & Progress"**: Parallel upload stream for multiple files with real-time UI feedback (progress bars).
- **"Folder Support"**: Upload and browse entire directory structures recursively with ease.
- **"Multi-Selection"**: Advanced selection logic supporting Ctrl/Shift clicks and drag-to-select for bulk operations.
- **"Favorites & Starred"**: One-click system to mark important materials for quick retrieval in the "Starred" view.
- **"Trash & Auto-Purge"**: Secure deletion system with 30-day retention and auto-permanent purge logic running via backend cron.
- **"Real-time Search"**: Fast, indexed searching across all user-owned files and folders.

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

### 3. **"Pino HTTP Logging"** 📝

- **What is it?**: An extremely high-performance JSON logging library.
- **Why we use it?**: To provide a robust audit trail of all server interactions. For security teams, it provides detailed, structured data to monitor for anomalies without sacrificing performance.

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

---

## 🏗️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Object Storage**: MinIO (S3 Compatible)
- **Caching**: Redis
- **Authentication**: JWT & Session-based with Passport
- **Frontend**: EJS, Vanilla CSS, Modern JavaScript
- **DevOps**: Docker, Docker Compose, Caddy

---

## 🏛️ Infrastructure Components

### 1. **"Docker & Docker Compose"**

Ensures the application runs identically on any machine. Our `docker-compose.yml` orchestrates the entire stack (Node, Mongo, Redis, MinIO) in isolated, secure networks.

### 2. **"Redis In-Memory Data Store"**

Reduces database load and speed up data retrieval. By caching file lists and sessions, we achieve near-instant response times for returning users.

### 3. **"MinIO Object Storage"**

Handles file storage (on-disk) in a scalable, cloud-ready way. This separates binary data from metadata, keeping the database lightweight.

---

## 🚀 Quick Start (Docker Orchestration)

To spin up the entire cluster quickly:

```bash
# To spin up the entire cluster:
docker-compose up -d --build
```

This single command orchestrates:

1. **Node.js Express Server**: High-performance API server.
2. **MongoDB Database**: Standard NoSQL data persistence.
3. **Redis Cluster**: Accelerated data caching.
4. **MinIO Object Store**: S3-compatible asset management.
5. **Mongo Express**: Web-based Database Administration UI.

**Open [http://localhost:4000](http://localhost:4000) and enjoy the product!**
