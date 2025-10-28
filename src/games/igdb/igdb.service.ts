import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IgdbAuthService } from './igdb-auth.service';
import axios, { AxiosInstance } from 'axios';
import { IGDBGame } from '../../common/interfaces/igdb-types.interface';

@Injectable()
export class IgdbService {
  private readonly logger = new Logger(IgdbService.name);
  private readonly apiUrl: string;
  private readonly clientId: string;
  private axiosInstance: AxiosInstance;

  constructor(
    private configService: ConfigService,
    private igdbAuthService: IgdbAuthService,
  ) {
    this.apiUrl = this.configService.get<string>('igdb.apiUrl', 'https://api.igdb.com/v4');
    this.clientId = this.configService.get<string>('igdb.clientId', '');

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Client-ID': this.clientId,
      },
    });
  }

  private async makeRequest<T>(
    endpoint: string,
    body: string,
  ): Promise<T> {
    try {
      const accessToken = await this.igdbAuthService.getAccessToken();

      const response = await this.axiosInstance.post<T>(endpoint, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'text/plain',
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `IGDB API request failed: ${error.response?.status} - ${error.response?.statusText}`,
          error.response?.data,
        );

        // If unauthorized, try refreshing token
        if (error.response?.status === 401) {
          this.logger.warn('IGDB token expired, refreshing...');
          await this.igdbAuthService.refreshToken();
          // Retry once with new token
          return this.makeRequest(endpoint, body);
        }
      }
      throw error;
    }
  }

  async searchGames(query: string, limit: number = 10): Promise<IGDBGame[]> {
    const body = `
      search "${query}";
      fields id, name, summary, cover.url, cover.image_id,
             first_release_date, rating, rating_count,
             genres.name, platforms.name, platforms.abbreviation;
      limit ${limit};
    `;

    this.logger.debug(`Searching games with query: ${query}`);
    return this.makeRequest<IGDBGame[]>('/games', body);
  }

  async getGameById(id: number): Promise<IGDBGame | null> {
    const body = `
      fields id, name, summary, storyline,
             cover.url, cover.image_id,
             artworks.url, artworks.image_id,
             screenshots.url, screenshots.image_id,
             genres.name,
             platforms.name, platforms.abbreviation,
             release_dates.date, release_dates.human, release_dates.platform.name,
             involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
             rating, rating_count,
             aggregated_rating, aggregated_rating_count,
             game_modes.name,
             themes.name,
             first_release_date,
             url;
      where id = ${id};
    `;

    this.logger.debug(`Fetching game details for ID: ${id}`);
    const results = await this.makeRequest<IGDBGame[]>('/games', body);
    return results.length > 0 ? results[0] : null;
  }

  async getGamesByCategory(
    category: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<IGDBGame[]> {
    let whereClause = '';

    switch (category.toLowerCase()) {
      case 'popular':
      case 'most-popular':
        whereClause = 'rating_count > 100';
        break;
      case 'trending':
        whereClause = 'first_release_date > 1640995200'; // Games from 2022 onwards
        break;
      case 'action':
        whereClause = 'genres = (4)'; // Action genre ID
        break;
      case 'adventure':
        whereClause = 'genres = (31)'; // Adventure genre ID
        break;
      case 'rpg':
        whereClause = 'genres = (12)'; // RPG genre ID
        break;
      case 'strategy':
        whereClause = 'genres = (15)'; // Strategy genre ID
        break;
      case 'sports':
        whereClause = 'genres = (14)'; // Sports genre ID
        break;
      default:
        whereClause = 'rating_count > 50';
    }

    const body = `
      fields id, name, summary, cover.url, cover.image_id,
             first_release_date, rating, rating_count,
             genres.name, platforms.name;
      where ${whereClause};
      sort rating_count desc;
      limit ${limit};
      offset ${offset};
    `;

    this.logger.debug(`Fetching games for category: ${category}`);
    return this.makeRequest<IGDBGame[]>('/games', body);
  }

  async getTrendingGames(limit: number = 20): Promise<IGDBGame[]> {
    // Get recently released games with high ratings
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const threeMonthsAgo = currentTimestamp - (90 * 24 * 60 * 60);

    const body = `
      fields id, name, summary, cover.url, cover.image_id,
             first_release_date, rating, rating_count,
             genres.name, platforms.name;
      where first_release_date > ${threeMonthsAgo}
            & first_release_date < ${currentTimestamp}
            & rating_count > 10;
      sort rating desc;
      limit ${limit};
    `;

    this.logger.debug('Fetching trending games');
    return this.makeRequest<IGDBGame[]>('/games', body);
  }

  async getPopularGames(limit: number = 20): Promise<IGDBGame[]> {
    const body = `
      fields id, name, summary, cover.url, cover.image_id,
             first_release_date, rating, rating_count,
             genres.name, platforms.name;
      where rating_count > 100;
      sort rating_count desc;
      limit ${limit};
    `;

    this.logger.debug('Fetching popular games');
    return this.makeRequest<IGDBGame[]>('/games', body);
  }
}
