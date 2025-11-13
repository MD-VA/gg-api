import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { VoteType } from '../../common/enums';

export class VoteCommentDto {
  @ApiProperty({
    description: 'Type of vote (like or dislike)',
    enum: VoteType,
    example: VoteType.LIKE,
  })
  @IsEnum(VoteType)
  voteType: VoteType;
}

export class VoteResponseDto {
  @ApiProperty({
    description: 'Comment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  commentId: string;

  @ApiProperty({
    description: 'User vote type (null if removed)',
    enum: VoteType,
    nullable: true,
    example: VoteType.LIKE,
  })
  userVote: VoteType | null;

  @ApiProperty({
    description: 'Total likes count',
    example: 42,
  })
  likesCount: number;

  @ApiProperty({
    description: 'Total dislikes count',
    example: 3,
  })
  dislikesCount: number;

  @ApiProperty({
    description: 'Action performed',
    example: 'liked',
    enum: ['liked', 'disliked', 'removed'],
  })
  action: 'liked' | 'disliked' | 'removed';
}
