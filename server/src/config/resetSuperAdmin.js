/**
 * One-time reset script: deletes the double-hashed superAdmin so the corrected
 * seedSuperAdmin.js can recreate it with a valid password on next server start.
 *
 * Run once with:  node src/config/resetSuperAdmin.js
 * Then restart the server normally.
 */
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error('❌ No MongoDB URI found in .env (tried MONGO_URI, MONGODB_URI, DATABASE_URL)');
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log('✅ Connected to MongoDB');

const result = await mongoose.connection.collection('users').deleteOne({ email: 'super@admin.com' });
console.log(
  result.deletedCount === 1
    ? '🗑️  Deleted corrupted super@admin.com — restart the server to re-seed correctly'
    : 'ℹ️  super@admin.com not found (nothing to delete)'
);

await mongoose.disconnect();
process.exit(0);
