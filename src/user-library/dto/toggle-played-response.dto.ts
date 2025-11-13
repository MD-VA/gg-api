import { ApiProperty } from '@nestjs/swagger';

export class TogglePlayedResponseDto {
  @ApiProperty({
    description: 'Whether the game is marked as played',
    example: true,
  })
  isPlayed: boolean;

  @ApiProperty({
    description: 'Whether the game is saved in the library',
    example: true,
  })
  isSaved: boolean;

  @ApiProperty({
    description: 'Success message',
    example: '✅ Game marked as played!',
  })
  message: string;

  @ApiProperty({
    description: 'IGDB game ID',
    example: 1942,
  })
  gameId: number;

  @ApiProperty({
    description: 'Date when the game was marked as played',
    example: '2024-11-13T10:00:00.000Z',
    required: false,
    nullable: true,
  })
  playedAt?: Date | null;
}
