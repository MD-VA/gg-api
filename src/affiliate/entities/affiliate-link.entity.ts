import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('affiliate_links')
@Index(['igdbGameId'])
export class AffiliateLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'igdb_game_id', type: 'integer' })
  igdbGameId: number;

  @Column()
  platform: string; // e.g., 'steam', 'epic', 'playstation', 'xbox', 'nintendo'

  @Column()
  url: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
