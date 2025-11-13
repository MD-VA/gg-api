import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdvancedCommentsSystem1763061522903
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to comments table
    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD COLUMN "parent_comment_id" uuid,
      ADD COLUMN "is_spoiler" boolean NOT NULL DEFAULT false,
      ADD COLUMN "comment_type" character varying NOT NULL DEFAULT 'discussion',
      ADD COLUMN "platform" character varying,
      ADD COLUMN "difficulty_level" character varying,
      ADD COLUMN "completion_status" character varying,
      ADD COLUMN "playtime_hours" integer,
      ADD COLUMN "is_pinned" boolean NOT NULL DEFAULT false,
      ADD COLUMN "pinned_at" TIMESTAMP,
      ADD COLUMN "pinned_by_user_id" uuid,
      ADD COLUMN "likes_count" integer NOT NULL DEFAULT 0,
      ADD COLUMN "dislikes_count" integer NOT NULL DEFAULT 0,
      ADD COLUMN "replies_count" integer NOT NULL DEFAULT 0,
      ADD COLUMN "helpful_count" integer NOT NULL DEFAULT 0
    `);

    // Add foreign key for parent_comment_id (self-referencing)
    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD CONSTRAINT "FK_comments_parent_comment_id"
      FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id")
      ON DELETE CASCADE
    `);

    // Add foreign key for pinned_by_user_id
    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD CONSTRAINT "FK_comments_pinned_by_user_id"
      FOREIGN KEY ("pinned_by_user_id") REFERENCES "users"("id")
      ON DELETE SET NULL
    `);

    // Create index on parent_comment_id for faster nested queries
    await queryRunner.query(`
      CREATE INDEX "IDX_comments_parent_comment_id" ON "comments" ("parent_comment_id")
    `);

    // Create index on comment_type for filtering
    await queryRunner.query(`
      CREATE INDEX "IDX_comments_comment_type" ON "comments" ("comment_type")
    `);

    // Create index on is_pinned for filtering
    await queryRunner.query(`
      CREATE INDEX "IDX_comments_is_pinned" ON "comments" ("is_pinned")
    `);

    // Create comment_votes table
    await queryRunner.query(`
      CREATE TABLE "comment_votes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "comment_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "vote_type" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comment_votes_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_comment_votes_comment_user" UNIQUE ("comment_id", "user_id")
      )
    `);

    // Add foreign keys for comment_votes
    await queryRunner.query(`
      ALTER TABLE "comment_votes"
      ADD CONSTRAINT "FK_comment_votes_comment_id"
      FOREIGN KEY ("comment_id") REFERENCES "comments"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "comment_votes"
      ADD CONSTRAINT "FK_comment_votes_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE
    `);

    // Create indexes for comment_votes
    await queryRunner.query(`
      CREATE INDEX "IDX_comment_votes_comment_id" ON "comment_votes" ("comment_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comment_votes_user_id" ON "comment_votes" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comment_votes_vote_type" ON "comment_votes" ("vote_type")
    `);

    // Create comment_reactions table
    await queryRunner.query(`
      CREATE TABLE "comment_reactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "comment_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "reaction_type" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comment_reactions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_comment_reactions_comment_user_type" UNIQUE ("comment_id", "user_id", "reaction_type")
      )
    `);

    // Add foreign keys for comment_reactions
    await queryRunner.query(`
      ALTER TABLE "comment_reactions"
      ADD CONSTRAINT "FK_comment_reactions_comment_id"
      FOREIGN KEY ("comment_id") REFERENCES "comments"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "comment_reactions"
      ADD CONSTRAINT "FK_comment_reactions_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE
    `);

    // Create indexes for comment_reactions
    await queryRunner.query(`
      CREATE INDEX "IDX_comment_reactions_comment_id" ON "comment_reactions" ("comment_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comment_reactions_user_id" ON "comment_reactions" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comment_reactions_reaction_type" ON "comment_reactions" ("reaction_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop comment_reactions table
    await queryRunner.query(`DROP TABLE "comment_reactions"`);

    // Drop comment_votes table
    await queryRunner.query(`DROP TABLE "comment_votes"`);

    // Drop indexes on comments
    await queryRunner.query(`DROP INDEX "IDX_comments_is_pinned"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_comment_type"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_parent_comment_id"`);

    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_pinned_by_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_parent_comment_id"`,
    );

    // Drop new columns from comments
    await queryRunner.query(`
      ALTER TABLE "comments"
      DROP COLUMN "helpful_count",
      DROP COLUMN "replies_count",
      DROP COLUMN "dislikes_count",
      DROP COLUMN "likes_count",
      DROP COLUMN "pinned_by_user_id",
      DROP COLUMN "pinned_at",
      DROP COLUMN "is_pinned",
      DROP COLUMN "playtime_hours",
      DROP COLUMN "completion_status",
      DROP COLUMN "difficulty_level",
      DROP COLUMN "platform",
      DROP COLUMN "comment_type",
      DROP COLUMN "is_spoiler",
      DROP COLUMN "parent_comment_id"
    `);
  }
}
