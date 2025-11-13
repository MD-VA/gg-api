import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserLibraryService } from './user-library.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UpdateGameStatusDto } from './dto/update-game-status.dto';
import {
  UserGameResponseDto,
  EnrichedUserLibraryResponseDto,
} from './dto/user-game-response.dto';
import { ToggleSaveResponseDto } from './dto/toggle-save-response.dto';
import { TogglePlayedResponseDto } from './dto/toggle-played-response.dto';

@ApiTags('user-library')
@Controller('user/games')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class UserLibraryController {
  constructor(private userLibraryService: UserLibraryService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user game library',
    description:
      'Get all games saved in the authenticated user library with full IGDB data (name, cover, description, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'User game library with enriched IGDB game data',
    type: EnrichedUserLibraryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserLibrary(@CurrentUser() user: User) {
    const games = await this.userLibraryService.getEnrichedUserLibrary(user.id);
    const stats = await this.userLibraryService.getLibraryStats(user.id);

    return {
      games,
      total: stats.total,
      savedCount: stats.saved,
      playedCount: stats.played,
    };
  }

  @Post(':gameId/save')
  @ApiOperation({
    summary: 'Toggle save game',
    description:
      'Save or unsave a game in library (toggle behavior). If game is saved, it will be unsaved. If game is unsaved or not in library, it will be saved.',
  })
  @ApiParam({
    name: 'gameId',
    description: 'IGDB game ID',
    example: 1942,
  })
  @ApiResponse({
    status: 200,
    description: 'Game save status toggled successfully',
    type: ToggleSaveResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async toggleSaveGame(
    @CurrentUser() user: User,
    @Param('gameId', ParseIntPipe) gameId: number,
  ): Promise<ToggleSaveResponseDto> {
    const { userGame, action } = await this.userLibraryService.toggleSaveGame(
      user.id,
      gameId,
    );

    const message =
      action === 'saved'
        ? '🎮 Game added to your library!'
        : '📤 Game removed from your library';

    return {
      isSaved: userGame.isSaved,
      message,
      gameId: userGame.igdbGameId,
      isPlayed: userGame.isPlayed,
      savedAt: userGame.savedAt,
    };
  }

  @Post(':gameId/played')
  @ApiOperation({
    summary: 'Toggle played status',
    description:
      'Mark or unmark a game as played (toggle behavior). If game is marked as played, it will be unmarked. If game is not marked as played, it will be marked as played.',
  })
  @ApiParam({
    name: 'gameId',
    description: 'IGDB game ID',
    example: 1942,
  })
  @ApiResponse({
    status: 200,
    description: 'Game played status toggled successfully',
    type: TogglePlayedResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found in library',
  })
  async togglePlayed(
    @CurrentUser() user: User,
    @Param('gameId', ParseIntPipe) gameId: number,
  ): Promise<TogglePlayedResponseDto> {
    const { userGame, action } = await this.userLibraryService.togglePlayed(
      user.id,
      gameId,
    );

    const message =
      action === 'marked'
        ? '✅ Game marked as played!'
        : '🔄 Game unmarked as played';

    return {
      isPlayed: userGame.isPlayed,
      isSaved: userGame.isSaved,
      message,
      gameId: userGame.igdbGameId,
      playedAt: userGame.playedAt,
    };
  }

  @Patch(':gameId')
  @ApiOperation({
    summary: 'Update game status',
    description: 'Update game status (saved, played, play time)',
  })
  @ApiParam({
    name: 'gameId',
    description: 'IGDB game ID',
    example: 1942,
  })
  @ApiResponse({
    status: 200,
    description: 'Game status updated',
    type: UserGameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found in library',
  })
  async updateGameStatus(
    @CurrentUser() user: User,
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() updateDto: UpdateGameStatusDto,
  ) {
    return this.userLibraryService.updateGameStatus(user.id, gameId, updateDto);
  }

  @Delete(':gameId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove game from library',
    description: 'Remove a game from the user library',
  })
  @ApiParam({
    name: 'gameId',
    description: 'IGDB game ID',
    example: 1942,
  })
  @ApiResponse({
    status: 204,
    description: 'Game removed from library',
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found in library',
  })
  async removeGame(
    @CurrentUser() user: User,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    await this.userLibraryService.removeGame(user.id, gameId);
  }

  @Get(':gameId')
  @ApiOperation({
    summary: 'Get game status in library',
    description: 'Check if a game is in library and get its status',
  })
  @ApiParam({
    name: 'gameId',
    description: 'IGDB game ID',
    example: 1942,
  })
  @ApiResponse({
    status: 200,
    description: 'Game status',
    type: UserGameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found in library',
  })
  async getGameStatus(
    @CurrentUser() user: User,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    const userGame = await this.userLibraryService.getUserGame(user.id, gameId);

    if (!userGame) {
      return {
        inLibrary: false,
        isSaved: false,
        isPlayed: false,
      };
    }

    return {
      inLibrary: true,
      ...userGame,
    };
  }
}
