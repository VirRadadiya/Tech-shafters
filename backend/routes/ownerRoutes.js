const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');

router.get('/dashboard', ownerController.getOwnerDashboard);
router.post('/properties', ownerController.addOwnerProperty);
router.patch('/properties/:id/status', ownerController.toggleListingStatus);

module.exports = router;
