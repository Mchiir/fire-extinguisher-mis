/**
 * Seeds a default admin user for initial system access.
 * Run: pnpm seed:admin
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config/index.js';
import User from '../models/User.js';
import { ROLES } from '../constants/roles.js';

dotenv.config();

const seedAdmin = async () => {
  await mongoose.connect(config.mongodbUri);

  const email = process.env.ADMIN_EMAIL || 'admin@firemis.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists');
    process.exit(0);
  }

  await User.create({
    firstName: 'System',
    lastName: 'Admin',
    email,
    password,
    role: ROLES.ADMIN,
  });

  console.log(`Admin seeded: ${email}`);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
