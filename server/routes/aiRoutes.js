const express = require('express')
const router = express.Router()
const {
  getInsights,
  getRecommendation,
} = require('../controllers/aiController')
const { protect, authorize } = require('../middleware/authMiddleware')

// Manager only route
router.post('/insights', protect, authorize('manager'), getInsights)

// Public route (customers don't need to be logged in to get a recommendation)
router.post('/recommend', getRecommendation)

module.exports = router
