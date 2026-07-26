const express = require('express')
const router = express.Router()
const {
  getTables,
  updateTableStatus,
} = require('../controllers/tableController')
const { protect, authorize } = require('../middleware/authMiddleware')

router.get('/', protect, authorize('waiter', 'manager'), getTables)
router.put('/:id', protect, authorize('waiter', 'manager'), updateTableStatus)

module.exports = router
