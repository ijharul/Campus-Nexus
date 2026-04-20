import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error("❌ No MongoDB URI found in .env");
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

const result = await mongoose.connection.collection("users").deleteMany({});
console.log(`🗑️  Deleted ${result.deletedCount} users`);

await mongoose.disconnect();
process.exit(0);
