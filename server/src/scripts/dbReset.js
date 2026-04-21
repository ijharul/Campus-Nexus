import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Payment from '../models/Payment.js';
import College from '../models/College.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Notice from '../models/Notice.js';
import ActivityLog from '../models/ActivityLog.js';
import Campaign from '../models/Campaign.js';
import Report from '../models/Report.js';
import Referral from '../models/Referral.js';
import Mentorship from '../models/Mentorship.js';

dotenv.config({ path: './.env' });

const resetDB = async () => {
  try {
    await connectDB();
    
    console.log('⚠️  WARNING: Clearing all data from the database...');
    
    // Clear all collections
    await Promise.all([
      User.deleteMany({}),
      PlacementDrive.deleteMany({}),
      Payment.deleteMany({}),
      College.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      Notice.deleteMany({}),
      ActivityLog.deleteMany({}),
      Campaign.deleteMany({}),
      Report.deleteMany({}),
      Referral.deleteMany({}),
      Mentorship.deleteMany({})
    ]);

    console.log('✅ Database cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  }
};

resetDB();
