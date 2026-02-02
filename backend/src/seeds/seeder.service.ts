import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Vendor, VendorDocument, VendorStatus } from '../vendors/schemas/vendor.schema';
import { Goods, GoodsDocument } from '../goods/schemas/goods.schema';
import { Role } from '../common/enums/role.enum';
import { GoodsType } from '../common/enums/goods-type.enum';
import { GoodsStatus } from '../common/enums/goods-status.enum';

@Injectable()
export class SeederService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    @InjectModel(Goods.name) private goodsModel: Model<GoodsDocument>,
  ) {}

  async seed() {
    await this.clearDatabase();
    const users = await this.seedUsers();
    const vendors = await this.seedVendors(users);
    await this.seedGoods(vendors, users);
  }

  private async clearDatabase() {
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      this.userModel.deleteMany({}),
      this.vendorModel.deleteMany({}),
      this.goodsModel.deleteMany({}),
    ]);
    console.log('   ✓ Database cleared');
  }

  private async seedUsers(): Promise<UserDocument[]> {
    console.log('👤 Seeding users...');

    const hashedPassword = await bcrypt.hash('Password@123', 12);

    const usersData = [
      // Admin
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@marketplace.com',
        password: await bcrypt.hash('Admin@123', 12),
        phone: '+1 555-0100',
        role: Role.ADMIN,
        isActive: true,
      },
      // Vendors
      {
        firstName: 'Abba',
        lastName: 'Electronics',
        email: 'abba@techstore.com',
        password: hashedPassword,
        phone: '+1 555-0101',
        role: Role.VENDOR,
        isActive: true,
      },
      {
        firstName: 'Sarah',
        lastName: 'Motors',
        email: 'sarah@automall.com',
        password: hashedPassword,
        phone: '+1 555-0102',
        role: Role.VENDOR,
        isActive: true,
      },
      {
        firstName: 'sabir',
        lastName: 'Properties',
        email: 'sabir@realestate.com',
        password: hashedPassword,
        phone: '+1 555-0103',
        role: Role.VENDOR,
        isActive: true,
      },
      {
        firstName: 'zena',
        lastName: 'Fashion',
        email: 'zena@styleshop.com',
        password: hashedPassword,
        phone: '+1 555-0104',
        role: Role.VENDOR,
        isActive: true,
      },
      {
        firstName: 'Davod',
        lastName: 'Sports',
        email: 'davod@sportsgear.com',
        password: hashedPassword,
        phone: '+1 555-0105',
        role: Role.VENDOR,
        isActive: true,
      },
      // Regular Users
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@email.com',
        password: hashedPassword,
        phone: '+1 555-0201',
        role: Role.USER,
        isActive: true,
      },
      {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@email.com',
        password: hashedPassword,
        phone: '+1 555-0202',
        role: Role.USER,
        isActive: true,
      },
      {
        firstName: 'Carol',
        lastName: 'Williams',
        email: 'carol@email.com',
        password: hashedPassword,
        phone: '+1 555-0203',
        role: Role.USER,
        isActive: true,
      },
      // Pending Vendor (not yet a vendor role)
      {
        firstName: 'Tom',
        lastName: 'Pending',
        email: 'tom@pending.com',
        password: hashedPassword,
        phone: '+1 555-0301',
        role: Role.USER,
        isActive: true,
      },
    ];

    const users = await this.userModel.insertMany(usersData);
    console.log(`   ✓ Created ${users.length} users`);
    
    return users;
  }

  private async seedVendors(users: UserDocument[]): Promise<VendorDocument[]> {
    console.log('🏪 Seeding vendors...');

    const vendorUsers = users.filter((u) => u.role === Role.VENDOR);
    const admin = users.find((u) => u.role === Role.ADMIN);
    const pendingUser = users.find((u) => u.email === 'tom@pending.com');

    const vendorsData = [
      // Verified Vendors
      {
        user: vendorUsers[0]?._id!,
        businessName: 'Tech Store Electronics',
        businessDescription: 'Premium electronics and gadgets store offering the latest technology products including smartphones, laptops, tablets, and accessories. We provide quality products with warranty and excellent customer service.',
        businessAddress: '123 Tech Avenue, Silicon Valley, CA 94025',
        businessPhone: '+1 555-0101',
        businessEmail: 'contact@techstore.com',
        logo: 'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/vendors/tech-store-logo.png',
        documents: [],
        status: VendorStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: admin?._id,
        totalGoods: 0,
        rating: 4.8,
      },
      {
        user: vendorUsers[1]?._id!,
        businessName: 'Auto Mall Motors',
        businessDescription: 'Your trusted destination for quality pre-owned vehicles. We offer a wide selection of cars, trucks, and SUVs with competitive financing options and comprehensive vehicle history reports.',
        businessAddress: '456 Motor Drive, Detroit, MI 48201',
        businessPhone: '+1 555-0102',
        businessEmail: 'sales@automall.com',
        logo: 'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/vendors/auto-mall-logo.png',
        documents: [],
        status: VendorStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: admin?._id,
        totalGoods: 0,
        rating: 4.6,
      },
      {
        user: vendorUsers[2]?._id!,
        businessName: 'Prime Properties Real Estate',
        businessDescription: 'Full-service real estate company specializing in residential and commercial properties for sale and lease. Our experienced agents help you find your perfect property.',
        businessAddress: '789 Property Lane, New York, NY 10001',
        businessPhone: '+1 555-0103',
        businessEmail: 'info@primeproperties.com',
        logo: 'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/vendors/prime-properties-logo.png',
        documents: [],
        status: VendorStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: admin?._id,
        totalGoods: 0,
        rating: 4.9,
      },
      {
        user: vendorUsers[3]?._id!,
        businessName: 'Style Shop Fashion',
        businessDescription: 'Trendy fashion boutique offering the latest styles in clothing, shoes, and accessories for men and women. Quality fashion at affordable prices.',
        businessAddress: '321 Fashion Street, Los Angeles, CA 90001',
        businessPhone: '+1 555-0104',
        businessEmail: 'hello@styleshop.com',
        logo: 'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/vendors/style-shop-logo.png',
        documents: [],
        status: VendorStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: admin?._id,
        totalGoods: 0,
        rating: 4.7,
      },
      {
        user: vendorUsers[4]?._id!,
        businessName: 'Sports Gear Pro',
        businessDescription: 'Your one-stop shop for all sports equipment and gear. From fitness equipment to outdoor adventure gear, we have everything you need for an active lifestyle.',
        businessAddress: '555 Sports Way, Denver, CO 80201',
        businessPhone: '+1 555-0105',
        businessEmail: 'support@sportsgear.com',
        logo: 'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/vendors/sports-gear-logo.png',
        documents: [],
        status: VendorStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: admin?._id,
        totalGoods: 0,
        rating: 4.5,
      },
      // Pending Vendor
      {
        user: pendingUser?._id!,
        businessName: 'New Ventures LLC',
        businessDescription: 'A new startup offering innovative products and services. Currently awaiting verification to start listing products.',
        businessAddress: '999 Startup Road, Austin, TX 78701',
        businessPhone: '+1 555-0301',
        businessEmail: 'hello@newventures.com',
        documents: [],
        status: VendorStatus.PENDING,
        totalGoods: 0,
        rating: 0,
      },
    ];

    const vendors = await this.vendorModel.insertMany(vendorsData);
    console.log(`   ✓ Created ${vendors.length} vendors`);
    
    return vendors;
  }

  private async seedGoods(vendors: VendorDocument[], users: UserDocument[]) {
    console.log('📦 Seeding goods...');

    const verifiedVendors = vendors.filter((v) => v.status === VendorStatus.VERIFIED);
    const admin = users.find((u) => u.role === Role.ADMIN);

    // Sample Cloudinary image URLs (using placeholder structure)
    const sampleImages = {
      electronics: [
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/iphone-15-pro.jpg',
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/macbook-pro.jpg',
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/samsung-tv.jpg',
      ],
      vehicles: [
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/tesla-model-3.jpg',
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/bmw-x5.jpg',
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/toyota-camry.jpg',
      ],
      realEstate: [
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/luxury-apartment.jpg',
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/office-space.jpg',
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/family-home.jpg',
      ],
      fashion: [
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/designer-dress.jpg',
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/leather-jacket.jpg',
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/sneakers.jpg',
      ],
      sports: [
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/treadmill.jpg',
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/mountain-bike.jpg',
        'https://res.cloudinary.com/dvawopdt3/image/upload/v1234567890/imagefolder/goods/camping-tent.jpg',
      ],
    };

    const goodsData = [
      // Electronics (Tech Store)
      {
        title: 'iPhone 15 Pro Max 256GB',
        description: 'Brand new iPhone 15 Pro Max with 256GB storage. Features A17 Pro chip, titanium design, 48MP camera system, and all-day battery life. Comes with original box and accessories. 1-year Apple warranty included.',
        price: 1199,
        type: GoodsType.SALE,
        category: 'Electronics',
        images: [sampleImages.electronics[0]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[0]._id,
        createdBy: users.find((u) => u.email === 'john@techstore.com')?._id,
        location: 'Silicon Valley, CA',
        specifications: {
          brand: 'Apple',
          model: 'iPhone 15 Pro Max',
          storage: '256GB',
          color: 'Natural Titanium',
          condition: 'New',
        },
        views: 245,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },
      {
        title: 'MacBook Pro 16" M3 Max',
        description: 'Powerful MacBook Pro with M3 Max chip, 36GB unified memory, and 1TB SSD. Perfect for professional video editing, 3D rendering, and software development. Stunning Liquid Retina XDR display.',
        price: 3499,
        type: GoodsType.SALE,
        category: 'Electronics',
        images: [sampleImages.electronics[1]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[0]._id,
        createdBy: users.find((u) => u.email === 'john@techstore.com')?._id,
        location: 'Silicon Valley, CA',
        specifications: {
          brand: 'Apple',
          model: 'MacBook Pro 16"',
          chip: 'M3 Max',
          memory: '36GB',
          storage: '1TB SSD',
          condition: 'New',
        },
        views: 189,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },
      {
        title: 'Samsung 65" OLED 4K Smart TV',
        description: 'Experience stunning picture quality with this 65-inch Samsung OLED TV. Features 4K resolution, smart TV capabilities, and immersive Dolby Atmos sound. Perfect for movies and gaming.',
        price: 1799,
        type: GoodsType.SALE,
        category: 'Electronics',
        images: [sampleImages.electronics[2]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[0]._id,
        createdBy: users.find((u) => u.email === 'john@techstore.com')?._id,
        location: 'Silicon Valley, CA',
        specifications: {
          brand: 'Samsung',
          screenSize: '65 inches',
          resolution: '4K UHD',
          type: 'OLED',
          smartTV: true,
        },
        views: 156,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },
      {
        title: 'Professional Camera Kit for Rent',
        description: 'High-end Sony A7R V camera kit available for rent. Includes camera body, 24-70mm f/2.8 lens, 70-200mm f/2.8 lens, tripod, and carrying case. Perfect for professional photo shoots and video production.',
        price: 150,
        type: GoodsType.LEASE,
        category: 'Electronics',
        images: [sampleImages.electronics[0]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[0]._id,
        createdBy: users.find((u) => u.email === 'john@techstore.com')?._id,
        location: 'Silicon Valley, CA',
        specifications: {
          brand: 'Sony',
          model: 'A7R V',
          rentalPeriod: 'Daily',
          includes: 'Camera, 2 lenses, tripod, case',
        },
        views: 89,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },

      // Vehicles (Auto Mall)
      {
        title: '2024 Tesla Model 3 Long Range',
        description: 'Nearly new 2024 Tesla Model 3 Long Range with only 2,000 miles. Pearl White exterior, black interior. Full self-driving capability included. Excellent condition with all service records.',
        price: 42999,
        type: GoodsType.SALE,
        category: 'Vehicles',
        images: [sampleImages.vehicles[0]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[1]._id,
        createdBy: users.find((u) => u.email === 'sarah@automall.com')?._id,
        location: 'Detroit, MI',
        specifications: {
          make: 'Tesla',
          model: 'Model 3 Long Range',
          year: 2024,
          mileage: '2,000 miles',
          color: 'Pearl White',
          fuelType: 'Electric',
        },
        views: 412,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },
      {
        title: '2023 BMW X5 xDrive40i',
        description: 'Luxurious 2023 BMW X5 in Alpine White. Features premium package, panoramic sunroof, heated seats, and advanced driver assistance. One owner, dealer maintained.',
        price: 58500,
        type: GoodsType.SALE,
        category: 'Vehicles',
        images: [sampleImages.vehicles[1]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[1]._id,
        createdBy: users.find((u) => u.email === 'sarah@automall.com')?._id,
        location: 'Detroit, MI',
        specifications: {
          make: 'BMW',
          model: 'X5 xDrive40i',
          year: 2023,
          mileage: '15,000 miles',
          color: 'Alpine White',
          engine: '3.0L Turbo I6',
        },
        views: 287,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },
      {
        title: 'Toyota Camry Monthly Lease',
        description: 'Reliable 2024 Toyota Camry available for monthly lease. Perfect for business travelers or those needing a temporary vehicle. Insurance included. Unlimited mileage within city limits.',
        price: 850,
        type: GoodsType.LEASE,
        category: 'Vehicles',
        images: [sampleImages.vehicles[2]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[1]._id,
        createdBy: users.find((u) => u.email === 'sarah@automall.com')?._id,
        location: 'Detroit, MI',
        specifications: {
          make: 'Toyota',
          model: 'Camry',
          year: 2024,
          leaseTerms: 'Monthly',
          includesInsurance: true,
        },
        views: 178,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },

      // Real Estate (Prime Properties)
      {
        title: 'Luxury Downtown Apartment',
        description: 'Stunning 2-bedroom luxury apartment in the heart of downtown. Floor-to-ceiling windows, modern kitchen with premium appliances, in-unit washer/dryer, 24/7 concierge, rooftop pool, and fitness center.',
        price: 3500,
        type: GoodsType.LEASE,
        category: 'Real Estate',
        images: [sampleImages.realEstate[0]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[2]._id,
        createdBy: users.find((u) => u.email === 'mike@realestate.com')?._id,
        location: 'New York, NY',
        specifications: {
          propertyType: 'Apartment',
          bedrooms: 2,
          bathrooms: 2,
          sqft: 1200,
          amenities: 'Pool, Gym, Concierge, Parking',
          petFriendly: true,
        },
        views: 534,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },
      {
        title: 'Modern Office Space for Lease',
        description: 'Professional office space in prime business district. Open floor plan, high ceilings, fiber internet, conference room, kitchen area, and reception desk. Available for 1-5 year lease terms.',
        price: 5500,
        type: GoodsType.LEASE,
        category: 'Real Estate',
        images: [sampleImages.realEstate[1]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[2]._id,
        createdBy: users.find((u) => u.email === 'mike@realestate.com')?._id,
        location: 'New York, NY',
        specifications: {
          propertyType: 'Commercial Office',
          sqft: 2500,
          floor: 15,
          parking: '5 spots included',
          leaseTerms: '1-5 years',
        },
        views: 312,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },
      {
        title: 'Beautiful Family Home - 4BR/3BA',
        description: 'Charming family home in quiet suburban neighborhood. Features spacious living areas, updated kitchen, hardwood floors, large backyard, 2-car garage, and excellent school district.',
        price: 450000,
        type: GoodsType.SALE,
        category: 'Real Estate',
        images: [sampleImages.realEstate[2]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[2]._id,
        createdBy: users.find((u) => u.email === 'mike@realestate.com')?._id,
        location: 'New York, NY',
        specifications: {
          propertyType: 'Single Family Home',
          bedrooms: 4,
          bathrooms: 3,
          sqft: 2800,
          lotSize: '0.5 acres',
          yearBuilt: 2018,
        },
        views: 623,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },

      // Fashion (Style Shop)
      {
        title: 'Designer Evening Dress',
        description: 'Elegant designer evening dress perfect for special occasions. Made from premium silk blend fabric with intricate beading details. Available in sizes 2-14. Dry clean only.',
        price: 450,
        type: GoodsType.SALE,
        category: 'Fashion',
        images: [sampleImages.fashion[0]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[3]._id,
        createdBy: users.find((u) => u.email === 'emily@styleshop.com')?._id,
        location: 'Los Angeles, CA',
        specifications: {
          brand: 'Luxury Fashion',
          material: 'Silk Blend',
          sizes: '2-14',
          color: 'Midnight Blue',
          care: 'Dry Clean Only',
        },
        views: 234,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },
      {
        title: 'Genuine Leather Jacket',
        description: 'Classic genuine leather motorcycle jacket. Premium quality leather with satin lining. Features multiple pockets and adjustable waist. A timeless wardrobe essential.',
        price: 350,
        type: GoodsType.SALE,
        category: 'Fashion',
        images: [sampleImages.fashion[1]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[3]._id,
        createdBy: users.find((u) => u.email === 'emily@styleshop.com')?._id,
        location: 'Los Angeles, CA',
        specifications: {
          material: 'Genuine Leather',
          sizes: 'S, M, L, XL',
          color: 'Black',
          lining: 'Satin',
        },
        views: 189,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },
      {
        title: 'Limited Edition Sneakers',
        description: 'Exclusive limited edition sneakers from collaboration collection. Only 500 pairs produced worldwide. Brand new in box with authentication certificate.',
        price: 280,
        type: GoodsType.SALE,
        category: 'Fashion',
        images: [sampleImages.fashion[2]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[3]._id,
        createdBy: users.find((u) => u.email === 'emily@styleshop.com')?._id,
        location: 'Los Angeles, CA',
        specifications: {
          brand: 'Premium Sneakers',
          sizes: '7-13',
          edition: 'Limited (500 pairs)',
          condition: 'New in Box',
        },
        views: 445,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },

      // Sports (Sports Gear Pro)
      {
        title: 'Commercial Treadmill',
        description: 'Professional-grade commercial treadmill perfect for home gym or fitness center. Features 4.0 HP motor, 15% incline, built-in programs, heart rate monitor, and entertainment console.',
        price: 2499,
        type: GoodsType.SALE,
        category: 'Sports',
        images: [sampleImages.sports[0]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[4]._id,
        createdBy: users.find((u) => u.email === 'david@sportsgear.com')?._id,
        location: 'Denver, CO',
        specifications: {
          brand: 'FitPro',
          motor: '4.0 HP',
          maxSpeed: '12 mph',
          incline: '0-15%',
          weight: '350 lbs',
        },
        views: 167,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },
      {
        title: 'Mountain Bike - Carbon Frame',
        description: 'High-performance mountain bike with full carbon frame. Features 29" wheels, 12-speed drivetrain, hydraulic disc brakes, and adjustable suspension. Perfect for trail riding and competitions.',
        price: 3200,
        type: GoodsType.SALE,
        category: 'Sports',
        images: [sampleImages.sports[1]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[4]._id,
        createdBy: users.find((u) => u.email === 'david@sportsgear.com')?._id,
        location: 'Denver, CO',
        specifications: {
          frame: 'Carbon Fiber',
          wheelSize: '29 inches',
          gears: '12-speed',
          brakes: 'Hydraulic Disc',
          suspension: 'Full Suspension',
        },
        views: 234,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },
      {
        title: 'Camping Gear Rental Package',
        description: 'Complete camping package available for rent. Includes 4-person tent, sleeping bags (4), camping stove, cooler, lantern, and basic cookware. Perfect for weekend adventures.',
        price: 75,
        type: GoodsType.LEASE,
        category: 'Sports',
        images: [sampleImages.sports[2]],
        status: GoodsStatus.APPROVED,
        vendor: verifiedVendors[4]._id,
        createdBy: users.find((u) => u.email === 'david@sportsgear.com')?._id,
        location: 'Denver, CO',
        specifications: {
          tentCapacity: '4 persons',
          includes: 'Tent, 4 sleeping bags, stove, cooler, lantern, cookware',
          rentalPeriod: 'Daily/Weekend',
        },
        views: 123,
        approvedAt: new Date(),
        approvedBy: admin?._id,
        isAvailable: true,
      },

      // Pending Goods
      {
        title: 'Vintage Watch Collection',
        description: 'Rare collection of vintage watches from the 1960s. Includes 3 timepieces in working condition with original boxes. Great investment opportunity.',
        price: 5500,
        type: GoodsType.SALE,
        category: 'Other',
        images: [],
        status: GoodsStatus.PENDING,
        vendor: verifiedVendors[0]._id,
        createdBy: users.find((u) => u.email === 'john@techstore.com')?._id,
        location: 'Silicon Valley, CA',
        views: 0,
        isAvailable: true,
      },
      {
        title: 'Antique Furniture Set',
        description: 'Beautiful antique furniture set from the Victorian era. Includes sofa, two armchairs, and coffee table. Fully restored and in excellent condition.',
        price: 8000,
        type: GoodsType.SALE,
        category: 'Home & Garden',
        images: [],
        status: GoodsStatus.PENDING,
        vendor: verifiedVendors[2]._id,
        createdBy: users.find((u) => u.email === 'mike@realestate.com')?._id,
        location: 'New York, NY',
        views: 0,
        isAvailable: true,
      },

      // Flagged Goods
      {
        title: 'Suspicious Electronics Lot',
        description: 'Large lot of mixed electronics. Various brands and conditions.',
        price: 999,
        type: GoodsType.SALE,
        category: 'Electronics',
        images: [],
        status: GoodsStatus.FLAGGED,
        vendor: verifiedVendors[0]._id,
        createdBy: users.find((u) => u.email === 'john@techstore.com')?._id,
        location: 'Unknown',
        flagReason: 'Incomplete product information and suspicious pricing',
        flaggedBy: admin?._id,
        flaggedAt: new Date(),
        views: 23,
        isAvailable: false,
      },
    ];

    const goods = await this.goodsModel.insertMany(goodsData);
    console.log(`   ✓ Created ${goods.length} goods`);

    // Update vendor goods counts
    for (const vendor of verifiedVendors) {
      const count = goods.filter(
        (g) => g.vendor.toString() === vendor._id.toString() && g.status === GoodsStatus.APPROVED
      ).length;
      await this.vendorModel.findByIdAndUpdate(vendor._id, { totalGoods: count });
    }
    console.log('   ✓ Updated vendor goods counts');
  }
}