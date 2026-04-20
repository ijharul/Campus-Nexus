import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../server/src/models/User.js';

dotenv.config({ path: './server/.env' });

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alumni_association');
    console.log('Connected to MongoDB');
    
    const users = await User.find({}, 'name email role');
    console.log('Current Users in Database:');
    users.forEach(u => console.log(`- ${u.name} (${u.email}) [Role: ${u.role}]`));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUsers();
