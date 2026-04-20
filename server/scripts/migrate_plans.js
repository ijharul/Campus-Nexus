import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for migration...');

    const users = await User.find({});
    let updatedCount = 0;

    for (const user of users) {
      const updates = {};
      
      // If student, attempt to preserve plan if it exists
      if (user.role === 'student') {
        const legacyPlan = user.get('plan') || 'Free';
        updates.planName = legacyPlan;
        updates.planStatus = (legacyPlan === 'Free' || legacyPlan === 'none') ? 'none' : 'active';
        updates.paymentStatus = (legacyPlan === 'Free' || legacyPlan === 'none') ? 'none' : 'paid';
        
        if (!user.expiryDate && updates.planStatus === 'active') {
          const expiry = new Date();
          expiry.setMonth(expiry.getMonth() + 1);
          updates.expiryDate = expiry;
        }
      } else {
        // Non-students are strictly 'none'
        updates.planName = 'none';
        updates.planStatus = 'none';
        updates.paymentStatus = 'none';
        updates.expiryDate = null;
      }

      await User.findByIdAndUpdate(user._id, { 
        $set: updates,
        $unset: { plan: "" } // Remove legacy field
      });
      updatedCount++;
    }

    console.log(`Successfully migrated ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
