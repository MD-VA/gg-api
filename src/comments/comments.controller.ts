import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import {
  CommentResponseDto,
  CommentsListResponseDto,
} from './dto/comment-response.dto';

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('games/:gameId/comments')
  @ApiOperation({
    summary: 'Get comments for a game',
    description: 'Get paginated comments for a specific game',
  })
  @ApiParam({
    name: 'gameId',
    description: 'IGDB game ID',
    example: 1942,
  })
  @ApiResponse({
    status: 200,
    description: 'List of comments',
    type: CommentsListResponseDto,
  })
  async getGameComments(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Query() queryDto: GetCommentsDto,
  ) {
    const { comments, total } = await this.commentsService.getCommentsByGame(
      gameId,
      queryDto.page,
      queryDto.limit,
    );

    return {
      comments: comments.map((comment) => ({
        id: comment.id,
        igdbGameId: comment.igdbGameId,
        content: comment.content,
        isEdited: comment.isEdited,
        author: {
          id: comment.user.id,
          displayName: comment.user.displayName || 'Anonymous',
          photoUrl: comment.user.photoUrl,
        },
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
      total,
      page: queryDto.page,
      limit: queryDto.limit,
    };
  }

  @Post('games/:gameId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a comment on a game',
    description: 'Post a new comment on a game (requires authentication)',
  })
  @ApiParam({
    name: 'gameId',
    description: 'IGDB game ID',
    example: 1942,
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async createComment(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() createDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    const comment = await this.commentsService.createComment(
      user.id,
      gameId,
      createDto,
    );

    return {
      id: comment.id,
      igdbGameId: comment.igdbGameId,
      content: comment.content,
      isEdited: comment.isEdited,
      author: {
        id: comment.user.id,
        displayName: comment.user.displayName || 'Anonymous',
        photoUrl: comment.user.photoUrl,
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  @Put('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a comment',
    description: 'Update your own comment',
  })
  @ApiParam({
    name: 'commentId',
    description: 'Comment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not your comment',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateDto: UpdateCommentDto,
    @CurrentUser() user: User,
  ) {
    const comment = await this.commentsService.updateComment(
      commentId,
      user.id,
      updateDto,
    );

    return {
      id: comment.id,
      igdbGameId: comment.igdbGameId,
      content: comment.content,
      isEdited: comment.isEdited,
      author: {
        id: comment.user.id,
        displayName: comment.user.displayName || 'Anonymous',
        photoUrl: comment.user.photoUrl,
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a comment',
    description: 'Delete your own comment',
  })
  @ApiParam({
    name: 'commentId',
    description: 'Comment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Comment deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not your comment',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    await this.commentsService.deleteComment(commentId, user.id);
  }

  @Get('games/:gameId/comments/count')
  @ApiOperation({
    summary: 'Get comment count for a game',
    description: 'Get the total number of comments on a game',
  })
  @ApiParam({
    name: 'gameId',
    description: 'IGDB game ID',
    example: 1942,
  })
  @ApiResponse({
    status: 200,
    description: 'Comment count',
  })
  async getCommentsCount(@Param('gameId', ParseIntPipe) gameId: number) {
    const count = await this.commentsService.getCommentsCount(gameId);
    return { count };
  }
}
