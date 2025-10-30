import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLibraryController } from './user-library.controller';
import { UserLibraryService } from './user-library.service';
import { UserGame } from '../games/entities/user-game.entity';
import { AuthModule } from '../auth/auth.module';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserGame]), AuthModule, GamesModule],
  controllers: [UserLibraryController],
  providers: [UserLibraryService],
  exports: [UserLibraryService],
})
export class UserLibraryModule {}
