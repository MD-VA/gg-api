# Project Plan – Gaming Community API (NestJS)
**Phase 1: Core Backend & IGDB Integration**

## 1. Project Overview
- **Name:** Gaming Community API
- **Purpose:** Build a robust NestJS backend API that integrates with IGDB (Twitch) API to provide game data, manages user interactions (saves, played status, comments), handles authentication, and serves the Flutter mobile app.
- **Primary consumers:** Flutter mobile app (iOS & Android)
- **Tech stack (Phase 1):**
  - Backend Framework: NestJS (Node.js/TypeScript)
  - Database: PostgreSQL (with TypeORM)
  - Cache: Redis (for API response caching and rate limiting)
  - Authentication: JWT + Firebase Admin SDK (to verify Firebase tokens from Flutter app)
  - External APIs: IGDB API (via Twitch OAuth)
  - API Documentation: Swagger/OpenAPI
  - Deployment: Docker containers (ready for cloud deployment)
- **Goals of Phase 1:**
  - Establish core API architecture with modular, scalable structure
  - Integrate IGDB API for game catalogue, search, and detailed game information
  - Implement user authentication flow (verify Firebase tokens, issue JWT)
  - Build core endpoints: games catalogue, game details, user game status (save/played), basic comments
  - Set up database schema and migrations
  - Implement caching strategy to optimize IGDB API usage and reduce costs
  - Prepare affiliate link management system
  - Ensure API is production-ready with proper error handling, validation, logging

## 2. Scope – What's included in this phase

### Must-have features (for MVP Phase 1):

#### Authentication & User Management
1. **Firebase Token Verification**: Endpoint to verify Firebase auth tokens from Flutter app
2. **JWT Issuance**: Generate and return JWT tokens for authenticated API access
3. **User Profile Creation**: Auto-create user profile on first login (store user ID, email, display name from Firebase)
4. **Protected Routes**: Middleware to validate JWT tokens for protected endpoints

#### IGDB Integration
5. **IGDB Authentication**: Implement Twitch OAuth flow to obtain IGDB API access tokens (server-to-server)
6. **Game Catalogue Endpoints**:
   - GET `/games/categories/:category` - Fetch games by category (Most Popular, Action, Adventure, etc.)
   - GET `/games/search?q={query}` - Search games by name
   - GET `/games/trending` - Get trending/popular games
7. **Game Details Endpoint**:
   - GET `/games/:id` - Fetch detailed game information (title, cover, description, platforms, release date, genres, ratings, screenshots)
8. **IGDB Response Caching**: Redis caching layer to store IGDB responses (configurable TTL)
9. **Rate Limiting**: Implement rate limiting to respect IGDB API limits

#### User Game Interactions
10. **User Game Library**:
    - POST `/user/games/:gameId/save` - Save game to user's library
    - POST `/user/games/:gameId/played` - Mark game as played
    - DELETE `/user/games/:gameId` - Remove game from library
    - GET `/user/games` - Get user's saved games with played status
11. **Game Status Tracking**: Store user-game relationships (saved, played, date added, play time estimate)

#### Comments System
12. **Basic Comments**:
    - POST `/games/:gameId/comments` - Create comment on a game
    - GET `/games/:gameId/comments` - Get comments for a game (paginated)
    - PUT `/comments/:commentId` - Edit own comment
    - DELETE `/comments/:commentId` - Delete own comment
13. **Comment Metadata**: Track comment author, timestamp, edit history

#### Affiliate Links
14. **Affiliate Link Management**:
    - GET `/games/:gameId/affiliate-links` - Get purchase/store links for a game
    - Admin endpoint to manage affiliate URLs

#### API Infrastructure
15. **Database Setup**: PostgreSQL with TypeORM, migrations, seeding
16. **Swagger Documentation**: Auto-generated API docs with examples
17. **Error Handling**: Global exception filter with standardized error responses
18. **Request Validation**: DTOs with class-validator for all endpoints
19. **Logging**: Structured logging (Winston) for debugging and monitoring
20. **Health Check**: GET `/health` endpoint for monitoring

