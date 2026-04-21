import User from "../models/User.js";
import bcrypt from "bcryptjs";

/**
 * Seeds the official Super Admin account
 * Called once at server startup after DB connection
 */
const seedSuperAdmin = async () => {
  try {
    // Check if the specific super admin already exists
    const existing = await User.findOne({ email: "haqueijharul0786@gmail.com" });
    
    if (existing) {
      // Ensure the password is correct even if user exists (for reset purposes)
      existing.password = "Projects@1127";
      await existing.save();
      console.log("Super Admin password synchronized.");
      return;
    }

    // Create the official Super Admin
    const superAdmin = {
      name: "Super Admin",
      email: "haqueijharul0786@gmail.com",
      password: "Projects@1127", // Plain text, User model will hash it in pre-save
      role: "superAdmin",
      planName: "none",
      tokens: 999999,
    };

    await User.create(superAdmin);

    console.log("🚀 PRODUCTION SEED COMPLETE:");
    console.log("   👤 Super Admin: haqueijharul0786@gmail.com / [CONFIGURED]");
    console.log("   ⚠️ System is now ready for production requests.");
    
  } catch (err) {
    console.error("Seed error:", err.message);
  }
};

export default seedSuperAdmin;
