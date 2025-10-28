# Quick Start Guide

## Prerequisites Checklist

Before running the application, ensure you have:

- [x] Node.js 22.x installed
- [x] npm 10.x installed
- [ ] Docker & Docker Compose installed
- [ ] Firebase project created
- [ ] Twitch Developer account for IGDB API

## Step-by-Step Setup

### 1. Start Database Services

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Verify services are running
docker-compose ps
```

Expected output:
```
NAME                      STATUS
gaming-api-postgres       Up
gaming-api-redis          Up
```

### 2. Configure Environment Variables

The `.env` file already exists. Update these required variables:

```bash
# Edit .env file
nano .env  # or use your preferred editor
```

**Required changes:**
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - From Firebase service account
- `FIREBASE_PRIVATE_KEY` - From Firebase service account
- `TWITCH_CLIENT_ID` - From Twitch Developer Console
- `TWITCH_CLIENT_SECRET` - From Twitch Developer Console

### 3. Set Up Firebase

1. Go to https://console.firebase.google.com/
2. Select/create your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file as `firebase-service-account.json` in the project root

### 4. Register for IGDB API

1. Go to https://dev.twitch.tv/console/apps
2. Click "Register Your Application"
3. Fill in:
   - Name: Gaming Community API
   - OAuth Redirect URLs: http://localhost:3000
   - Category: Application Integration
4. Copy Client ID and Client Secret to `.env`

### 5. Run Database Migrations

```bash
# Run migrations to create database tables
npm run migration:run
```

Expected output:
```
query: SELECT * FROM "migrations"
Migration InitialSchema1730116800000 has been executed successfully.
```

### 6. Start the Development Server

```bash
# Start with hot reload
npm run start:dev
```

Expected output:
```
[Nest] LOG [Bootstrap] 🚀 Application is running on: http://localhost:3000/api/v1
[Nest] LOG [Bootstrap] 📚 API Documentation: http://localhost:3000/api-docs
[Nest] LOG [Bootstrap] 🌍 CORS enabled for: http://localhost:3000, http://localhost:8080
```

### 7. Verify Installation

Open your browser and visit:

1. **API Health Check**: http://localhost:3000/api/v1/health
   - Should return: `{"status":"ok","timestamp":"...","uptime":...}`

2. **API Documentation**: http://localhost:3000/api-docs
   - Should show Swagger UI with all endpoints

3. **Welcome Message**: http://localhost:3000/api/v1
   - Should return: Welcome message

## Common Issues & Solutions

### Issue: Cannot connect to PostgreSQL

```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Issue: Cannot connect to Redis

```bash
# Check if Redis is running
docker-compose logs redis

# Test Redis connection
docker-compose exec redis redis-cli ping
# Should return: PONG
```

### Issue: Migration fails

```bash
# Check database connection in .env
# Ensure PostgreSQL is running
# Try running migrations again
npm run migration:run
```

### Issue: Build errors

```bash
# Clean build and reinstall dependencies
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

## Development Workflow

### Starting Development

```bash
# Start infrastructure
docker-compose up -d postgres redis

# Start API in watch mode
npm run start:dev
```

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Database Operations

```bash
# Create a new migration
npm run migration:create -- src/database/migrations/MyNewMigration

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Next Steps

Now that your API is running:

1. **Test Authentication**:
   - Set up Firebase Authentication in your Flutter app
   - Test the `/auth/login` endpoint with a Firebase token

2. **Configure IGDB**:
   - Test IGDB integration by calling `/games/trending`
   - Verify caching is working (check Redis)

3. **Start Building Features**:
   - Implement authentication module
   - Build game catalogue endpoints
   - Create user library management

4. **Read the Documentation**:
   - Full API docs: http://localhost:3000/api-docs
   - Project plan: See CLAUDE.md
   - Architecture: See README.md

## Useful Commands

```bash
# View API logs
npm run start:dev

# View Docker logs
docker-compose logs -f

# Check Docker services status
docker-compose ps

# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Build for production
npm run build
npm run start:prod
```

## Need Help?

- Check the full [README.md](README.md) for detailed documentation
- Review [CLAUDE.md](CLAUDE.md) for the project plan
- View API documentation at http://localhost:3000/api-docs

---

**You're all set! Happy coding! 🎮**
