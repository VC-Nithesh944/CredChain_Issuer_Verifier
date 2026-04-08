const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/credential_registry';

const resetData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    await mongoose.connection.dropCollection('credentials');
    console.log('Credentials collection dropped');
    process.exit(0);
  } catch (error) {
    if (error.code === 26) {
      console.log('Collection does not exist, nothing to drop');
      process.exit(0);
    }
    console.error('Reset error:', error);
    process.exit(1);
  }
};

resetData();
