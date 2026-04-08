const crypto = require('crypto');
const { PinataSDK } = require('pinata-web3');

const pinata = process.env.PINATA_JWT ? new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: "gateway.pinata.cloud",
}) : null;

exports.uploadToIPFS = async (jsonData) => {
  if (!process.env.PINATA_JWT) {
    console.log("MOCK IPFS MODE: Returning mock CID");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `QmMock${crypto.randomBytes(16).toString('hex')}`;
  }

  try {
    const upload = await pinata.upload.json(jsonData);
    return upload.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw new Error("Failed to upload to IPFS");
  }
};
