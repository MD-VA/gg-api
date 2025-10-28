import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchGamesDto {
  @ApiProperty({
    description: 'Search query for game name',
    example: 'The Witcher',
  })
  @IsNotEmpty()
  @IsString()
  q: string;

  @ApiProperty({
    description: 'Number of results to return',
    example: 10,
    required: false,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
