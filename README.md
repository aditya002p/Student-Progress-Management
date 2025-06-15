# Student Progress Management System - Project Structure

## Root Directory Structure

```
student-progress-management/
├── client/                          # React frontend
├── server/                          # Node.js backend
├── shared/                          # Shared utilities and types
├── docs/                           # Documentation
├── .gitignore
├── README.md
├── docker-compose.yml              # For local development
└── package.json                    # Root package.json for workspace management
```

## Client Structure (Vite + React Frontend)

```
client/
├── public/
│   ├── vite.svg
│   └── favicon.ico
├── src/
│   ├── components/                 # Reusable components
│   │   ├── common/
│   │   │   ├── Layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── UI/
│   │   │   │   ├── Button/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Table/
│   │   │   │   ├── Form/
│   │   │   │   ├── Charts/
│   │   │   │   └── ThemeToggle/
│   │   │   ├── LoadingSpinner/
│   │   │   └── ErrorBoundary/
│   │   ├── student/
│   │   │   ├── StudentTable/
│   │   │   │   ├── StudentTable.jsx
│   │   │   │   ├── StudentRow.jsx
│   │   │   │   └── StudentActions.jsx
│   │   │   ├── StudentForm/
│   │   │   │   ├── AddStudentForm.jsx
│   │   │   │   └── EditStudentForm.jsx
│   │   │   └── StudentProfile/
│   │   │       ├── StudentProfile.jsx
│   │   │       ├── ContestHistory/
│   │   │       │   ├── ContestHistory.jsx
│   │   │       │   ├── RatingGraph.jsx
│   │   │       │   └── ContestList.jsx
│   │   │       └── ProblemSolvingData/
│   │   │           ├── ProblemSolvingData.jsx
│   │   │           ├── ProblemStats.jsx
│   │   │           ├── RatingBarChart.jsx
│   │   │           └── SubmissionHeatmap.jsx
│   │   └── cron/
│   │       ├── CronSettings.jsx
│   │       └── SyncStatus.jsx
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── Students/
│   │   │   ├── StudentsPage.jsx
│   │   │   └── StudentDetailPage.jsx
│   │   ├── Settings/
│   │   │   └── SettingsPage.jsx
│   │   └── NotFound/
│   │       └── NotFound.jsx
│   ├── hooks/
│   │   ├── useApi.js
│   │   ├── useLocalStorage.js
│   │   ├── useTheme.js
│   │   ├── useDebounce.js
│   │   └── useInfiniteScroll.js
│   ├── services/
│   │   ├── api.js                  # Axios configuration
│   │   ├── studentService.js
│   │   ├── codeforcesService.js
│   │   ├── cronService.js
│   │   └── exportService.js
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── chartUtils.js
│   │   ├── csvUtils.js
│   │   ├── constants.js
│   │   └── validators.js
│   ├── context/
│   │   ├── ThemeContext.js
│   │   ├── AuthContext.js
│   │   └── StudentContext.js
│   ├── styles/
│   │   ├── index.css               # Global styles and Tailwind imports
│   │   ├── themes.css
│   │   └── components/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx                    # Vite entry point
├── index.html                      # Vite HTML template
├── package.json
├── vite.config.js                  # Vite configuration
├── tailwind.config.js
├── postcss.config.js
└── .env.example
```

## Server Structure (Node.js Backend)

```
server/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── cors.js
│   │   ├── email.js
│   │   └── cron.js
│   ├── controllers/
│   │   ├── studentController.js
│   │   ├── codeforcesController.js
│   │   ├── cronController.js
│   │   └── emailController.js
│   ├── models/
│   │   ├── Student.js
│   │   ├── CodeforcesData.js
│   │   ├── Contest.js
│   │   ├── Submission.js
│   │   ├── CronJob.js
│   │   └── EmailLog.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── students.js
│   │   ├── codeforces.js
│   │   ├── cron.js
│   │   └── export.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── logger.js
│   ├── services/
│   │   ├── codeforcesService.js
│   │   ├── emailService.js
│   │   ├── cronService.js
│   │   ├── csvService.js
│   │   └── inactivityService.js
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── validators.js
│   │   ├── constants.js
│   │   ├── logger.js
│   │   └── helpers.js
│   ├── jobs/
│   │   ├── dataSync.js
│   │   ├── inactivityCheck.js
│   │   └── emailReminder.js
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   └── app.js
├── logs/
├── uploads/
├── package.json
├── .env.example
├── Dockerfile
└── server.js
```

## Shared Directory

```
shared/
├── types/
│   ├── student.js
│   ├── codeforces.js
│   └── common.js
├── constants/
│   ├── api.js
│   ├── codeforces.js
│   └── validation.js
└── utils/
    ├── dateUtils.js
    └── validationSchemas.js
```

## Documentation Structure

```
docs/
├── README.md
├── API.md
├── DEPLOYMENT.md
├── ARCHITECTURE.md
├── SETUP.md
└── images/
    └── architecture-diagram.png
```

## Dependencies

### Root Package.json

