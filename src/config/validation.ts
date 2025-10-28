import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  // Database
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_SYNC: Joi.boolean().default(false),
  DATABASE_LOGGING: Joi.boolean().default(false),

  // Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_TTL: Joi.number().default(3600),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('7d'),

  // Firebase
  FIREBASE_PROJECT_ID: Joi.string().optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_PATH: Joi.string().optional(),

  // IGDB
  TWITCH_CLIENT_ID: Joi.string().optional(),
  TWITCH_CLIENT_SECRET: Joi.string().optional(),
  IGDB_API_URL: Joi.string().default('https://api.igdb.com/v4'),
  IGDB_TOKEN_CACHE_TTL: Joi.number().default(5184000),

  // Cache TTL
  CACHE_TTL_GAME_DETAILS: Joi.number().default(86400),
  CACHE_TTL_TRENDING_GAMES: Joi.number().default(21600),
  CACHE_TTL_SEARCH_RESULTS: Joi.number().default(3600),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),

  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  LOG_FILE_ERROR: Joi.string().default('logs/error.log'),
  LOG_FILE_COMBINED: Joi.string().default('logs/combined.log'),
});
