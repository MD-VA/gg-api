import { ApiProperty } from '@nestjs/swagger';
import {
  CommentType,
  CompletionStatus,
  DifficultyLevel,
  VoteType,
} from '../../common/enums';
import { CommentReactionsDto } from './react-comment.dto';

export class CommentAuthorDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  displayName: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  photoUrl?: string;
}

export class CommentResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 1942 })
  igdbGameId: number;

  @ApiProperty({ example: 'This is an amazing game!' })
  content: string;

  @ApiProperty({ example: false })
  isEdited: boolean;

  @ApiProperty({ type: CommentAuthorDto })
  author: CommentAuthorDto;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
    required: false,
  })
  parentCommentId?: string | null;

  @ApiProperty({ example: false })
  isSpoiler: boolean;

  @ApiProperty({ enum: CommentType, example: CommentType.DISCUSSION })
  commentType: CommentType;

  @ApiProperty({ example: 'PlayStation 5', nullable: true, required: false })
  platform?: string | null;

  @ApiProperty({
    enum: DifficultyLevel,
    example: DifficultyLevel.HARD,
    nullable: true,
    required: false,
  })
  difficultyLevel?: DifficultyLevel | null;

  @ApiProperty({
    enum: CompletionStatus,
    example: CompletionStatus.COMPLETED,
    nullable: true,
    required: false,
  })
  completionStatus?: CompletionStatus | null;

  @ApiProperty({ example: 45, nullable: true, required: false })
  playtimeHours?: number | null;

  @ApiProperty({ example: false })
  isPinned: boolean;

  @ApiProperty({ example: 42 })
  likesCount: number;

  @ApiProperty({ example: 3 })
  dislikesCount: number;

  @ApiProperty({ example: 5 })
  repliesCount: number;

  @ApiProperty({ example: 15 })
  helpfulCount: number;

  @ApiProperty({
    enum: VoteType,
    nullable: true,
    required: false,
    description: 'Current user vote (if authenticated)',
  })
  userVote?: VoteType | null;

  @ApiProperty({
    type: [CommentReactionsDto],
    required: false,
    description: 'Reactions summary',
  })
  reactions?: CommentReactionsDto[];

  @ApiProperty({
    type: [CommentResponseDto],
    required: false,
    description: 'Nested replies (if loaded)',
  })
  replies?: CommentResponseDto[];

  @ApiProperty({ example: '2025-10-28T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-28T12:00:00Z' })
  updatedAt: Date;
}

export class CommentsListResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  comments: CommentResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}
