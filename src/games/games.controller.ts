import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GamesService } from './games.service';
import { SearchGamesDto } from './dto/search-games.dto';
import { GetGamesByCategoryDto } from './dto/get-games-by-category.dto';
import { GameResponseDto, GamesListResponseDto } from './dto/game-response.dto';
import { OptionalFirebaseAuthGuard } from '../auth/guards/optional-firebase-auth.guard';
import { OptionalUser } from '../common/decorators/optional-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search games by name',
    description: 'Search for games using IGDB API with caching (1 hour)',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    example: 'The Witcher',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of games matching the search query',
    type: GamesListResponseDto,
  })
  async searchGames(@Query() searchDto: SearchGamesDto) {
    const games = await this.gamesService.searchGames(
      searchDto.q,
      searchDto.limit,
    );
    return {
      games,
      count: games.length,
    };
  }

  @Get('trending')
  @ApiOperation({
    summary: 'Get trending games',
    description:
      'Get recently released games with high ratings (cached for 6 hours)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'List of trending games',
    type: GamesListResponseDto,
  })
  async getTrendingGames(@Query('limit', ParseIntPipe) limit: number = 20) {
    const games = await this.gamesService.getTrendingGames(limit);
    return {
      games,
      count: games.length,
    };
  }

  @Get('popular')
  @ApiOperation({
    summary: 'Get most popular games',
    description: 'Get games with highest rating counts (cached for 6 hours)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'List of popular games',
    type: GamesListResponseDto,
  })
  async getPopularGames(@Query('limit', ParseIntPipe) limit: number = 20) {
    const games = await this.gamesService.getPopularGames(limit);
    return {
      games,
      count: games.length,
    };
  }

  @Get('categories/:category')
  @ApiOperation({
    summary: 'Get games by category',
    description:
      'Get games filtered by category (action, adventure, rpg, etc.)',
  })
  @ApiParam({
    name: 'category',
    description: 'Game category',
    example: 'action',
    enum: [
      'popular',
      'trending',
      'action',
      'adventure',
      'rpg',
      'strategy',
      'sports',
    ],
  })
  @ApiResponse({
    status: 200,
    description: 'List of games in the category',
    type: GamesListResponseDto,
  })
  async getGamesByCategory(
    @Param('category') category: string,
    @Query() queryDto: GetGamesByCategoryDto,
  ) {
    const games = await this.gamesService.getGamesByCategory(
      category,
      queryDto.limit,
      queryDto.offset,
    );
    return {
      games,
      count: games.length,
    };
  }

  @Get(':id')
  @UseGuards(OptionalFirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get game details by ID',
    description:
      'Get detailed information about a game from IGDB (cached for 24 hours). If authenticated, includes user-specific data (is_saved, is_played). If not authenticated, these fields default to false.',
  })
  @ApiParam({
    name: 'id',
    description: 'IGDB game ID',
    example: 1942,
  })
  @ApiResponse({
    status: 200,
    description: 'Game details with user-specific status if authenticated',
    type: GameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found',
  })
  async getGameById(
    @Param('id', ParseIntPipe) id: number,
    @OptionalUser() user?: User,
  ) {
    return this.gamesService.getGameById(id, user?.id);
  }
}
