import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1730116800000 implements MigrationInterface {
  name = 'InitialSchema1730116800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "firebase_uid" character varying NOT NULL,
        "email" character varying NOT NULL,
        "display_name" character varying,
        "photo_url" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_firebase_uid" UNIQUE ("firebase_uid"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Create index on firebase_uid
    await queryRunner.query(`
      CREATE INDEX "IDX_users_firebase_uid" ON "users" ("firebase_uid")
    `);

    // Create user_games table
    await queryRunner.query(`
      CREATE TABLE "user_games" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "igdb_game_id" integer NOT NULL,
        "is_saved" boolean NOT NULL DEFAULT true,
        "is_played" boolean NOT NULL DEFAULT false,
        "saved_at" TIMESTAMP NOT NULL,
        "played_at" TIMESTAMP,
        "play_time_hours" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_games_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_games_user_game" UNIQUE ("user_id", "igdb_game_id")
      )
    `);

    // Create indexes on user_games
    await queryRunner.query(`
      CREATE INDEX "IDX_user_games_user_id" ON "user_games" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_user_games_igdb_game_id" ON "user_games" ("igdb_game_id")
    `);

    // Create foreign key for user_games -> users
    await queryRunner.query(`
      ALTER TABLE "user_games"
      ADD CONSTRAINT "FK_user_games_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE
    `);

    // Create comments table
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "igdb_game_id" integer NOT NULL,
        "content" text NOT NULL,
        "is_edited" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_comments_id" PRIMARY KEY ("id")
      )
    `);

    // Create indexes on comments
    await queryRunner.query(`
      CREATE INDEX "IDX_comments_user_id" ON "comments" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_comments_igdb_game_id" ON "comments" ("igdb_game_id")
    `);

    // Create foreign key for comments -> users
    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD CONSTRAINT "FK_comments_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE
    `);

    // Create affiliate_links table
    await queryRunner.query(`
      CREATE TABLE "affiliate_links" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "igdb_game_id" integer NOT NULL,
        "platform" character varying NOT NULL,
        "url" character varying NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_affiliate_links_id" PRIMARY KEY ("id")
      )
    `);

    // Create index on affiliate_links
    await queryRunner.query(`
      CREATE INDEX "IDX_affiliate_links_igdb_game_id" ON "affiliate_links" ("igdb_game_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (foreign keys first)
    await queryRunner.query(`DROP TABLE "affiliate_links"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "user_games"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
