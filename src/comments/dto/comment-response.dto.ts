import { ApiProperty } from '@nestjs/swagger';

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
