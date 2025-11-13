import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReactionType } from '../../common/enums';

export class ReactCommentDto {
  @ApiProperty({
    description: 'Type of reaction',
    enum: ReactionType,
    example: ReactionType.FIRE,
  })
  @IsEnum(ReactionType)
  reactionType: ReactionType;
}

export class ReactionResponseDto {
  @ApiProperty({
    description: 'Comment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  commentId: string;

  @ApiProperty({
    description: 'Reaction type',
    enum: ReactionType,
    example: ReactionType.FIRE,
  })
  reactionType: ReactionType;

  @ApiProperty({
    description: 'Whether the reaction was added or removed',
    example: true,
  })
  added: boolean;

  @ApiProperty({
    description: 'Total count of this reaction type on the comment',
    example: 15,
  })
  count: number;
}

export class CommentReactionsDto {
  @ApiProperty({
    description: 'Reaction type',
    enum: ReactionType,
    example: ReactionType.FIRE,
  })
  reactionType: ReactionType;

  @ApiProperty({
    description: 'Count of this reaction',
    example: 15,
  })
  count: number;

  @ApiProperty({
    description: 'Whether current user has this reaction',
    example: true,
  })
  userHasReacted: boolean;
}
