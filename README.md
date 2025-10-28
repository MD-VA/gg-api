# Gaming Community API

A robust NestJS backend API that integrates with IGDB (Twitch) API to provide game data, manages user interactions, handles authentication, and serves a Flutter mobile application.

## 🎮 Overview

This API provides:
- **IGDB Integration**: Game catalogue, search, and detailed game information
- **User Authentication**: Firebase token verification + JWT
- **User Library**: Save games, mark as played, track play time
- **Comments System**: Create, read, update, delete comments on games
- **Affiliate Links**: Manage purchase links for games
- **Caching**: Redis caching for optimal performance
- **API Documentation**: Auto-generated Swagger/OpenAPI docs

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Authentication**: JWT + Firebase Admin SDK
- **External APIs**: IGDB API (Twitch OAuth)
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 22.x or higher
- npm 10.x or higher
- PostgreSQL 16
- Redis 7
- Docker & Docker Compose (optional but recommended)

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=gaming_user
DATABASE_PASSWORD=gaming_password
DATABASE_NAME=gaming_community_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Firebase (get from Firebase Console)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# IGDB/Twitch (register at https://dev.twitch.tv/)
TWITCH_CLIENT_ID=your-client-id
TWITCH_CLIENT_SECRET=your-client-secret
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Navigate to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file as `firebase-service-account.json` in the project root

### 4. Register for IGDB API Access

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Register a new application
3. Copy the Client ID and Client Secret to your `.env` file

### 5. Start Infrastructure with Docker

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Or run all services including the API
docker-compose up -d
```

### 6. Run Database Migrations

```bash
# Run migrations
npm run migration:run
```

### 7. Start the Development Server

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at:
- **API**: http://localhost:3000/api/v1
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/v1/health

## 📚 API Documentation

Once the server is running, visit http://localhost:3000/api-docs for interactive API documentation powered by Swagger.

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/login` - Verify Firebase token, get JWT
- `GET /api/v1/auth/me` - Get current user info

#### Games (IGDB)
- `GET /api/v1/games/categories/:category` - Get games by category
- `GET /api/v1/games/trending` - Get trending games
- `GET /api/v1/games/search?q={query}` - Search games
- `GET /api/v1/games/:id` - Get game details

#### User Library
- `GET /api/v1/user/games` - Get user's saved games
- `POST /api/v1/user/games/:gameId/save` - Save game
- `POST /api/v1/user/games/:gameId/played` - Mark as played
- `DELETE /api/v1/user/games/:gameId` - Remove from library

#### Comments
- `GET /api/v1/games/:gameId/comments` - Get comments
- `POST /api/v1/games/:gameId/comments` - Create comment
- `PUT /api/v1/comments/:commentId` - Update comment
- `DELETE /api/v1/comments/:commentId` - Delete comment

#### Affiliate
- `GET /api/v1/games/:gameId/affiliate-links` - Get purchase links

## 🗄️ Database

### Migrations

```bash
# Generate a new migration (auto-detects entity changes)
npm run migration:generate -- src/database/migrations/MigrationName

# Create an empty migration file
npm run migration:create -- src/database/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert
```

### Database Schema

The database includes the following tables:
- **users**: User accounts (linked to Firebase)
- **user_games**: User game library with save/played status
- **comments**: Game comments from users
- **affiliate_links**: Purchase links for games

## 🐳 Docker

### Development with Docker Compose

```bash
# Start all services (PostgreSQL, Redis, API)
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Build Docker Image

```bash
# Build the image
docker build -t gaming-api:latest .

# Run the container
docker run -p 3000:3000 --env-file .env gaming-api:latest
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📦 Project Structure

```
src/
├── config/              # Configuration files
│   ├── configuration.ts
│   ├── validation.ts
│   └── winston.config.ts
├── auth/                # Authentication module
├── users/               # User management
│   └── entities/
├── games/               # Game catalogue & IGDB integration
│   ├── igdb/
│   ├── entities/
│   └── dto/
├── comments/            # Comments system
│   ├── entities/
│   └── dto/
├── affiliate/           # Affiliate links
│   ├── entities/
│   └── dto/
├── common/              # Shared utilities
│   ├── filters/
│   ├── interceptors/
│   ├── decorators/
│   ├── guards/
│   └── interfaces/
├── database/            # Database migrations
│   ├── migrations/
│   └── seeds/
├── app.module.ts
└── main.ts
```

## 🔧 Scripts

```bash
# Development
npm run start:dev        # Start with hot reload
npm run start:debug      # Start with debugging

# Build
npm run build            # Build for production
npm run start:prod       # Run production build

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Database
npm run migration:run    # Run migrations
npm run migration:revert # Revert last migration
```

## 🔐 Security

- **Helmet**: Security headers
- **CORS**: Configurable CORS policy
- **Rate Limiting**: Global and endpoint-specific limits
- **Input Validation**: DTO validation with class-validator
- **JWT**: Secure token-based authentication
- **Environment Variables**: Sensitive data in .env files

## 📊 Performance

- **Redis Caching**: Aggressive caching for IGDB responses
  - Game details: 24 hours
  - Trending games: 6 hours
  - Search results: 1 hour
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management

## 🌍 Environment Variables

All environment variables are documented in `.env.example`. Key configurations:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | API port | 3000 |
| `DATABASE_HOST` | PostgreSQL host | localhost |
| `REDIS_HOST` | Redis host | localhost |
| `JWT_SECRET` | JWT signing secret | - |
| `TWITCH_CLIENT_ID` | IGDB API client ID | - |
| `FIREBASE_PROJECT_ID` | Firebase project ID | - |

## 📝 Development Workflow

1. Create a new feature branch
2. Make changes and test locally
3. Run linting and tests
4. Create a commit with descriptive message
5. Push and create a pull request

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres
```

### Redis Connection Issues
```bash
# Check if Redis is running
docker-compose ps

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### Migration Issues
```bash
# Check migration status
npm run typeorm -- migration:show -d src/database/data-source.ts

# Drop schema and re-run (WARNING: deletes data)
npm run schema:drop
npm run migration:run
```

## 📄 License

UNLICENSED - Private project

## 👥 Contributors

Development Team

## 🔗 Related Projects

- Flutter Mobile App (Coming soon)

## 📞 Support

For issues and questions, please create an issue in the repository.

---

**Happy Coding! 🎮**
