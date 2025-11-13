import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CommentVote } from './entities/comment-vote.entity';
import { CommentReaction } from './entities/comment-reaction.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { VoteType, ReactionType, CommentType } from '../common/enums';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(CommentVote)
    private commentVotesRepository: Repository<CommentVote>,
    @InjectRepository(CommentReaction)
    private commentReactionsRepository: Repository<CommentReaction>,
  ) {}

  async createComment(
    userId: string,
    gameId: number,
    createDto: CreateCommentDto,
  ): Promise<Comment> {
    // If it's a reply, verify parent comment exists
    if (createDto.parentCommentId) {
      const parentComment = await this.commentsRepository.findOne({
        where: { id: createDto.parentCommentId, deletedAt: IsNull() },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      // Ensure parent is from the same game
      if (parentComment.igdbGameId !== gameId) {
        throw new BadRequestException(
          'Cannot reply to comment from different game',
        );
      }
    }

    const comment = this.commentsRepository.create({
      userId,
      igdbGameId: gameId,
      content: createDto.content,
      parentCommentId: createDto.parentCommentId || null,
      isSpoiler: createDto.isSpoiler || false,
      commentType: createDto.commentType || CommentType.DISCUSSION,
      platform: createDto.platform || null,
      difficultyLevel: createDto.difficultyLevel || null,
      completionStatus: createDto.completionStatus || null,
      playtimeHours: createDto.playtimeHours || null,
      isEdited: false,
    });

    const saved = await this.commentsRepository.save(comment);
    this.logger.log(
      `User ${userId} created ${createDto.commentType || 'discussion'} comment on game ${gameId}`,
    );

    // Update parent comment's replies count if this is a reply
    if (createDto.parentCommentId) {
      await this.incrementRepliesCount(createDto.parentCommentId);
    }

    // Load the user relation
    const loadedComment = await this.commentsRepository.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });

    if (!loadedComment) {
      throw new NotFoundException('Failed to load created comment');
    }

    return loadedComment;
  }

  async getCommentsByGame(
    gameId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ comments: Comment[]; total: number }> {
    const skip = (page - 1) * limit;

    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { igdbGameId: gameId, deletedAt: IsNull() },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { comments, total };
  }

  async getCommentById(commentId: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, deletedAt: IsNull() },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async updateComment(
    commentId: string,
    userId: string,
    updateDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.getCommentById(commentId);

    // Check if user owns the comment
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = updateDto.content;
    comment.isEdited = true;

    const updated = await this.commentsRepository.save(comment);
    this.logger.log(`User ${userId} updated comment ${commentId}`);

    const refreshed = await this.commentsRepository.findOne({
      where: { id: updated.id },
      relations: ['user'],
    });

    if (!refreshed) {
      throw new NotFoundException('Failed to load updated comment');
    }

    return refreshed;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.getCommentById(commentId);

    // Check if user owns the comment
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Soft delete
    await this.commentsRepository.softDelete(commentId);
    this.logger.log(`User ${userId} deleted comment ${commentId}`);
  }

  async getUserComments(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ comments: Comment[]; total: number }> {
    const skip = (page - 1) * limit;

    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { userId, deletedAt: IsNull() },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { comments, total };
  }

  async getCommentsCount(gameId: number): Promise<number> {
    return this.commentsRepository.count({
      where: { igdbGameId: gameId, deletedAt: IsNull() },
    });
  }

  // ============================================
  // VOTING SYSTEM
  // ============================================

  async voteComment(
    commentId: string,
    userId: string,
    voteType: VoteType,
  ): Promise<{
    comment: Comment;
    action: 'liked' | 'disliked' | 'removed';
    previousVote: VoteType | null;
  }> {
    const comment = await this.getCommentById(commentId);

    // Check if user already voted
    const existingVote = await this.commentVotesRepository.findOne({
      where: { commentId, userId },
    });

    let action: 'liked' | 'disliked' | 'removed';
    const previousVote = existingVote?.voteType || null;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote (toggle off)
        await this.commentVotesRepository.remove(existingVote);
        await this.decrementVoteCount(commentId, voteType);
        action = 'removed';
        this.logger.log(`User ${userId} removed ${voteType} from comment ${commentId}`);
      } else {
        // Change vote type
        await this.decrementVoteCount(commentId, existingVote.voteType);
        existingVote.voteType = voteType;
        await this.commentVotesRepository.save(existingVote);
        await this.incrementVoteCount(commentId, voteType);
        action = voteType === VoteType.LIKE ? 'liked' : 'disliked';
        this.logger.log(
          `User ${userId} changed vote to ${voteType} on comment ${commentId}`,
        );
      }
    } else {
      // Create new vote
      const vote = this.commentVotesRepository.create({
        commentId,
        userId,
        voteType,
      });
      await this.commentVotesRepository.save(vote);
      await this.incrementVoteCount(commentId, voteType);
      action = voteType === VoteType.LIKE ? 'liked' : 'disliked';
      this.logger.log(`User ${userId} ${voteType}d comment ${commentId}`);
    }

    // Reload comment with updated counts
    const updatedComment = await this.getCommentById(commentId);
    return { comment: updatedComment, action, previousVote };
  }

  async getUserVote(
    commentId: string,
    userId: string,
  ): Promise<VoteType | null> {
    const vote = await this.commentVotesRepository.findOne({
      where: { commentId, userId },
    });
    return vote?.voteType || null;
  }

  // ============================================
  // REACTIONS SYSTEM
  // ============================================

  async addReaction(
    commentId: string,
    userId: string,
    reactionType: ReactionType,
  ): Promise<{ added: boolean; count: number }> {
    const comment = await this.getCommentById(commentId);

    // Check if reaction already exists
    const existingReaction = await this.commentReactionsRepository.findOne({
      where: { commentId, userId, reactionType },
    });

    if (existingReaction) {
      // Remove reaction (toggle off)
      await this.commentReactionsRepository.remove(existingReaction);

      // Decrement helpful count if it's a helpful reaction
      if (reactionType === ReactionType.HELPFUL) {
        await this.decrementHelpfulCount(commentId);
      }

      const count = await this.commentReactionsRepository.count({
        where: { commentId, reactionType },
      });

      this.logger.log(
        `User ${userId} removed ${reactionType} reaction from comment ${commentId}`,
      );

      return { added: false, count };
    }

    // Create new reaction
    const reaction = this.commentReactionsRepository.create({
      commentId,
      userId,
      reactionType,
    });
    await this.commentReactionsRepository.save(reaction);

    // Increment helpful count if it's a helpful reaction
    if (reactionType === ReactionType.HELPFUL) {
      await this.incrementHelpfulCount(commentId);
    }

    const count = await this.commentReactionsRepository.count({
      where: { commentId, reactionType },
    });

    this.logger.log(
      `User ${userId} added ${reactionType} reaction to comment ${commentId}`,
    );

    return { added: true, count };
  }

  async getCommentReactions(
    commentId: string,
    userId?: string,
  ): Promise<
    Array<{
      reactionType: ReactionType;
      count: number;
      userHasReacted: boolean;
    }>
  > {
    // Get all reactions for the comment grouped by type
    const reactions = await this.commentReactionsRepository
      .createQueryBuilder('reaction')
      .select('reaction.reactionType', 'reactionType')
      .addSelect('COUNT(*)', 'count')
      .where('reaction.commentId = :commentId', { commentId })
      .groupBy('reaction.reactionType')
      .getRawMany();

    // Get user's reactions if authenticated
    let userReactions: ReactionType[] = [];
    if (userId) {
      const userReactionRecords = await this.commentReactionsRepository.find({
        where: { commentId, userId },
      });
      userReactions = userReactionRecords.map((r) => r.reactionType);
    }

    return reactions.map((r) => ({
      reactionType: r.reactionType,
      count: parseInt(r.count, 10),
      userHasReacted: userReactions.includes(r.reactionType),
    }));
  }

  // ============================================
  // NESTED COMMENTS / REPLIES
  // ============================================

  async getReplies(
    commentId: string,
    userId?: string,
  ): Promise<Comment[]> {
    const replies = await this.commentsRepository.find({
      where: { parentCommentId: commentId, deletedAt: IsNull() },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return replies;
  }

  // ============================================
  // HELPER METHODS (Count Updates)
  // ============================================

  private async incrementVoteCount(
    commentId: string,
    voteType: VoteType,
  ): Promise<void> {
    const field =
      voteType === VoteType.LIKE ? 'likesCount' : 'dislikesCount';
    await this.commentsRepository.increment({ id: commentId }, field, 1);
  }

  private async decrementVoteCount(
    commentId: string,
    voteType: VoteType,
  ): Promise<void> {
    const field =
      voteType === VoteType.LIKE ? 'likesCount' : 'dislikesCount';
    await this.commentsRepository.decrement({ id: commentId }, field, 1);
  }

  private async incrementRepliesCount(commentId: string): Promise<void> {
    await this.commentsRepository.increment(
      { id: commentId },
      'repliesCount',
      1,
    );
  }

  private async incrementHelpfulCount(commentId: string): Promise<void> {
    await this.commentsRepository.increment(
      { id: commentId },
      'helpfulCount',
      1,
    );
  }

  private async decrementHelpfulCount(commentId: string): Promise<void> {
    await this.commentsRepository.decrement(
      { id: commentId },
      'helpfulCount',
      1,
    );
  }
}
