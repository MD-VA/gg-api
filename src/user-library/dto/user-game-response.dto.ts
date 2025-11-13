import { ApiProperty } from '@nestjs/swagger';
import type { IGDBGame } from '../../common/interfaces/igdb-types.interface';

export class UserGameResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 1942 })
  igdbGameId: number;

  @ApiProperty({ example: true })
  isSaved: boolean;

  @ApiProperty({ example: false })
  isPlayed: boolean;

  @ApiProperty({ example: '2025-10-28T12:00:00Z' })
  savedAt: Date;

  @ApiProperty({ example: '2025-10-29T15:30:00Z', required: false })
  playedAt?: Date;

  @ApiProperty({ example: 50, required: false })
  playTimeHours?: number;

  @ApiProperty({ example: '2025-10-28T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-29T15:30:00Z' })
  updatedAt: Date;
}

export class EnrichedUserGameDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 1942 })
  igdbGameId: number;

  @ApiProperty({ example: true })
  isSaved: boolean;

  @ApiProperty({ example: false })
  isPlayed: boolean;

  @ApiProperty({ example: '2025-10-28T12:00:00Z', nullable: true })
  savedAt: Date | null;

  @ApiProperty({ example: '2025-10-29T15:30:00Z', required: false, nullable: true })
  playedAt?: Date | null;

  @ApiProperty({ example: 50, required: false })
  playTimeHours?: number;

  @ApiProperty({
    description: 'Full IGDB game data (name, cover, description, etc.)',
    required: false,
  })
  game?: IGDBGame;
}

export class UserLibraryResponseDto {
  @ApiProperty({ type: [UserGameResponseDto] })
  games: UserGameResponseDto[];

  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ example: 5 })
  savedCount: number;

  @ApiProperty({ example: 10 })
  playedCount: number;
}

export class EnrichedUserLibraryResponseDto {
  @ApiProperty({
    type: [EnrichedUserGameDto],
    description: 'User games with full IGDB data',
  })
  games: EnrichedUserGameDto[];

  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ example: 5 })
  savedCount: number;

  @ApiProperty({ example: 10 })
  playedCount: number;
}
