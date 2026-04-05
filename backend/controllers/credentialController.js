const crypto = require("crypto");
const { ethers } = require("ethers");
const Credential = require("../models/Credential");
const pinataService = require("../services/pinataService");

let contractConfigCache = null;

const loadContractConfig = () => {
  if (contractConfigCache) {
    return contractConfigCache;
  }

  try {
    // Lazy-load so backend can still boot even if config is missing.
    // eslint-disable-next-line global-require, import/no-dynamic-require
    contractConfigCache = require("../contractConfig.json");
    return contractConfigCache;
  } catch (error) {
    return null;
  }
};

const isCredentialAuthentic = async (credential, contract) => {
  try {
    const result = await contract.verifyCredential(credential.credentialId);
    return (
      result.exists &&
      result.hash.toLowerCase() === credential.hash.toLowerCase()
    );
  } catch (error) {
    return false;
  }
};

exports.issueCredential = async (req, res, next) => {
  try {
    const { recipientName, course, grade, issuerAddress, txHash } = req.body;

    if (!recipientName || !course || !grade || !issuerAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const credentialId = crypto.randomUUID();
    const issuedAt = new Date().toISOString();

    const credentialData = {
      credentialId,
      recipientName,
      course,
      grade,
      issuerAddress,
      issuedAt,
    };

    // Hash the JSON
    const jsonString = JSON.stringify(credentialData);
    const hash =
      "0x" + crypto.createHash("sha256").update(jsonString).digest("hex");

    // Upload to IPFS
    const ipfsCid = await pinataService.uploadToIPFS(credentialData);

    // Save to MongoDB
    const credential = new Credential({
      credentialId,
      recipientName,
      course,
      grade,
      issuerAddress,
      ipfsCid,
      hash,
      issuedAt,
      txHash: txHash || `0xmock${crypto.randomBytes(30).toString("hex")}`,
    });

    await credential.save();

    res.status(201).json({
      credentialId,
      ipfsCid,
      hash,
      message: "Credential issued successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyCredential = async (req, res, next) => {
  try {
    const { id } = req.params;
    const credential = await Credential.findOne({ credentialId: id });

    if (!credential) {
      return res.status(404).json({ error: "Credential not found" });
    }

    res.json(credential);
  } catch (error) {
    next(error);
  }
};

exports.listCredentials = async (req, res, next) => {
  try {
    const { issuer } = req.query;
    const query = issuer
      ? { issuerAddress: new RegExp(`^${issuer}$`, "i") }
      : {};

    const credentials = await Credential.find(query).sort({ issuedAt: -1 });
    res.json(credentials);
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const contractConfig = loadContractConfig();
    let total = 0;

    if (contractConfig?.address && contractConfig?.abi) {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        provider,
      );

      const credentials = await Credential.find({});
      const authenticityChecks = await Promise.all(
        credentials.map((credential) =>
          isCredentialAuthentic(credential, contract),
        ),
      );

      total = authenticityChecks.filter(Boolean).length;
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = await Credential.countDocuments({
      issuedAt: { $gte: oneWeekAgo },
    });

    const uniqueIssuers = await Credential.distinct("issuerAddress");

    res.json({
      total,
      thisWeek,
      uniqueIssuers: uniqueIssuers.length,
    });
  } catch (error) {
    next(error);
  }
};
