import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { firebaseUid },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);
    this.logger.log(`Created new user: ${savedUser.id} (${savedUser.email})`);
    return savedUser;
  }

  async findOrCreate(createUserDto: CreateUserDto): Promise<User> {
    // Try to find by Firebase UID first
    let user = await this.findByFirebaseUid(createUserDto.firebaseUid);

    if (!user) {
      // If not found by Firebase UID, try by email (in case user re-authenticated)
      user = await this.findByEmail(createUserDto.email);

      if (user) {
        // Update Firebase UID if user exists but with different UID
        user.firebaseUid = createUserDto.firebaseUid;
        user = await this.usersRepository.save(user);
        this.logger.log(`Updated Firebase UID for user: ${user.id}`);
      } else {
        // Create new user
        user = await this.create(createUserDto);
      }
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updates: { displayName?: string; photoUrl?: string },
  ): Promise<User | null> {
    await this.usersRepository.update(userId, updates);
    const updatedUser = await this.findById(userId);
    if (updatedUser) {
      this.logger.log(`Updated profile for user: ${userId}`);
    }
    return updatedUser;
  }
}
