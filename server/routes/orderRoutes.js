const express = require('express')
const router = express.Router()
const {
  createOrder,
  getActiveOrders,
  updateOrderStatus,
  getTableBill,
  requestPayment,
  confirmPayment,
  getAnalytics,
} = require('../controllers/orderController')
const { protect, authorize } = require('../middleware/authMiddleware')

// Customer can create order
router.post('/', protect, createOrder)

// Staff only routes
router.get(
  '/active',
  protect,
  authorize('chef', 'waiter', 'manager'),
  getActiveOrders,
)
router.get('/analytics', protect, authorize('manager'), getAnalytics)
router.put(
  '/:id/status',
  protect,
  authorize('chef', 'waiter', 'manager'),
  updateOrderStatus,
)

// Table Bill routes
router.get('/table/:tableNumber', protect, getTableBill)
router.put('/table/:tableNumber/request-payment', protect, requestPayment)
router.put(
  '/table/:tableNumber/confirm-payment',
  protect,
  authorize('waiter', 'manager'),
  confirmPayment,
)

// Customer simulates paying via UPI QR code
router.put('/table/:tableNumber/online-paid', protect, authorize('customer', 'manager'), confirmPayment);

module.exports = router
