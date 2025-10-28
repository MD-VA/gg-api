import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { IgdbService } from './igdb/igdb.service';
import { IgdbAuthService } from './igdb/igdb-auth.service';
import { UserGame } from './entities/user-game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserGame])],
  controllers: [GamesController],
  providers: [GamesService, IgdbService, IgdbAuthService],
  exports: [GamesService],
})
export class GamesModule {}
