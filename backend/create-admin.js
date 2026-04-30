const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/apply-tracker')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema (inline for this script)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      authProvider: 'local',
    };

    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const adminUser = new User({
      ...adminData,
      password: hashedPassword,
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Role:', adminData.role);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