### Out-of-scope for Phase 1 (later phases):
- Social features (followers, friends, activity feed)
- Comment likes, replies, nested comments
- User-generated content (reviews, ratings beyond comments)
- Real-time features (WebSocket notifications, live comments)
- Advanced search filters (by platform, genre, release year, etc.)
- User achievements/badges system
- Image upload and storage
- Email notifications
- Admin panel/dashboard
- Analytics and reporting
- Payment processing
- Content moderation tools (auto-flagging, review queue)
- Multi-language support for game descriptions
- Game recommendation engine

## 3. Timeline & Milestones

| Week | Milestone / Deliverable |
|------|-------------------------|
| **Week 1** | Project setup: NestJS scaffold, database setup (PostgreSQL + TypeORM), Docker configuration. IGDB API research and authentication flow implementation. Define database schema and create initial migrations. Set up environment configuration. |
| **Week 2** | Implement authentication module (Firebase token verification + JWT). Build IGDB integration module (game catalogue, search, details endpoints). Implement Redis caching layer. Create user and game entity models. |
| **Week 3** | Build user game library endpoints (save, played, retrieve). Implement comments module (CRUD operations). Add request validation and error handling. Implement rate limiting. Create Swagger documentation. |
| **Week 4** | Integration testing of all endpoints. Performance optimization (caching strategy refinement, database indexing). Security audit (CORS, helmet, rate limiting). Prepare deployment configuration (Docker Compose for staging). End-to-end testing with Flutter app mock/Postman. Document API for frontend team. |

## 4. Architecture & Technical Considerations

### Project Structure (NestJS Modules)
```
src/
├── main.ts
├── app.module.ts
├── config/
│   ├── configuration.ts          # Environment config
│   └── validation.ts              # Config validation schema
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── firebase.strategy.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── dto/
│       └── auth.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── dto/
│       └── user.dto.ts
├── games/
│   ├── games.module.ts
│   ├── games.controller.ts
│   ├── games.service.ts
│   ├── igdb/
│   │   ├── igdb.service.ts       # IGDB API client
│   │   └── igdb-auth.service.ts  # Twitch OAuth
│   ├── entities/
│   │   └── user-game.entity.ts   # User-game relationship
│   └── dto/
│       ├── game-query.dto.ts
│       └── game-response.dto.ts
├── comments/
│   ├── comments.module.ts
│   ├── comments.controller.ts
│   ├── comments.service.ts
│   ├── entities/
│   │   └── comment.entity.ts
│   └── dto/
│       ├── create-comment.dto.ts
│       └── update-comment.dto.ts
├── affiliate/
│   ├── affiliate.module.ts
│   ├── affiliate.controller.ts
│   ├── affiliate.service.ts
│   ├── entities/
│   │   └── affiliate-link.entity.ts
│   └── dto/
│       └── affiliate.dto.ts
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── cache.interceptor.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── guards/
│   │   └── throttle.guard.ts
│   └── interfaces/
│       └── igdb-types.interface.ts
└── database/
    ├── migrations/
    └── seeds/
```

### Database Schema (PostgreSQL)

**Users Table**
```sql
- id (UUID, primary key)
- firebase_uid (string, unique, indexed)
- email (string, unique)
- display_name (string, nullable)
- photo_url (string, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

**User_Games Table** (many-to-many with status)
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key → users.id)
- igdb_game_id (integer, indexed)
- is_saved (boolean, default true)
- is_played (boolean, default false)
- saved_at (timestamp)
- played_at (timestamp, nullable)
- play_time_hours (integer, nullable)
- created_at (timestamp)
- updated_at (timestamp)
- UNIQUE constraint on (user_id, igdb_game_id)
```

