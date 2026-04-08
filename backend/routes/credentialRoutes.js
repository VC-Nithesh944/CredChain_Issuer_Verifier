const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const path = require('path');
const fs = require('fs');

router.post('/credentials', credentialController.issueCredential);
router.get('/credentials/:id', credentialController.verifyCredential);
router.get('/credentials', credentialController.listCredentials);
router.get('/stats', credentialController.getStats);

router.get('/config', (req, res) => {
  try {
    const configPath = path.join(__dirname, '../contractConfig.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      res.json(config);
    } else {
      res.status(404).json({ error: 'Contract config not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read contract config' });
  }
});

module.exports = router;
