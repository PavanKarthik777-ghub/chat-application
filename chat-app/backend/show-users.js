import mongoose from 'mongoose';
import User from './src/models/User.js';

// Use the same connection string as the backend
const MONGO_URI = 'mongodb+srv://13194msd_db_user:eqVOLIeVE50Ky5Gv@clusterpk.hpkqiqm.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPK';

async function showUsers() {
  try {
    console.log('🔍 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database');
    
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users in your database:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 User Details:`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👋 Name: ${user.name}`);
      console.log(`   🆔 ID: ${user._id}`);
      console.log(`   📅 Created: ${user.createdAt}`);
      console.log(`   🖼️  Avatar: ${user.avatarUrl || 'No avatar'}`);
      console.log(`   🕒 Last Seen: ${user.lastSeenAt || 'Never'}`);
      console.log('   ' + '─'.repeat(50));
    });
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

showUsers();
