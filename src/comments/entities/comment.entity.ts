import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CommentVote } from './comment-vote.entity';
import { CommentReaction } from './comment-reaction.entity';
import {
  CommentType,
  CompletionStatus,
  DifficultyLevel,
} from '../../common/enums';

@Entity('comments')
@Index(['igdbGameId'])
@Index(['userId'])
@Index(['parentCommentId'])
@Index(['commentType'])
@Index(['isPinned'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'igdb_game_id', type: 'integer' })
  igdbGameId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  // Nested comments (replies)
  @Column({ name: 'parent_comment_id', nullable: true })
  parentCommentId: string | null;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];

  // Gamer-specific fields
  @Column({ name: 'is_spoiler', default: false })
  isSpoiler: boolean;

  @Column({ name: 'comment_type', type: 'varchar', default: CommentType.DISCUSSION })
  commentType: CommentType;

  @Column({ name: 'platform', type: 'varchar', nullable: true })
  platform: string | null;

  @Column({ name: 'difficulty_level', type: 'varchar', nullable: true })
  difficultyLevel: DifficultyLevel | null;

  @Column({ name: 'completion_status', type: 'varchar', nullable: true })
  completionStatus: CompletionStatus | null;

  @Column({ name: 'playtime_hours', type: 'integer', nullable: true })
  playtimeHours: number | null;

  // Pinning functionality
  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'pinned_at', type: 'timestamp', nullable: true })
  pinnedAt: Date | null;

  @Column({ name: 'pinned_by_user_id', nullable: true })
  pinnedByUserId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'pinned_by_user_id' })
  pinnedBy: User | null;

  // Cached counts for performance
  @Column({ name: 'likes_count', type: 'integer', default: 0 })
  likesCount: number;

  @Column({ name: 'dislikes_count', type: 'integer', default: 0 })
  dislikesCount: number;

  @Column({ name: 'replies_count', type: 'integer', default: 0 })
  repliesCount: number;

  @Column({ name: 'helpful_count', type: 'integer', default: 0 })
  helpfulCount: number;

  // Relations to votes and reactions
  @OneToMany(() => CommentVote, (vote) => vote.comment)
  votes: CommentVote[];

  @OneToMany(() => CommentReaction, (reaction) => reaction.comment)
  reactions: CommentReaction[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
