import User from "../models/User.js";
import bcrypt from "bcryptjs";

/**
 * Seeds default test accounts for all roles
 * Called once at server startup after DB connection
 */
const seedSuperAdmin = async () => {
  try {
    // Check if any admin exists
    const existing = await User.findOne({ role: "superAdmin" });
    if (existing) {
      console.log("✅ Test users already exist — skipping seed.");
      return;
    }

    // Create test users for all roles
    const testUsers = [
      {
        name: "Super Admin",
        email: "super@admin.com",
        password: "Admin@123",
        role: "superAdmin",
        planName: "none",
        tokens: 9999,
      },
      {
        name: "John Student",
        email: "student@example.com",
        password: "Student@123",
        role: "student",
        planName: "Free",
        tokens: 50,
        collegeId: null,
        year: 2,
        branch: "CSE",
      },
      {
        name: "Sarah Alumni",
        email: "alumni@example.com",
        password: "Alumni@123",
        role: "alumni",
        planName: "none",
        tokens: 50,
        collegeId: null,
        company: "Google",
        currentRole: "Software Engineer",
        batch: 2020,
      },
      {
        name: "College Admin",
        email: "admin@college.com",
        password: "Admin@123",
        role: "collegeAdmin",
        planName: "none",
        tokens: 50,
        collegeId: null,
      },
    ];

    // Hash passwords before bulk insert (insertMany bypasses mongoose pre 'save' hooks)
    const hashedUsers = await Promise.all(
      testUsers.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      })),
    );

    await User.insertMany(hashedUsers);

    console.log("🌱 Test users seeded:");
    console.log("   👤 Super Admin: super@admin.com / Admin@123");
    console.log("   👨‍🎓 Student: student@example.com / Student@123");
    console.log("   🎓 Alumni: alumni@example.com / Alumni@123");
    console.log("   🏫 College Admin: admin@college.com / Admin@123");
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  }
};

export default seedSuperAdmin;
