import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  IsUUID,
} from 'class-validator';
import {
  CommentType,
  CompletionStatus,
  DifficultyLevel,
} from '../../common/enums';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example:
      'This is an amazing game! The story is captivating and the gameplay is smooth.',
    minLength: 1,
    maxLength: 5000,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @ApiProperty({
    description: 'Parent comment ID for nested replies',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;

  @ApiProperty({
    description: 'Whether this comment contains spoilers',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSpoiler?: boolean;

  @ApiProperty({
    description: 'Type of comment',
    enum: CommentType,
    example: CommentType.DISCUSSION,
    required: false,
    default: CommentType.DISCUSSION,
  })
  @IsOptional()
  @IsEnum(CommentType)
  commentType?: CommentType;

  @ApiProperty({
    description: 'Platform the game was played on',
    example: 'PlayStation 5',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  platform?: string;

  @ApiProperty({
    description: 'Difficulty level when playing',
    enum: DifficultyLevel,
    example: DifficultyLevel.HARD,
    required: false,
  })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficultyLevel?: DifficultyLevel;

  @ApiProperty({
    description: 'Game completion status when commenting',
    enum: CompletionStatus,
    example: CompletionStatus.COMPLETED,
    required: false,
  })
  @IsOptional()
  @IsEnum(CompletionStatus)
  completionStatus?: CompletionStatus;

  @ApiProperty({
    description: 'User playtime hours when commenting',
    example: 45,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  playtimeHours?: number;
}
