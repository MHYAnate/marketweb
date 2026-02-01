import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { VendorsModule } from '../vendors/vendors.module';
import { GoodsModule } from '../goods/goods.module';

@Module({
  imports: [UsersModule, VendorsModule, GoodsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}