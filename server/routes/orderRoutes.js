const express = require('express')
const router = express.Router()
const {
  createOrder,
  getActiveOrders,
  updateOrderStatus,
} = require('../controllers/orderController')
const { protect, authorize } = require('../middleware/authMiddleware')

// Customer can create order (must be logged in to prevent spam)
router.post('/', protect, createOrder)

// Staff only routes
router.get(
  '/active',
  protect,
  authorize('chef', 'waiter', 'manager'),
  getActiveOrders,
)
router.put(
  '/:id/status',
  protect,
  authorize('chef', 'waiter', 'manager'),
  updateOrderStatus,
)

module.exports = router
