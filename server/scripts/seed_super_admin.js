import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const email = 'super@admin.com';
    const password = 'Admin@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const update = {
      name: 'Platform Owner',
      password: hashedPassword,
      role: 'superAdmin',
      planName: 'none',
      planStatus: 'none',
      paymentStatus: 'none'
    };

    const user = await User.findOneAndUpdate(
      { email },
      { $set: update },
      { upsert: true, new: true }
    );

    console.log('Super Admin account secured:', user.email);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
