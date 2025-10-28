import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class SaveGameDto {
  @ApiProperty({
    description: 'IGDB game ID',
    example: 1942,
  })
  @IsInt()
  @IsPositive()
  gameId: number;
}
