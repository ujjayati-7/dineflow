const express = require('express')
const router = express.Router()
const {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
} = require('../controllers/menuController')
const { protect, authorize } = require('../middleware/authMiddleware')

// Public route to get menu (doesn't require login for customers scanning QR)
router.get('/', getMenuItems)

// Manager only routes
router.post('/', protect, authorize('manager'), createMenuItem)
router.put('/:id', protect, authorize('manager'), updateMenuItem)

module.exports = router
