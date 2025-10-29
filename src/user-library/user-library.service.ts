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

@Injectable()
export class UserLibraryService {
  private readonly logger = new Logger(UserLibraryService.name);

  constructor(
    @InjectRepository(UserGame)
    private userGameRepository: Repository<UserGame>,
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

  async markAsPlayed(userId: string, gameId: number): Promise<UserGame> {
    const userGame = await this.userGameRepository.findOne({
      where: { userId, igdbGameId: gameId },
    });

    if (!userGame) {
      throw new NotFoundException('Game not found in library');
    }

    userGame.isPlayed = true;
    userGame.playedAt = new Date();

    const updated = await this.userGameRepository.save(userGame);
    this.logger.log(`Marked game ${gameId} as played for user ${userId}`);
    return updated;
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