```json
{
  "name": "student-progress-management",
  "version": "1.0.0",
  "description": "Student Progress Management System with Codeforces Integration",
  "private": true,
  "workspaces": [
    "client",
    "server"
  ],
  "scripts": {
    "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
    "server:dev": "cd server && npm run dev",
    "client:dev": "cd client && npm start",
    "build": "cd client && npm run build",
    "install:all": "npm install && cd client && npm install && cd ../server && npm install",
    "test": "cd server && npm test && cd ../client && npm test",
    "lint": "eslint . --ext .js,.jsx",
    "lint:fix": "eslint . --ext .js,.jsx --fix"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "eslint": "^8.57.0",
    "eslint-config-airbnb": "^19.0.4",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

### Client Dependencies (package.json)

```json
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "@tanstack/react-query": "^5.8.4",
    "@tanstack/react-query-devtools": "^5.8.4",
    "react-hook-form": "^7.48.2",
    "react-hot-toast": "^2.4.1",
    "recharts": "^2.8.0",
    "react-calendar-heatmap": "^1.9.0",
    "date-fns": "^2.30.0",
    "lodash": "^4.17.21",
    "clsx": "^2.0.0",
    "framer-motion": "^10.16.16",
    "react-icons": "^4.12.0",
    "@heroicons/react": "^2.0.18"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "vitest": "^1.0.4",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "jsdom": "^23.0.1"
  }
}
```

### Server Dependencies (package.json)

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "Backend API for Student Progress Management System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^7.1.5",
    "express-mongo-sanitize": "^2.2.0",
    "express-xss-sanitizer": "^1.2.0",
    "compression": "^1.7.4",
    "node-cron": "^3.0.3",
    "axios": "^1.6.2",
    "nodemailer": "^6.9.7",
    "csv-parser": "^3.0.0",
    "json2csv": "^6.1.0",
    "multer": "^1.4.5-lts.1",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "joi": "^17.11.0",
    "moment": "^2.29.4",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "@types/jest": "^29.5.8"
  }
}
```

## Configuration Files

### Vite Configuration Files

### Client - vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@context': path.resolve(__dirname, './src/context'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'react-icons', '@heroicons/react'],
          charts: ['recharts', 'react-calendar-heatmap'],
          utils: ['axios', 'date-fns', 'lodash']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js'
  }
})
```

### Client - index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Student Progress Management System</title>
    <meta name="description" content="Track and manage student progress with Codeforces integration" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Client - src/main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

import App from './App.jsx'
import { ThemeProvider } from '@context/ThemeContext'
import '@styles/index.css'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
            }}
          />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
```

### Client - src/styles/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './themes.css';

:root {
  /* Light theme variables */
  --toast-bg: #ffffff;
  --toast-color: #1f2937;
}

[data-theme="dark"] {
  /* Dark theme variables */
  --toast-bg: #374151;
  --toast-color: #f9fafb;
}

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700;
  }
  
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-400 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500 dark:bg-gray-500;
}

/* Animation keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Loading spinner */
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Dark mode spinner */
.dark .spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #60a5fa;
}
```

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        dark: {
          50: '#18181b',
          100: '#27272a',
          200: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Server - .env.example

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/student-progress-db
MONGODB_TEST_URI=mongodb://localhost:27017/student-progress-test-db

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Codeforces API
CODEFORCES_API_BASE_URL=https://codeforces.com/api

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@studentprogress.com

# Cron Job Settings
DEFAULT_CRON_TIME=0 2 * * *
DEFAULT_CRON_TIMEZONE=Asia/Kolkata

# Rate Limiting
RATE_LIMIT_WINDOW_MS=15
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs
```

### Client - .env.example

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
```

### docker-compose.yml (for development)

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: student-progress-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME=admin
      MONGO_INITDB_ROOT_PASSWORD=password123
      MONGO_INITDB_DATABASE=student-progress-db
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: student-progress-server
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://admin:password123@mongodb:27017/student-progress-db?authSource=admin
    depends_on:
      - mongodb
    volumes:
      - ./server:/app
      - /app/node_modules

volumes:
  mongodb_data:
```

### .gitignore

```gitignore
# Dependencies
node_modules/
*/node_modules/

# Production builds
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# MacOS
.DS_Store

# Windows
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Uploads
uploads/
```

## Key Features Implementation Notes

1. **Responsive Design**: Using Tailwind CSS with mobile-first approach
2. **Dark/Light Mode**: Context-based theme management with localStorage persistence
3. **Cron Jobs**: Node-cron for scheduled tasks with configurable timing
4. **Email Service**: Nodemailer with template-based emails
5. **CSV Export**: json2csv for data export functionality
6. **Charts**: Recharts for rating graphs and bar charts
7. **Heatmap**: react-calendar-heatmap for submission visualization
8. **API Integration**: Axios with retry logic for Codeforces API
9. **State Management**: React Query/TanStack Query for server state
10. **Form Handling**: React Hook Form with validation
11. **Error Handling**: Comprehensive error boundaries and middleware
12. **Logging**: Winston for structured logging
13. **Security**: Helmet, rate limiting, input sanitization
14. **Testing**: Jest and Testing Library setup

This structure provides a solid foundation for a production-level application with proper separation of concerns, scalability, and maintainability.