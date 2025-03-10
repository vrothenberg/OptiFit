import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { UserProfile } from './entity/user-profile.entity';
import { UserActivityLog } from './entity/user-activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, UserActivityLog])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Add this line to export UserService
})
export class UserModule {}
