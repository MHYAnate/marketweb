import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateVendorDto } from './create-vendor.dto';
import { VendorStatus } from '../schemas/vendor.schema';

export class UpdateVendorDto extends PartialType(CreateVendorDto) {}

export class UpdateVendorStatusDto {
  @IsEnum(VendorStatus)
  status: VendorStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}