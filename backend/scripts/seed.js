const mongoose = require('mongoose');
const crypto = require('crypto');
const Credential = require('../models/Credential');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/credential_registry';

const seedData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }
    
    const courses = ['B.Tech Computer Science', 'MBA Finance', 'B.Sc Data Science', 'Diploma in AI', 'M.Tech Cybersecurity'];
    const grades = ['A+', 'A', 'B+', 'Distinction', 'First Class'];
    const issuer = '0x1234567890123456789012345678901234567890'; // Mock issuer address
    
    for (let i = 0; i < 10; i++) {
      const credentialId = crypto.randomUUID();
      const course = courses[Math.floor(Math.random() * courses.length)];
      const grade = grades[Math.floor(Math.random() * grades.length)];
      
      const credentialData = {
        credentialId,
        recipientName: `Student ${i + 1}`,
        course,
        grade,
        issuerAddress: issuer,
        issuedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
      };
      
      const jsonString = JSON.stringify(credentialData);
      const hash = '0x' + crypto.createHash('sha256').update(jsonString).digest('hex');
      
      const credential = new Credential({
        ...credentialData,
        ipfsCid: `QmDemo${crypto.randomBytes(16).toString('hex')}`,
        hash,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`
      });
      
      await credential.save();
      console.log(`Inserted mock credential: ${credentialId}`);
    }
    
    console.log('Seeding complete');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seeding error:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
