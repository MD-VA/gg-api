import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_games')
@Unique(['userId', 'igdbGameId'])
@Index(['userId'])
@Index(['igdbGameId'])
export class UserGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.games, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'igdb_game_id', type: 'integer' })
  igdbGameId: number;

  @Column({ name: 'is_saved', default: true })
  isSaved: boolean;

  @Column({ name: 'is_played', default: false })
  isPlayed: boolean;

  @Column({ name: 'saved_at', type: 'timestamp' })
  savedAt: Date;

  @Column({ name: 'played_at', type: 'timestamp', nullable: true })
  playedAt: Date;

  @Column({ name: 'play_time_hours', type: 'integer', nullable: true })
  playTimeHours: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
