const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  credentialId: {
    type: String,
    required: true,
    unique: true
  },
  recipientName: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  issuerAddress: {
    type: String,
    required: true
  },
  ipfsCid: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  txHash: {
    type: String
  }
});

module.exports = mongoose.model('Credential', credentialSchema);
