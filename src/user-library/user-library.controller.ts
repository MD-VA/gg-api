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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UpdateGameStatusDto } from './dto/update-game-status.dto';
import {
  UserGameResponseDto,
  UserLibraryResponseDto,
} from './dto/user-game-response.dto';

@ApiTags('user-library')
@Controller('user/games')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserLibraryController {
  constructor(private userLibraryService: UserLibraryService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user game library',
    description: 'Get all games saved in the authenticated user library',
  })
  @ApiResponse({
    status: 200,
    description: 'User game library',
    type: UserLibraryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserLibrary(@CurrentUser() user: User) {
    const games = await this.userLibraryService.getUserLibrary(user.id);
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
    summary: 'Save game to library',
    description: 'Add a game to the user library',
  })
  @ApiParam({
    name: 'gameId',
    description: 'IGDB game ID',
    example: 1942,
  })
  @ApiResponse({
    status: 201,
    description: 'Game saved to library',
    type: UserGameResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Game already in library',
  })
  async saveGame(
    @CurrentUser() user: User,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    return this.userLibraryService.saveGame(user.id, gameId);
  }

  @Post(':gameId/played')
  @ApiOperation({
    summary: 'Mark game as played',
    description: 'Mark a game in library as played',
  })
  @ApiParam({
    name: 'gameId',
    description: 'IGDB game ID',
    example: 1942,
  })
  @ApiResponse({
    status: 200,
    description: 'Game marked as played',
    type: UserGameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found in library',
  })
  async markAsPlayed(
    @CurrentUser() user: User,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    return this.userLibraryService.markAsPlayed(user.id, gameId);
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
