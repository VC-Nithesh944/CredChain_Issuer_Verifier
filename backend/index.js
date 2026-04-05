require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const credentialRoutes = require('./routes/credentialRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/api', credentialRoutes);

// Error Handling
app.use(errorHandler);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/credential_registry';

const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
      
      // Check if we need to seed
      const Credential = require('./models/Credential');
      const count = await Credential.countDocuments();
      if (count === 0) {
        console.log('Collection is empty, seeding demo credentials...');
        require('./scripts/seed');
      }
      break;
    } catch (err) {
      console.error('MongoDB connection error:', err);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      if (retries === 0) {
        console.log('Could not connect to MongoDB. Starting server anyway (some features may fail).');
      } else {
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
});
