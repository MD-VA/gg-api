import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async createComment(
    userId: string,
    gameId: number,
    createDto: CreateCommentDto,
  ): Promise<Comment> {
    const comment = this.commentsRepository.create({
      userId,
      igdbGameId: gameId,
      content: createDto.content,
      isEdited: false,
    });

    const saved = await this.commentsRepository.save(comment);
    this.logger.log(`User ${userId} created comment on game ${gameId}`);

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
}
