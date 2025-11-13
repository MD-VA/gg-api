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
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import {
  CommentResponseDto,
  CommentsListResponseDto,
} from './dto/comment-response.dto';
import { VoteCommentDto } from './dto/vote-comment.dto';
import { ReactCommentDto } from './dto/react-comment.dto';

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
  @UseGuards(FirebaseAuthGuard)
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
  @UseGuards(FirebaseAuthGuard)
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
  @UseGuards(FirebaseAuthGuard)
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

  // ============================================
  // VOTING ENDPOINTS
  // ============================================

  @Post('comments/:commentId/vote')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Vote on a comment',
    description:
      'Like or dislike a comment (toggle behavior). Clicking the same vote again removes it. Clicking opposite vote changes it.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'Comment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Vote recorded successfully',
  })
  async voteComment(
    @Param('commentId') commentId: string,
    @Body() voteDto: VoteCommentDto,
    @CurrentUser() user: User,
  ) {
    const { comment, action } = await this.commentsService.voteComment(
      commentId,
      user.id,
      voteDto.voteType,
    );

    const userVote =
      action === 'removed' ? null : voteDto.voteType;

    return {
      commentId: comment.id,
      userVote,
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      action,
    };
  }

  @Delete('comments/:commentId/vote')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove vote from a comment',
    description: 'Remove your vote (like or dislike) from a comment',
  })
  @ApiParam({
    name: 'commentId',
    description: 'Comment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Vote removed successfully',
  })
  async removeVote(
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    const userVote = await this.commentsService.getUserVote(commentId, user.id);

    if (!userVote) {
      return {
        commentId,
        userVote: null,
        action: 'no_vote',
      };
    }

    const { comment } = await this.commentsService.voteComment(
      commentId,
      user.id,
      userVote, // Toggle off existing vote
    );

    return {
      commentId: comment.id,
      userVote: null,
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      action: 'removed',
    };
  }

  // ============================================
  // REACTIONS ENDPOINTS
  // ============================================

  @Post('comments/:commentId/reactions')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add or remove a reaction to a comment',
    description:
      'Toggle a reaction (fire, helpful, funny, etc.) on a comment. If already reacted, removes it.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'Comment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Reaction toggled successfully',
  })
  async addReaction(
    @Param('commentId') commentId: string,
    @Body() reactionDto: ReactCommentDto,
    @CurrentUser() user: User,
  ) {
    const { added, count } = await this.commentsService.addReaction(
      commentId,
      user.id,
      reactionDto.reactionType,
    );

    return {
      commentId,
      reactionType: reactionDto.reactionType,
      added,
      count,
    };
  }

  @Get('comments/:commentId/reactions')
  @ApiOperation({
    summary: 'Get all reactions for a comment',
    description: 'Get a summary of all reactions with counts and user status',
  })
  @ApiParam({
    name: 'commentId',
    description: 'Comment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Reactions summary',
  })
  async getCommentReactions(
    @Param('commentId') commentId: string,
    @CurrentUser() user?: User,
  ) {
    const reactions = await this.commentsService.getCommentReactions(
      commentId,
      user?.id,
    );

    return {
      commentId,
      reactions,
    };
  }

  // ============================================
  // NESTED COMMENTS / REPLIES
  // ============================================

  @Get('comments/:commentId/replies')
  @ApiOperation({
    summary: 'Get replies to a comment',
    description: 'Get all nested replies for a specific comment',
  })
  @ApiParam({
    name: 'commentId',
    description: 'Parent comment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of replies',
  })
  async getReplies(
    @Param('commentId') commentId: string,
    @CurrentUser() user?: User,
  ) {
    const replies = await this.commentsService.getReplies(commentId, user?.id);

    return {
      parentCommentId: commentId,
      replies: replies.map((reply) => ({
        id: reply.id,
        igdbGameId: reply.igdbGameId,
        content: reply.content,
        isEdited: reply.isEdited,
        isSpoiler: reply.isSpoiler,
        commentType: reply.commentType,
        platform: reply.platform,
        difficultyLevel: reply.difficultyLevel,
        completionStatus: reply.completionStatus,
        playtimeHours: reply.playtimeHours,
        author: {
          id: reply.user.id,
          displayName: reply.user.displayName || 'Anonymous',
          photoUrl: reply.user.photoUrl,
        },
        likesCount: reply.likesCount,
        dislikesCount: reply.dislikesCount,
        repliesCount: reply.repliesCount,
        helpfulCount: reply.helpfulCount,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      })),
      total: replies.length,
    };
  }
}
