# Black-Cross Frontend

Enterprise Cyber Threat Intelligence Platform - React + TypeScript Frontend

## Features

This frontend application provides a comprehensive user interface for all 15 primary features:

1. **Threat Intelligence Management** - Real-time threat monitoring and management
2. **Incident Response** - Complete incident lifecycle management
3. **Threat Hunting** - Advanced threat hunting capabilities
4. **Vulnerability Management** - CVE tracking and vulnerability management
5. **SIEM Integration** - Security event monitoring
6. **Threat Actor Profiling** - Track and analyze threat actors
7. **IoC Management** - Indicator of Compromise management
8. **Threat Intelligence Feeds** - Multi-source feed integration
9. **Risk Assessment & Scoring** - Comprehensive risk analysis
10. **Collaboration & Workflow** - Team coordination tools
11. **Reporting & Analytics** - Insights and visualization
12. **Malware Analysis** - Safe malware analysis environment
13. **Dark Web Monitoring** - Dark web threat intelligence
14. **Compliance & Audit** - Regulatory compliance support
15. **Automated Response** - SOAR capabilities

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm 7+

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your API URL if needed
# VITE_API_URL=http://localhost:8080/api/v1
```

### Development

```bash
# Start development server (runs on http://localhost:3000)
npm run dev
```

The frontend will proxy API requests to the backend running on port 8080.

### Building for Production

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Project Structure

```
client/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components (sidebar, header)
│   │   ├── common/       # Common/shared components
│   │   └── dashboard/    # Dashboard-specific components
│   ├── pages/            # Page components for each feature
│   │   ├── threats/      # Threat Intelligence pages
│   │   ├── incidents/    # Incident Response pages
│   │   ├── vulnerabilities/ # Vulnerability Management pages
│   │   ├── risk/         # Risk Assessment pages
│   │   └── ...          # Other feature pages
│   ├── services/         # API service layer
│   │   ├── api.ts        # Base API client
│   │   ├── authService.ts # Authentication API
│   │   └── threatService.ts # Threat Intelligence API
│   ├── store/            # Redux store
│   │   ├── slices/       # Redux slices
│   │   ├── hooks.ts      # Typed Redux hooks
│   │   └── index.ts      # Store configuration
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── styles/           # Global styles
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## API Integration

The frontend communicates with the Black-Cross backend API running on port 8080. All API calls are proxied through Vite's dev server to avoid CORS issues during development.

### Default Credentials

For testing purposes:
- **Email**: admin@black-cross.io
- **Password**: admin

## Key Components

### Authentication
- Login page with JWT token management
- Private route protection
- Automatic token refresh

### Layout
- Responsive sidebar navigation
- Top app bar with user menu
- Material-UI dark theme

### Feature Pages
- **Dashboard**: Overview with statistics and charts
- **Threats**: List, search, filter, and view threat details
- **Incidents**: Incident management and tracking
- **Vulnerabilities**: CVE tracking and management
- **Risk Assessment**: Risk scoring and analytics

## State Management

Redux Toolkit is used for global state management with the following slices:
- `auth` - Authentication state and user info
- `threats` - Threat intelligence data and filters
- Additional slices can be added for other features

## Contributing

1. Follow TypeScript best practices
2. Use Material-UI components consistently
3. Maintain proper type definitions
4. Write reusable components
5. Keep components focused and single-purpose

## License

MIT
