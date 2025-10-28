import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateGameStatusDto {
  @ApiProperty({
    description: 'Whether the game is saved in library',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSaved?: boolean;

  @ApiProperty({
    description: 'Whether the game has been played',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPlayed?: boolean;

  @ApiProperty({
    description: 'Estimated play time in hours',
    example: 50,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  playTimeHours?: number;
}
