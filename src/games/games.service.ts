import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { IgdbService } from './igdb/igdb.service';
import { IGDBGame } from '../common/interfaces/igdb-types.interface';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private igdbService: IgdbService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async searchGames(query: string, limit: number = 10): Promise<IGDBGame[]> {
    const cacheKey = `search:${query}:${limit}`;
    const cached = await this.cacheManager.get<IGDBGame[]>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for search: ${query}`);
      return cached;
    }

    this.logger.debug(`Cache miss for search: ${query}`);
    const results = await this.igdbService.searchGames(query, limit);

    // Cache search results for 1 hour
    const ttl = this.configService.get<number>('cache.searchResults', 3600);
    await this.cacheManager.set(cacheKey, results, ttl * 1000);

    return results;
  }

  async getGameById(id: number): Promise<IGDBGame> {
    const cacheKey = `game:${id}`;
    const cached = await this.cacheManager.get<IGDBGame>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for game ID: ${id}`);
      return cached;
    }

    this.logger.debug(`Cache miss for game ID: ${id}`);
    const game = await this.igdbService.getGameById(id);

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    // Cache game details for 24 hours
    const ttl = this.configService.get<number>('cache.gameDetails', 86400);
    await this.cacheManager.set(cacheKey, game, ttl * 1000);

    return game;
  }

  async getGamesByCategory(
    category: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<IGDBGame[]> {
    const cacheKey = `category:${category}:${limit}:${offset}`;
    const cached = await this.cacheManager.get<IGDBGame[]>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for category: ${category}`);
      return cached;
    }

    this.logger.debug(`Cache miss for category: ${category}`);
    const results = await this.igdbService.getGamesByCategory(
      category,
      limit,
      offset,
    );

    // Cache category results for 6 hours
    const ttl = this.configService.get<number>('cache.trendingGames', 21600);
    await this.cacheManager.set(cacheKey, results, ttl * 1000);

    return results;
  }

  async getTrendingGames(limit: number = 20): Promise<IGDBGame[]> {
    const cacheKey = `trending:${limit}`;
    const cached = await this.cacheManager.get<IGDBGame[]>(cacheKey);

    if (cached) {
      this.logger.debug('Cache hit for trending games');
      return cached;
    }

    this.logger.debug('Cache miss for trending games');
    const results = await this.igdbService.getTrendingGames(limit);

    // Cache trending games for 6 hours
    const ttl = this.configService.get<number>('cache.trendingGames', 21600);
    await this.cacheManager.set(cacheKey, results, ttl * 1000);

    return results;
  }

  async getPopularGames(limit: number = 20): Promise<IGDBGame[]> {
    const cacheKey = `popular:${limit}`;
    const cached = await this.cacheManager.get<IGDBGame[]>(cacheKey);

    if (cached) {
      this.logger.debug('Cache hit for popular games');
      return cached;
    }

    this.logger.debug('Cache miss for popular games');
    const results = await this.igdbService.getPopularGames(limit);

    // Cache popular games for 6 hours
    const ttl = this.configService.get<number>('cache.trendingGames', 21600);
    await this.cacheManager.set(cacheKey, results, ttl * 1000);

    return results;
  }
}
