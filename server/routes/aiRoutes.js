const express = require('express')
const router = express.Router()
const { getInsights } = require('../controllers/aiController')
const { protect, authorize } = require('../middleware/authMiddleware')

// Manager only route
router.post('/insights', protect, authorize('manager'), getInsights)

module.exports = router
