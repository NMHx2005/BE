const express = require('express');
const router = express.Router();
const { getOrderStatistics, getUserStatistics, getProductStatistics } = require('../controllers/statisticsController');

router.get('/lich-lai-thu', getOrderStatistics);
router.get('/nguoi-dung', getUserStatistics);
router.get('/san-pham', getProductStatistics);

module.exports = router; 