import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vendor, VendorDocument, VendorStatus } from './schemas/vendor.schema';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto, UpdateVendorStatusDto } from './dto/update-vendor.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class VendorsService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, createVendorDto: CreateVendorDto): Promise<Vendor> {
    // Check if user already has a vendor profile
    const existingVendor = await this.vendorModel.findOne({ user: userId });
    if (existingVendor) {
      throw new ConflictException('Vendor profile already exists');
    }

    const vendor = new this.vendorModel({
      ...createVendorDto,
      user: userId,
    });

    await vendor.save();

    // Update user role to vendor
    await this.usersService.updateRole(userId, Role.VENDOR);

    return vendor.populate('user', '-password');
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: VendorStatus,
    search?: string,
  ): Promise<{ vendors: Vendor[]; total: number; pages: number }> {
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const [vendors, total] = await Promise.all([
      this.vendorModel
        .find(query)
        .populate('user', '-password')
        .populate('verifiedBy', '-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.vendorModel.countDocuments(query),
    ]);

    return {
      vendors,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Vendor> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid vendor ID');
    }

    const vendor = await this.vendorModel
      .findById(id)
      .populate('user', '-password')
      .populate('verifiedBy', '-password');

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async findByUserId(userId: string): Promise<Vendor | null> {
    return this.vendorModel
      .findOne({ user: userId })
      .populate('user', '-password');
  }

  async update(
    id: string,
    userId: string,
    updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    const vendor = await this.vendorModel.findById(id);

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Check ownership
    if (vendor.user.toString() !== userId) {
      throw new ForbiddenException('You can only update your own vendor profile');
    }

    Object.assign(vendor, updateVendorDto);
    await vendor.save();

    return vendor.populate('user', '-password');
  }

  async updateStatus(
    id: string,
    adminId: string,
    updateStatusDto: UpdateVendorStatusDto,
  ): Promise<Vendor> {
    const vendor = await this.vendorModel.findById(id);

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    vendor.status = updateStatusDto.status;

    if (updateStatusDto.status === VendorStatus.VERIFIED) {
      vendor.verifiedAt = new Date();
      vendor.verifiedBy = new Types.ObjectId(adminId);
      vendor.rejectionReason = undefined;
    } else if (updateStatusDto.status === VendorStatus.REJECTED) {
      vendor.rejectionReason = updateStatusDto.rejectionReason;
    }

    await vendor.save();

    return vendor.populate(['user', 'verifiedBy']);
  }

  async incrementGoodsCount(vendorId: string, increment: number = 1): Promise<void> {
    await this.vendorModel.findByIdAndUpdate(vendorId, {
      $inc: { totalGoods: increment },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const vendor = await this.vendorModel.findById(id);

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (vendor.user.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own vendor profile');
    }

    await vendor.deleteOne();

    // Revert user role to regular user
    await this.usersService.updateRole(userId, Role.USER);
  }
}