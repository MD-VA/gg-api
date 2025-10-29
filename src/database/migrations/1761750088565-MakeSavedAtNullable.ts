import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeSavedAtNullable1761750088565 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Make saved_at column nullable to support unsaving games
        await queryRunner.query(`
            ALTER TABLE "user_games"
            ALTER COLUMN "saved_at" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert: make saved_at NOT NULL again
        // First set NULL values to current timestamp to avoid constraint violation
        await queryRunner.query(`
            UPDATE "user_games"
            SET "saved_at" = NOW()
            WHERE "saved_at" IS NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "user_games"
            ALTER COLUMN "saved_at" SET NOT NULL
        `);
    }

}
