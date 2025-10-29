import { ApiProperty } from '@nestjs/swagger';

export class ToggleSaveResponseDto {
  @ApiProperty({
    description: 'Whether the game is now saved',
    example: true,
  })
  isSaved: boolean;

  @ApiProperty({
    description: 'User-friendly message about the action performed',
    example: 'Game added to your library! 🎮',
  })
  message: string;

  @ApiProperty({
    description: 'The IGDB game ID',
    example: 1942,
  })
  gameId: number;

  @ApiProperty({
    description: 'Whether the game is marked as played',
    example: false,
  })
  isPlayed: boolean;

  @ApiProperty({
    description: 'When the game was saved (if currently saved)',
    example: '2025-10-29T14:30:00.000Z',
    required: false,
    nullable: true,
  })
  savedAt: Date | null;
}