**Comments Table**
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key → users.id)
- igdb_game_id (integer, indexed)
- content (text)
- is_edited (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)
- deleted_at (timestamp, nullable, for soft delete)
```

**Affiliate_Links Table**
```sql
- id (UUID, primary key)
- igdb_game_id (integer, indexed)
- platform (string, e.g., 'steam', 'epic', 'playstation')
- url (string)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
```

### IGDB Integration Strategy

**Authentication Flow:**
1. Server obtains Twitch App Access Token using Client ID and Client Secret
2. Token stored in Redis with auto-refresh mechanism (tokens expire after ~60 days)
3. All IGDB requests use this token in headers

**Key IGDB Endpoints to Use:**
- `/games` - Game catalogue with filtering
- `/games/{id}` - Game details
- `/covers` - Game cover art
- `/platforms` - Gaming platforms
- `/genres` - Game genres
- `/game_modes` - Single-player, multiplayer, etc.
- `/involved_companies` - Developers/publishers

**Caching Strategy:**
- Game details: 24 hours (games rarely change)
- Popular/trending lists: 6 hours
- Search results: 1 hour
- User-specific data: No cache (always fresh from DB)

**Rate Limiting:**
- IGDB allows 4 requests/second
- Implement token bucket algorithm
- Queue requests if needed
- Return cached data when rate limit hit

### Authentication Flow

1. **Flutter App → API Login:**
   - Flutter sends Firebase ID token to `/auth/login`
   - API verifies token with Firebase Admin SDK
   - API checks if user exists in DB, creates if new
   - API generates JWT token (with user ID in payload)
   - Returns JWT + user info to Flutter

2. **Subsequent Requests:**
   - Flutter includes JWT in Authorization header: `Bearer {token}`
   - JWT Guard validates token on protected routes
   - User ID extracted from JWT payload
   - User object attached to request for use in controllers

### API Response Format (Standardized)

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-10-28T12:00:00Z",
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "GAME_NOT_FOUND",
    "message": "Game with ID 12345 not found",
    "statusCode": 404
  },
  "meta": {
    "timestamp": "2025-10-28T12:00:00Z"
  }
}
```

### Security Considerations

1. **Environment Variables**: All secrets in `.env` (never committed)
2. **CORS**: Configure for Flutter app domains only
3. **Helmet**: Security headers middleware
4. **Rate Limiting**: Global rate limit (100 req/15min per IP) + endpoint-specific limits
5. **Input Validation**: All DTOs validated with class-validator
6. **SQL Injection**: TypeORM parameterized queries
7. **JWT Expiration**: Tokens expire after 7 days, refresh mechanism in Phase 2
8. **HTTPS Only**: Enforce in production

### Infrastructure & DevOps

**Docker Setup:**
- `Dockerfile` for NestJS app
- `docker-compose.yml` with services: API, PostgreSQL, Redis
- Separate configs for development and production

