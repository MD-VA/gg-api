import { ApiProperty } from '@nestjs/swagger';

export class GameCoverDto {
  @ApiProperty({ example: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1234.jpg' })
  url?: string;

  @ApiProperty({ example: 'co1234' })
  imageId?: string;
}

export class GameGenreDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'Role-playing (RPG)' })
  name: string;
}

export class GamePlatformDto {
  @ApiProperty({ example: 6 })
  id: number;

  @ApiProperty({ example: 'PC (Microsoft Windows)' })
  name: string;

  @ApiProperty({ example: 'PC' })
  abbreviation?: string;
}

export class GameResponseDto {
  @ApiProperty({ example: 1942 })
  id: number;

  @ApiProperty({ example: 'The Witcher 3: Wild Hunt' })
  name: string;

  @ApiProperty({
    example: 'An epic role-playing game set in a vast open world...',
    required: false
  })
  summary?: string;

  @ApiProperty({
    example: 'The story follows Geralt of Rivia...',
    required: false
  })
  storyline?: string;

  @ApiProperty({ type: GameCoverDto, required: false })
  cover?: GameCoverDto;

  @ApiProperty({
    example: 1431993600,
    description: 'Unix timestamp of first release date',
    required: false
  })
  firstReleaseDate?: number;

  @ApiProperty({ example: 95.5, required: false })
  rating?: number;

  @ApiProperty({ example: 1234, required: false })
  ratingCount?: number;

  @ApiProperty({ type: [GameGenreDto], required: false })
  genres?: GameGenreDto[];

  @ApiProperty({ type: [GamePlatformDto], required: false })
  platforms?: GamePlatformDto[];

  @ApiProperty({
    example: 'https://www.igdb.com/games/the-witcher-3-wild-hunt',
    required: false
  })
  url?: string;
}

export class GamesListResponseDto {
  @ApiProperty({ type: [GameResponseDto] })
  games: GameResponseDto[];

  @ApiProperty({ example: 20 })
  count: number;
}
