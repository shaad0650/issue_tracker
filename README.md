
# 🏗️ Issue Tracker Backend - Building Phase

This phase focuses on core security, Role-Based Access Control (RBAC), and the business logic state machine.

## 🛠️ Tech Stack & Security
- **Runtime:** Node.js / Express
- **ORM:** Prisma with PostgreSQL
- **Auth:** JWT-based Authentication
- **Protection:** `.gitignore` configured to block `.env` and `node_modules` from GitHub

## 🚦 Middleware Logic
- **requireAuth:** Validates JWT and attaches `userId` and `role`.
- **loadIssue:** Safely fetches an issue by ID before processing.
- **requireRole:** Restricts access based on roles (`ADMIN`, `DEV`, `VIEWER`).
- **requireIssueOwnershipOrAdmin:** Ensures non-admins can only edit their assigned issues.

## 🧪 Testing Suite (Requirements)
The following test cases were implemented to verify system integrity:
1. **Test 1:** DEV can create issues (Expected: `201 Created`).
2. **Test 2:** VIEWER blocked from creating issues (Expected: `403 Forbidden`).
3. **Test 3:** Prevent illegal status jumps (e.g., Backlog → Review) (Expected: `400 Bad Request`).
4. **Test 4:** Block DEV from setting `CRITICAL` priority (Expected: `403 Forbidden`).

## 📝 Audit Logging
Implemented an `AuditLog` model to track state changes, capturing `action`, `oldValue`, `newValue`, and `userId` for transparency.

## 🚀 Setup
1. `npm install`
2. Configure `.env` (JWT secrets and Database URL)
3. `npx prisma db push`
4. `npm run dev`