**Environment Variables:**
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/gaming_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
FIREBASE_PROJECT_ID=your-project
TWITCH_CLIENT_ID=your-client-id
TWITCH_CLIENT_SECRET=your-secret
IGDB_API_URL=https://api.igdb.com/v4
```

**Logging:**
- Winston for structured logging
- Log levels: error, warn, info, debug
- Separate log files for errors and general logs
- Log rotation for production

## 5. Key API Endpoints (Phase 1)

### Authentication
- `POST /auth/login` - Verify Firebase token, return JWT
- `GET /auth/me` - Get current user info (protected)

### Games (IGDB)
- `GET /games/categories/:category` - Get games by category
- `GET /games/trending` - Get trending games
- `GET /games/search` - Search games (query param: `q`)
- `GET /games/:id` - Get game details by IGDB ID

### User Library
- `GET /user/games` - Get user's saved games
- `POST /user/games/:gameId/save` - Save game
- `POST /user/games/:gameId/played` - Mark as played
- `PATCH /user/games/:gameId` - Update game status
- `DELETE /user/games/:gameId` - Remove from library

### Comments
- `GET /games/:gameId/comments` - Get comments (paginated)
- `POST /games/:gameId/comments` - Create comment
- `PUT /comments/:commentId` - Update comment
- `DELETE /comments/:commentId` - Delete comment

### Affiliate
- `GET /games/:gameId/affiliate-links` - Get purchase links

### System
- `GET /health` - Health check
- `GET /api-docs` - Swagger documentation

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| IGDB API rate limits hit frequently | High | Implement aggressive caching, request queuing, and graceful degradation with cached data |
| IGDB API changes or deprecation | High | Abstract IGDB service behind interface, monitor API changelog, implement versioning |
| Database performance issues with user game relationships | Medium | Proper indexing (user_id, igdb_game_id), pagination for large result sets, query optimization |
| Firebase Admin SDK token verification slow | Medium | Cache valid tokens temporarily (short TTL), implement timeout handling |
| JWT token security concerns | High | Short expiration (7 days), secure secret storage, implement token refresh in Phase 2, consider token blacklist |
| IGDB authentication token expires unexpectedly | Medium | Auto-refresh mechanism with retry logic, alert monitoring for auth failures |
| Slow response times for game catalogue | Medium | Pre-cache popular categories, implement CDN for images, lazy loading |
| Comment spam/abuse | Low (Phase 1) | Basic rate limiting in Phase 1, content moderation tools in Phase 2 |

## 7. Metrics of Success (for Phase 1)

- ✅ All authentication flows work: Firebase token verification, JWT issuance, protected routes
- ✅ IGDB integration stable: Can fetch game catalogue, search, and details with <500ms response time (cached)
- ✅ User can save games, mark as played, retrieve library via API
- ✅ Comments can be created, retrieved, updated, deleted
- ✅ API handles 100 concurrent requests without errors
- ✅ 95% cache hit rate for IGDB game details
- ✅ Swagger documentation complete and accurate
- ✅ Zero security vulnerabilities in dependencies (npm audit)
- ✅ End-to-end tested with Postman/automated tests
- ✅ Successfully integrates with Flutter app (basic flows)

## 8. Testing Strategy

### Unit Tests
- Service layer logic (games service, auth service, comments service)
- IGDB response parsing and transformation
- JWT generation and verification
- Target: >80% code coverage

### Integration Tests
- Database operations (create, read, update, delete)
- IGDB API integration (with mocked responses)
- Auth flow end-to-end
- Target: All critical paths covered

### E2E Tests
- Complete user flows: login → save game → add comment
- API endpoint tests with real database (test DB)
- Performance tests (response time, concurrent users)

### Load Testing
- Use Artillery or k6 for load testing
- Test 100-500 concurrent users
- Identify bottlenecks

## 9. Backlog for Phase 2 (Future)

**Social Features:**
- User profiles with avatars
- Follow/unfollow users
- Activity feed (friends' recent games, comments)
- User reputation/karma system

**Enhanced Comments:**
- Like/dislike comments
- Nested replies (threaded discussions)
- Mention users (@username)
- Report inappropriate content

**Advanced Game Features:**
- User reviews with star ratings
- Game recommendations based on library
- Compare games side-by-side
- Wishlist functionality
- Game collections/lists (e.g., "Best RPGs 2024")

**Search & Discovery:**
- Advanced filters (platform, genre, release year, rating)
- Autocomplete for search
- Similar games suggestions
- "Games you might like" algorithm

**Real-time Features:**
- WebSocket for live comments
- Push notifications (via Firebase Cloud Messaging)
- Real-time activity indicators

**Content & Media:**
- Image/video upload for comments
- Screenshot gallery for games
- Trailer integration (YouTube API)

**Monetization:**
- Affiliate tracking and analytics
- Revenue reporting
- Dynamic affiliate link generation

**Admin & Moderation:**
- Admin dashboard
- Content moderation queue
- User ban/suspension system
- Analytics dashboard

**Performance & Scale:**
- Read replicas for database
- Microservices architecture (if needed)
- GraphQL API (alternative to REST)
- Elasticsearch for better search

**Localization:**
- Multi-language support
- Localized game descriptions (if IGDB supports)

**Analytics:**
- User engagement metrics
- Popular games tracking
- API usage analytics
- Business intelligence reports

---

## 10. Getting Started (Week 1 Checklist)

- [ ] Initialize NestJS project: `nest new gaming-community-api`
- [ ] Set up Git repository and `.gitignore`
- [ ] Install dependencies: TypeORM, PostgreSQL, Redis, Passport, JWT, Firebase Admin, Axios
- [ ] Create `.env.example` and document environment variables
- [ ] Set up Docker Compose with PostgreSQL and Redis
- [ ] Register Twitch Developer Application for IGDB API access
- [ ] Set up Firebase project and download service account JSON
- [ ] Create initial database migrations (users, user_games tables)
- [ ] Implement IGDB authentication service and test API connection
- [ ] Set up Swagger module for API documentation
- [ ] Configure logging with Winston
- [ ] Create project documentation in README.md

---

**Next Steps:** Once Phase 1 is complete, conduct a retrospective with the team, gather feedback from Flutter app integration, and prioritize Phase 2 features based on user feedback and business goals.
