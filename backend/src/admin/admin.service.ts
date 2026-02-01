import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { GoodsService } from '../goods/goods.service';
import { Role } from '../common/enums/role.enum';
import { VendorStatus } from '../vendors/schemas/vendor.schema';
import { GoodsStatus } from '../common/enums/goods-status.enum';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private vendorsService: VendorsService,
    private goodsService: GoodsService,
  ) {}

  async getDashboardStats() {
    const [usersData, vendorsData, goodsStats] = await Promise.all([
      this.usersService.findAll(1, 1),
      this.vendorsService.findAll(1, 1),
      this.goodsService.getStats(),
    ]);

    const pendingVendors = await this.vendorsService.findAll(
      1,
      1,
      VendorStatus.PENDING,
    );

    return {
      users: {
        total: usersData.total,
      },
      vendors: {
        total: vendorsData.total,
        pending: pendingVendors.total,
      },
      goods: goodsStats,
    };
  }

  async verifyVendor(vendorId: string, adminId: string) {
    return this.vendorsService.updateStatus(vendorId, adminId, {
      status: VendorStatus.VERIFIED,
    });
  }

  async rejectVendor(vendorId: string, adminId: string, reason: string) {
    return this.vendorsService.updateStatus(vendorId, adminId, {
      status: VendorStatus.REJECTED,
      rejectionReason: reason,
    });
  }

  async suspendVendor(vendorId: string, adminId: string, reason: string) {
    return this.vendorsService.updateStatus(vendorId, adminId, {
      status: VendorStatus.SUSPENDED,
      rejectionReason: reason,
    });
  }

  async approveGoods(goodsId: string, adminId: string) {
    return this.goodsService.updateStatus(goodsId, adminId, GoodsStatus.APPROVED);
  }

  async flagGoods(goodsId: string, adminId: string, reason: string) {
    return this.goodsService.updateStatus(
      goodsId,
      adminId,
      GoodsStatus.FLAGGED,
      reason,
    );
  }

  async dropGoods(goodsId: string, adminId: string, reason: string) {
    return this.goodsService.updateStatus(
      goodsId,
      adminId,
      GoodsStatus.DROPPED,
      reason,
    );
  }

  async getPendingVendors(page: number = 1, limit: number = 10) {
    return this.vendorsService.findAll(page, limit, VendorStatus.PENDING);
  }

  async getPendingGoods(page: number = 1, limit: number = 10) {
    return this.goodsService.findAll(
      { page, limit, status: GoodsStatus.PENDING },
      false,
    );
  }
}