import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGame } from '../games/entities/user-game.entity';
import { UpdateGameStatusDto } from './dto/update-game-status.dto';
import { IgdbService } from '../games/igdb/igdb.service';
import { EnrichedUserGameDto } from './dto/user-game-response.dto';

@Injectable()
export class UserLibraryService {
  private readonly logger = new Logger(UserLibraryService.name);

  constructor(
    @InjectRepository(UserGame)
    private userGameRepository: Repository<UserGame>,
    private igdbService: IgdbService,
  ) {}

  async toggleSaveGame(
    userId: string,
    gameId: number,
  ): Promise<{ userGame: UserGame; action: 'saved' | 'unsaved' }> {
    // Check if game is already in library
    const existing = await this.userGameRepository.findOne({
      where: { userId, igdbGameId: gameId },
    });

    if (existing) {
      // Toggle the saved state
      if (existing.isSaved) {
        // Currently saved → unsave it
        existing.isSaved = false;
        existing.savedAt = null;
        const updated = await this.userGameRepository.save(existing);
        this.logger.log(
          `Unsaved game ${gameId} from library for user ${userId}`,
        );
        return { userGame: updated, action: 'unsaved' };
      } else {
        // Currently unsaved → save it
        existing.isSaved = true;
        existing.savedAt = new Date();
        const updated = await this.userGameRepository.save(existing);
        this.logger.log(
          `Restored game ${gameId} to library for user ${userId}`,
        );
        return { userGame: updated, action: 'saved' };
      }
    }

    // Create new entry (first time saving)
    const userGame = this.userGameRepository.create({
      userId,
      igdbGameId: gameId,
      isSaved: true,
      isPlayed: false,
      savedAt: new Date(),
    });

    const saved = await this.userGameRepository.save(userGame);
    this.logger.log(`Saved game ${gameId} to library for user ${userId}`);
    return { userGame: saved, action: 'saved' };
  }

  // Keep the old method for backward compatibility (deprecated)
  async saveGame(userId: string, gameId: number): Promise<UserGame> {
    const result = await this.toggleSaveGame(userId, gameId);
    return result.userGame;
  }

  async togglePlayed(
    userId: string,
    gameId: number,
  ): Promise<{ userGame: UserGame; action: 'marked' | 'unmarked' }> {
    // Check if game is in library
    const existing = await this.userGameRepository.findOne({
      where: { userId, igdbGameId: gameId },
    });

    if (!existing) {
      throw new NotFoundException('Game not found in library. Please save the game first.');
    }

    // Toggle the played state
    if (existing.isPlayed) {
      // Currently played → unmark it
      existing.isPlayed = false;
      existing.playedAt = null;
      const updated = await this.userGameRepository.save(existing);
      this.logger.log(
        `Unmarked game ${gameId} as played for user ${userId}`,
      );
      return { userGame: updated, action: 'unmarked' };
    } else {
      // Currently not played → mark it
      existing.isPlayed = true;
      existing.playedAt = new Date();
      const updated = await this.userGameRepository.save(existing);
      this.logger.log(
        `Marked game ${gameId} as played for user ${userId}`,
      );
      return { userGame: updated, action: 'marked' };
    }
  }

  // Keep the old method for backward compatibility (deprecated)
  async markAsPlayed(userId: string, gameId: number): Promise<UserGame> {
    const result = await this.togglePlayed(userId, gameId);
    return result.userGame;
  }

  async updateGameStatus(
    userId: string,
    gameId: number,
    updateDto: UpdateGameStatusDto,
  ): Promise<UserGame> {
    const userGame = await this.userGameRepository.findOne({
      where: { userId, igdbGameId: gameId },
    });

    if (!userGame) {
      throw new NotFoundException('Game not found in library');
    }

    if (updateDto.isSaved !== undefined) {
      userGame.isSaved = updateDto.isSaved;
    }

    if (updateDto.isPlayed !== undefined) {
      userGame.isPlayed = updateDto.isPlayed;
      if (updateDto.isPlayed && !userGame.playedAt) {
        userGame.playedAt = new Date();
      }
    }

    if (updateDto.playTimeHours !== undefined) {
      userGame.playTimeHours = updateDto.playTimeHours;
    }

    const updated = await this.userGameRepository.save(userGame);
    this.logger.log(`Updated game ${gameId} status for user ${userId}`);
    return updated;
  }

  async removeGame(userId: string, gameId: number): Promise<void> {
    const result = await this.userGameRepository.delete({
      userId,
      igdbGameId: gameId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Game not found in library');
    }

    this.logger.log(`Removed game ${gameId} from library for user ${userId}`);
  }

  async getUserLibrary(userId: string): Promise<UserGame[]> {
    return this.userGameRepository.find({
      where: { userId, isSaved: true },
      order: { savedAt: 'DESC' },
    });
  }

  async getEnrichedUserLibrary(userId: string): Promise<EnrichedUserGameDto[]> {
    // Get all saved games
    const userGames = await this.userGameRepository.find({
      where: { userId, isSaved: true },
      order: { savedAt: 'DESC' },
    });

    // Fetch IGDB data for each game
    const enrichedGames = await Promise.all(
      userGames.map(async (userGame) => {
        try {
          // Fetch game data from IGDB
          const igdbGame = await this.igdbService.getGameById(
            userGame.igdbGameId,
          );

          // If game found, include it in response
          if (igdbGame) {
            return {
              id: userGame.id,
              igdbGameId: userGame.igdbGameId,
              isSaved: userGame.isSaved,
              isPlayed: userGame.isPlayed,
              savedAt: userGame.savedAt,
              playedAt: userGame.playedAt,
              playTimeHours: userGame.playTimeHours,
              game: igdbGame, // Full IGDB game data
            };
          }

          // Game not found in IGDB, return without game data
          return {
            id: userGame.id,
            igdbGameId: userGame.igdbGameId,
            isSaved: userGame.isSaved,
            isPlayed: userGame.isPlayed,
            savedAt: userGame.savedAt,
            playedAt: userGame.playedAt,
            playTimeHours: userGame.playTimeHours,
          };
        } catch (error) {
          // If IGDB game not found, return without game data
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn(
            `Failed to fetch IGDB data for game ${userGame.igdbGameId}: ${errorMessage}`,
          );
          return {
            id: userGame.id,
            igdbGameId: userGame.igdbGameId,
            isSaved: userGame.isSaved,
            isPlayed: userGame.isPlayed,
            savedAt: userGame.savedAt,
            playedAt: userGame.playedAt,
            playTimeHours: userGame.playTimeHours,
            // Omit game property entirely instead of setting to undefined
          };
        }
      }),
    );

    return enrichedGames;
  }

  async getUserGame(userId: string, gameId: number): Promise<UserGame | null> {
    return this.userGameRepository.findOne({
      where: { userId, igdbGameId: gameId },
    });
  }

  async getLibraryStats(userId: string) {
    const allGames = await this.userGameRepository.find({
      where: { userId },
    });

    const savedGames = allGames.filter((g) => g.isSaved);
    const playedGames = allGames.filter((g) => g.isPlayed);

    return {
      total: savedGames.length,
      saved: savedGames.length,
      played: playedGames.length,
      totalPlayTime: allGames.reduce(
        (sum, g) => sum + (g.playTimeHours || 0),
        0,
      ),
    };
  }
}
