import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type VendorDocument = Vendor & Document;

export enum VendorStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true })
export class Vendor {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: User | Types.ObjectId;

  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true })
  businessDescription: string;

  @Prop()
  businessAddress: string;

  @Prop()
  businessPhone: string;

  @Prop()
  businessEmail: string;

  @Prop()
  logo?: string;

  @Prop([String])
  documents: string[];

  @Prop({ type: String, enum: VendorStatus, default: VendorStatus.PENDING })
  status: VendorStatus;

  @Prop()
  verifiedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: User | Types.ObjectId;

  @Prop()
  rejectionReason?: string;

  @Prop({ default: 0 })
  totalGoods: number;

  @Prop({ default: 0 })
  rating: number;

  createdAt: Date;
  updatedAt: Date;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

// Indexes
VendorSchema.index({ user: 1 });
VendorSchema.index({ status: 1 });
VendorSchema.index({ businessName: 'text', businessDescription: 'text' });

VendorSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});