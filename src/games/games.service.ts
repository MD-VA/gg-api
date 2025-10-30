import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IgdbService } from './igdb/igdb.service';
import { IGDBGame } from '../common/interfaces/igdb-types.interface';
import { UserGame } from './entities/user-game.entity';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private igdbService: IgdbService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(UserGame)
    private userGameRepository: Repository<UserGame>,
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

  async getGameById(id: number, userId?: string): Promise<IGDBGame> {
    const cacheKey = `game:${id}`;
    const cached = await this.cacheManager.get<IGDBGame>(cacheKey);

    let game: IGDBGame;

    if (cached) {
      this.logger.debug(`Cache hit for game ID: ${id}`);
      game = cached;
    } else {
      this.logger.debug(`Cache miss for game ID: ${id}`);
      const fetchedGame = await this.igdbService.getGameById(id);

      if (!fetchedGame) {
        throw new NotFoundException(`Game with ID ${id} not found`);
      }

      game = fetchedGame;

      // Cache game details for 24 hours
      const ttl = this.configService.get<number>('cache.gameDetails', 86400);
      await this.cacheManager.set(cacheKey, game, ttl * 1000);
    }

    // Add user-specific data if user is authenticated
    if (userId) {
      const userGame = await this.userGameRepository.findOne({
        where: { userId, igdbGameId: id },
      });

      if (userGame) {
        game.is_saved = userGame.isSaved;
        game.is_played = userGame.isPlayed;
      } else {
        // Game not in user's library
        game.is_saved = false;
        game.is_played = false;
      }
    } else {
      // Anonymous user - default to false
      game.is_saved = false;
      game.is_played = false;
    }

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
