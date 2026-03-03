# BookNGo CMS Frontend - Complete Developer Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Initial Setup Instructions](#initial-setup-instructions)
6. [Running the Application](#running-the-application)
7. [Project Structure](#project-structure)
8. [Key Features](#key-features)
9. [Environment Variables](#environment-variables)
10. [Development Workflow](#development-workflow)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**BookNGo CMS Frontend** is a role-based Content Management System (CMS) built with Next.js 15. It serves as the administrative interface for managing BookNGo's core business entities including activities, inventory, zones, teams, and user profiles.

### Purpose
This frontend application provides a secure, role-aware interface that connects to the BookNGo backend API. It enables administrators, managers, and team members to manage various aspects of the BookNGo platform with different permission levels.

### Key Capabilities
- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Manager, Team)
- **CRUD Operations**: Full Create, Read, Update, Delete functionality for:
  - Activities
  - Inventory Items
  - Zones
  - Teams
  - User Profiles
- **Protected Routes**: Middleware-enforced route protection
- **Responsive UI**: Modern, mobile-friendly interface built with Tailwind CSS

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BookNGo CMS Frontend                      │
│                    (Next.js 15 App Router)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests (Axios)
                            │ JWT Token (Cookie)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  BookNGo Backend API                        │
│              (REST API - Port 3000)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│              (Data Persistence Layer)                        │
└─────────────────────────────────────────────────────────────┘
```

### Application Flow

1. **Request Flow**:
   ```
   User Request → Middleware (JWT Verification) → Route Handler → Component → API Call → Backend
   ```

2. **Authentication Flow**:
   ```
   Login → Backend Validates → JWT Token (Cookie) → Middleware Verifies → Access Granted/Denied
   ```

3. **Route Protection**:
   - **Public Routes**: `/login`, `/setup-password` (No authentication required)
   - **Protected Routes**: All routes under `(Protected Pages)` require valid JWT
   - **Role-Based Access**: Admin (full access), Manager & Team (restricted access)

### Architecture Components

#### 1. **Route Groups**
- **`(Public Pages)`**: Unauthenticated routes (login, password setup)
- **`(Protected Pages)`**: Authenticated routes with Navbar and role-based access

#### 2. **Middleware (`src/middleware.ts`)**
- Runs on every request (except static assets)
- Validates JWT token from cookies
- Enforces role-based route restrictions
- Redirects unauthenticated users to `/login`
- Redirects unauthorized roles to `/unauthorized`

#### 3. **API Layer**
- **Centralized API Client** (`src/app/utils/api.ts`): Axios instance with base URL and error handling
- **Feature-Specific APIs**: Each module has its own API file (e.g., `activity.ts`, `inventory.ts`)
- All API calls include `withCredentials: true` for cookie-based authentication

#### 4. **Component Structure**
- **Shared Components**: `Navbar.tsx` (global navigation)
- **Feature Components**: Forms, tables, modals specific to each feature
- **Layout Components**: Different layouts for public vs protected pages

#### 5. **State Management**
- React hooks (`useState`, `useEffect`) for local component state
- Server-side data fetching in page components
- Client-side state for forms and UI interactions

---

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 15.1.6 | React framework with App Router |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **UI Library** | React | 19.0.0 | Component-based UI |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first CSS framework |
| **HTTP Client** | Axios | 1.7.9 | API requests |
| **Authentication** | JWT (jose) | 6.0.8 | Token verification |
| **Icons** | Heroicons | 2.2.0 | UI icons |
| **Linting** | ESLint | 9.x | Code quality |
| **Package Manager** | npm | - | Dependency management |

---

## 📦 Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software

1. **Node.js** (v20.x or higher - LTS recommended)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **PostgreSQL** (v14 or higher)
   - **Option A - Native Installation**:
     - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
     - macOS: `brew install postgresql@14`
     - Linux: `sudo apt-get install postgresql postgresql-contrib`
   
   - **Option B - Docker** (Recommended for development):
     ```bash
     docker run --name bookngo-postgres \
       -e POSTGRES_USER=bookngo \
       -e POSTGRES_PASSWORD=your_password \
       -e POSTGRES_DB=bookngo_db \
       -p 5432:5432 \
       -d postgres:14
     ```

3. **Git** (for version control)
   - Verify: `git --version`

4. **Code Editor** (Recommended: VS Code with extensions)
   - ESLint
   - Prettier
   - TypeScript and JavaScript Language Features

### Backend Requirements

- **BookNGo Backend API** must be running and accessible
- Backend should be configured with the same `JWT_SECRET` as the frontend
- Backend database should be initialized with required tables and seed data

---

## 🚀 Initial Setup Instructions

Follow these steps to set up the project from scratch:

### Step 1: Clone the Repository

```bash
# Clone the frontend repository
git clone <repository-url>
cd BookNGo-FE-CMS/bookngo-fe-cms

# ⚠️ IMPORTANT: The actual project is in the 'bookngo-fe-cms' subdirectory
# Always run npm commands from inside this directory!
```

### Step 2: Install Dependencies

```bash
# Make sure you're in the bookngo-fe-cms directory
cd bookngo-fe-cms

# Install all npm packages
npm install
```

This will install all dependencies listed in `package.json`, including:
- Next.js and React
- TypeScript and type definitions
- Tailwind CSS and PostCSS
- Axios for API calls
- Authentication libraries

### Step 3: Set Up PostgreSQL Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name bookngo-postgres \
  -e POSTGRES_USER=bookngo \
  -e POSTGRES_PASSWORD=bookngo123 \
  -e POSTGRES_DB=bookngo_db \
  -p 5432:5432 \
  -d postgres:14

# Verify container is running
docker ps
```

#### Option B: Native PostgreSQL Installation

1. **Install PostgreSQL** (if not already installed)
2. **Create Database**:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database and user
   CREATE DATABASE bookngo_db;
   CREATE USER bookngo WITH PASSWORD 'bookngo123';
   GRANT ALL PRIVILEGES ON DATABASE bookngo_db TO bookngo;
   \q
   ```

3. **Verify Connection**:
   ```bash
   psql -U bookngo -d bookngo_db -h localhost
   ```

### Step 4: Set Up Backend API

> **Note**: The frontend requires the backend API to be running. Coordinate with your team or follow the backend repository's setup instructions.

1. **Clone and set up the backend repository** (if you have access)
2. **Configure backend environment variables**:
   ```env
   DATABASE_URL=postgresql://bookngo:bookngo123@localhost:5432/bookngo_db
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=3000
   ```

3. **Run database migrations** (follow backend instructions)
4. **Seed initial data** (if available)
5. **Start the backend server**:
   ```bash
   # In the backend directory
   npm run dev
   # Backend should be running on http://localhost:3000
   ```

### Step 5: Configure Frontend Environment Variables

1. **Navigate to the project directory** and create `.env.local` file:

```bash
# Make sure you're in the bookngo-fe-cms directory
cd bookngo-fe-cms

# Create .env.local file
# On Windows PowerShell:
New-Item -Path .env.local -ItemType File

# On Windows CMD:
type nul > .env.local

# On macOS/Linux:
touch .env.local
```

2. **Add the following environment variables** to `.env.local`:

```env
# Backend API Configuration
SERVER_API_BASE_URL=http://localhost:3000

# JWT Secret (MUST match backend JWT_SECRET)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Optional: Auth0 Configuration (if using Auth0 in future)
# AUTH0_SECRET=
# AUTH0_BASE_URL=http://localhost:3001
# AUTH0_ISSUER_BASE_URL=
# AUTH0_CLIENT_ID=
# AUTH0_CLIENT_SECRET=
```

> **⚠️ Important**: 
> - The `JWT_SECRET` must **exactly match** the backend's `JWT_SECRET`
> - Never commit `.env.local` to version control (it should be in `.gitignore`)
> - Use strong, unique secrets in production

### Step 6: Verify Setup

1. **Check Node.js version**:
   ```bash
   node --version  # Should be v20.x or higher
   ```

2. **Verify dependencies installed**:
   ```bash
   npm list --depth=0
   ```

3. **Check PostgreSQL connection** (if using native installation):
   ```bash
   psql -U bookngo -d bookngo_db -h localhost -c "SELECT version();"
   ```

4. **Verify backend is running**:
   ```bash
   curl http://localhost:3000/health
   # Or open in browser: http://localhost:3000/health
   ```

---

## ▶️ Running the Application

> **⚠️ Important**: Make sure you're in the `bookngo-fe-cms` directory before running any npm commands!
> 
> ```bash
> # Navigate to the project directory
> cd bookngo-fe-cms
> ```

### Development Mode

1. **Navigate to the project directory** (if not already there):
   ```bash
   cd bookngo-fe-cms
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

   This will start the Next.js development server on `http://localhost:3000`

2. **Alternative: Start on custom port** (for CMS-specific port):
   ```bash
   npm run start:cms-frontend
   ```
   This starts the server on `http://localhost:3001`

3. **Open your browser** and navigate to:
   - `http://localhost:3000` (default)
   - `http://localhost:3001` (if using custom port)

4. **Login**:
   - Navigate to `/login`
   - Use credentials provided by your team or from the backend seed data
   - Upon successful login, you'll be redirected to the dashboard

### Production Build

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Starts dev server on port 3000 |
| CMS Frontend | `npm run start:cms-frontend` | Starts dev server on port 3001 |
| Build | `npm run build` | Creates optimized production build |
| Start | `npm start` | Runs production server |
| Lint | `npm run lint` | Runs ESLint to check code quality |

---

## 📁 Project Structure

```
bookngo-fe-cms/
├── docs/                          # Documentation
│   ├── README.md                  # This file
│   └── ProjectOnboarding.md       # Quick onboarding guide
├── public/                        # Static assets (images, icons, etc.)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (Public Pages)/        # Public route group
│   │   │   ├── layout.tsx         # Public layout (no Navbar)
│   │   │   ├── login/             # Login page
│   │   │   │   ├── page.tsx       # Login UI
│   │   │   │   └── api/           # Login API functions
│   │   │   │       └── login.ts
│   │   │   └── setup-password/    # Password setup page
│   │   │       └── page.tsx
│   │   ├── (Protected Pages)/     # Protected route group
│   │   │   ├── layout.tsx         # Protected layout (with Navbar)
│   │   │   ├── page.tsx           # Dashboard/home page
│   │   │   ├── activity/          # Activity management
│   │   │   │   ├── page.tsx       # Activity list
│   │   │   │   ├── add/           # Add activity page
│   │   │   │   ├── api/           # Activity API functions
│   │   │   │   ├── components/    # Activity components
│   │   │   │   └── types/         # TypeScript types
│   │   │   ├── inventory/         # Inventory management
│   │   │   ├── zone/              # Zone management
│   │   │   ├── team/              # Team management
│   │   │   ├── profile/           # User profile
│   │   │   └── unauthorized/     # Unauthorized access page
│   │   ├── styles/
│   │   │   └── globals.css        # Global styles
│   │   └── utils/
│   │       └── api.ts             # Centralized Axios instance
│   ├── components/
│   │   └── Navbar.tsx            # Global navigation component
│   └── middleware.ts             # Route protection middleware
├── .env.local                    # Environment variables (not in git)
├── eslint.config.mjs            # ESLint configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

### Key Directories Explained

- **`(Public Pages)`**: Routes accessible without authentication
- **`(Protected Pages)`**: Routes requiring valid JWT token
- **`api/`**: API wrapper functions for each feature module
- **`components/`**: Reusable React components
- **`types/`**: TypeScript type definitions
- **`utils/`**: Shared utility functions

---

## 🔑 Key Features

### 1. Authentication & Authorization

- **JWT-based Authentication**: Tokens stored in HTTP-only cookies
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full access to all routes
  - **Manager**: Restricted from `/activity/add`, `/inventory/add`, `/zone/add`
  - **Team**: Restricted from all add routes and `/team/` routes
- **Middleware Protection**: Automatic route protection on all requests

### 2. Feature Modules

Each feature module follows a consistent structure:

- **List Page** (`page.tsx`): Displays data in a table
- **Add Page** (`add/page.tsx`): Form to create new entries
- **API Functions** (`api/*.ts`): HTTP request wrappers
- **Components**: Reusable form, table, and modal components
- **Types**: TypeScript interfaces and types

### 3. API Integration

- Centralized Axios instance with base URL configuration
- Automatic cookie handling (`withCredentials: true`)
- Error handling and normalization
- Response interceptors for consistent error messages

### 4. UI/UX

- Responsive design with Tailwind CSS
- Mobile-friendly navigation (hamburger menu)
- Consistent form and table components
- Loading states and error handling

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SERVER_API_BASE_URL` | Backend API base URL | `http://localhost:3000` | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT verification | `your-secret-key` | ✅ Yes |

### Optional Variables (Future Use)

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH0_SECRET` | Auth0 secret (if using Auth0) | - |
| `AUTH0_BASE_URL` | Auth0 base URL | `http://localhost:3001` |
| `AUTH0_ISSUER_BASE_URL` | Auth0 issuer URL | - |
| `AUTH0_CLIENT_ID` | Auth0 client ID | - |
| `AUTH0_CLIENT_SECRET` | Auth0 client secret | - |

### Environment File Setup

Create `.env.local` in the project root:

```env
SERVER_API_BASE_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

> **⚠️ Security Note**: 
> - Never commit `.env.local` to version control
> - Use different secrets for development and production
> - Rotate secrets regularly in production

---

## 💻 Development Workflow

### Adding a New Feature

1. **Create feature directory** under `(Protected Pages)/`:
   ```bash
   mkdir -p src/app/\(Protected\ Pages\)/your-feature/{api,components,types}
   ```

2. **Create API functions** in `api/your-feature.ts`:
   ```typescript
   import api from '@/app/utils/api';
   
   export const fetchItems = async () => {
     const response = await api.get('/your-endpoint');
     return response.data;
   };
   ```

3. **Define TypeScript types** in `types/yourFeatureTypes.ts`

4. **Create components** (forms, tables, modals)

5. **Create pages** (`page.tsx` for list, `add/page.tsx` for creation)

6. **Update Navbar** if needed to add navigation link

7. **Update middleware** if role restrictions are needed

### Code Quality

- **Linting**: Run `npm run lint` before committing
- **Type Checking**: TypeScript will check types during build
- **Formatting**: Consider using Prettier for consistent code style

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make changes and commit: `git commit -m "Add: your feature description"`
3. Push and create pull request

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. **"Cannot connect to backend" Error**

**Problem**: Frontend cannot reach the backend API.

**Solutions**:
- Verify backend is running: `curl http://localhost:3000/health`
- Check `SERVER_API_BASE_URL` in `.env.local` matches backend URL
- Ensure backend CORS is configured to allow frontend origin
- Check firewall/network settings

#### 2. **"Invalid token" or Redirected to Login**

**Problem**: JWT token validation fails.

**Solutions**:
- Verify `JWT_SECRET` in `.env.local` matches backend `JWT_SECRET`
- Clear browser cookies and login again
- Check token expiration (backend may have expired the token)
- Restart both frontend and backend servers

#### 3. **PostgreSQL Connection Errors**

**Problem**: Backend cannot connect to database.

**Solutions**:
- Verify PostgreSQL is running: `docker ps` or `sudo systemctl status postgresql`
- Check database credentials in backend `.env`
- Verify port 5432 is not blocked
- Check PostgreSQL logs for errors

#### 4. **Port Already in Use**

**Problem**: Port 3000 or 3001 is already occupied.

**Solutions**:
```bash
# Find process using port (Windows)
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use different port
npm run start:cms-frontend  # Uses port 3001
```

#### 5. **Module Not Found Errors**

**Problem**: TypeScript or import errors.

**Solutions**:
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Restart your IDE/editor
- Check `tsconfig.json` paths configuration

#### 6. **Build Errors**

**Problem**: Production build fails.

**Solutions**:
- Check for TypeScript errors: `npx tsc --noEmit`
- Fix linting errors: `npm run lint`
- Ensure all environment variables are set
- Check for missing dependencies

### Getting Help

1. **Check logs**: Browser console and terminal output
2. **Verify setup**: Follow setup instructions step-by-step
3. **Check backend**: Ensure backend API is working correctly
4. **Team support**: Reach out to the development team

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---

## 🎓 Quick Start Checklist

Use this checklist to verify your setup:

- [ ] Node.js v20+ installed
- [ ] PostgreSQL installed and running
- [ ] Backend API repository cloned and set up
- [ ] Backend database initialized with migrations
- [ ] Backend server running on port 3000
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `.env.local` file created with correct variables
- [ ] `JWT_SECRET` matches between frontend and backend
- [ ] Frontend dev server starts without errors
- [ ] Can access login page at `http://localhost:3000/login`
- [ ] Can successfully login and access protected routes

---

## 📝 Notes

- This is a **frontend-only** repository. The backend API is a separate repository.
- Always coordinate backend changes with frontend updates.
- Database schema changes require backend migrations.
- JWT secrets must be synchronized between frontend and backend.

---

**Last Updated**: 2024
**Maintained By**: BookNGo Development Team

For questions or issues, please contact the development team or create an issue in the repository.
