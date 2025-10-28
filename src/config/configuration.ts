export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'gaming_user',
    password: process.env.DATABASE_PASSWORD || 'gaming_password',
    name: process.env.DATABASE_NAME || 'gaming_community_db',
    synchronize: process.env.DATABASE_SYNC === 'true',
    logging: process.env.DATABASE_LOGGING === 'true',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  },

  igdb: {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    apiUrl: process.env.IGDB_API_URL || 'https://api.igdb.com/v4',
    tokenCacheTtl: parseInt(process.env.IGDB_TOKEN_CACHE_TTL || '5184000', 10),
  },

  cache: {
    gameDetails: parseInt(process.env.CACHE_TTL_GAME_DETAILS || '86400', 10),
    trendingGames: parseInt(
      process.env.CACHE_TTL_TRENDING_GAMES || '21600',
      10,
    ),
    searchResults: parseInt(process.env.CACHE_TTL_SEARCH_RESULTS || '3600', 10),
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    fileError: process.env.LOG_FILE_ERROR || 'logs/error.log',
    fileCombined: process.env.LOG_FILE_COMBINED || 'logs/combined.log',
  },
});
