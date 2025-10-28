import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';

interface TwitchAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable()
export class IgdbAuthService implements OnModuleInit {
  private readonly logger = new Logger(IgdbAuthService.name);
  private readonly CACHE_KEY = 'igdb_access_token';
  private readonly TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    // Pre-fetch token on startup
    try {
      await this.getAccessToken();
      this.logger.log('IGDB authentication initialized successfully');
    } catch (error) {
      this.logger.warn('Failed to initialize IGDB authentication', error);
    }
  }

  async getAccessToken(): Promise<string> {
    // Try to get token from cache
    const cachedToken = await this.cacheManager.get<string>(this.CACHE_KEY);
    if (cachedToken) {
      this.logger.debug('Using cached IGDB access token');
      return cachedToken;
    }

    // Fetch new token from Twitch
    this.logger.log('Fetching new IGDB access token from Twitch');
    const token = await this.fetchNewToken();

    // Cache the token
    const cacheTtl = this.configService.get<number>('igdb.tokenCacheTtl', 5184000);
    await this.cacheManager.set(this.CACHE_KEY, token, cacheTtl * 1000);

    return token;
  }

  private async fetchNewToken(): Promise<string> {
    const clientId = this.configService.get<string>('igdb.clientId');
    const clientSecret = this.configService.get<string>('igdb.clientSecret');

    if (!clientId || !clientSecret) {
      throw new Error(
        'IGDB credentials not configured. Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in .env',
      );
    }

    try {
      const response = await axios.post<TwitchAuthResponse>(
        this.TWITCH_AUTH_URL,
        null,
        {
          params: {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
          },
        },
      );

      this.logger.log(
        `Successfully obtained IGDB access token (expires in ${response.data.expires_in}s)`,
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error('Failed to obtain IGDB access token', error);
      throw new Error('Failed to authenticate with IGDB API');
    }
  }

  async refreshToken(): Promise<string> {
    this.logger.log('Manually refreshing IGDB access token');
    await this.cacheManager.del(this.CACHE_KEY);
    return this.getAccessToken();
  }
}
