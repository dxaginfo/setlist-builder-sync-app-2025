# Setlist Builder + Sync

A comprehensive web application for musicians, bands, and performers to create, manage, and share setlists for rehearsals and performances.

## Features

- **User Authentication & Management**
  - Secure user accounts with JWT authentication
  - Band/group creation and member management with roles
  - User profiles with customizable settings

- **Song Library Management**
  - Add, edit, and delete songs with rich metadata
  - Import songs from Spotify API
  - Tag and categorize songs for easy filtering

- **Setlist Creation & Management**
  - Create and manage multiple setlists
  - Intuitive drag-and-drop interface for song arrangement
  - Set duration calculation and display
  - Multiple set/block support for longer shows

- **Real-time Syncing**
  - Cloud synchronization across devices
  - Share setlists with band members
  - Collaborative editing with permissions

- **Export & Integration**
  - Export setlists as PDF
  - Share setlists via link
  - Export to Spotify playlists

## Technology Stack

### Frontend
- React.js with TypeScript
- Redux Toolkit for state management
- Material-UI or Chakra UI for component library
- Axios for API communication
- Socket.io for real-time updates
- react-beautiful-dnd for drag-and-drop functionality

### Backend
- Node.js with Express
- RESTful API design with potential GraphQL implementation
- JWT with OAuth 2.0 for authentication
- Socket.io for real-time server events

### Database
- PostgreSQL for persistent data storage
- Redis for caching and real-time message queuing

### DevOps
- Docker for containerization
- AWS (EC2/ECS) or Vercel/Netlify for hosting
- GitHub Actions for CI/CD
- AWS CloudWatch or DataDog for monitoring

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v13 or higher)
- Redis (v6 or higher)

### Installation

1. Clone the repository
```bash
git clone https://github.com/dxaginfo/setlist-builder-sync-app-2025.git
cd setlist-builder-sync-app-2025
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# In the backend directory, create a .env file with the following:
cp .env.example .env
# Edit the .env file with your database credentials and JWT secret
```

4. Initialize the database
```bash
# In the backend directory
npm run db:migrate
npm run db:seed  # Optional: adds sample data
```

5. Start the development servers
```bash
# Start the backend server (from the backend directory)
npm run dev

# Start the frontend server (from the frontend directory)
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
setlist-builder-sync-app-2025/
├── backend/                  # Backend Node.js/Express API
│   ├── config/               # Configuration files
│   ├── controllers/          # Route controllers
│   ├── db/                   # Database migrations and seeds
│   ├── middleware/           # Express middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── utils/                # Utility functions
│   ├── .env.example          # Example environment variables
│   ├── package.json          # Backend dependencies
│   └── server.js             # Server entry point
│
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   ├── src/                  # Source files
│   │   ├── assets/           # Images, fonts, etc.
│   │   ├── components/       # Reusable components
│   │   ├── features/         # Feature-specific components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service calls
│   │   ├── store/            # Redux store setup
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Main App component
│   │   └── index.tsx         # Entry point
│   ├── package.json          # Frontend dependencies
│   └── tsconfig.json         # TypeScript configuration
│
├── .github/                  # GitHub Actions workflows
├── docker-compose.yml        # Docker Compose configuration
├── .gitignore                # Git ignore file
└── README.md                 # Project documentation
```

## API Documentation

The API documentation is available at `/api/docs` when running the development server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: [https://github.com/dxaginfo/setlist-builder-sync-app-2025](https://github.com/dxaginfo/setlist-builder-sync-app-2025)