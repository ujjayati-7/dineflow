const Order = require('../models/Order')
const MenuItem = require('../models/MenuItem')

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  const { tableNumber, items, specialInstructions } = req.body

  if (!tableNumber || !items || items.length === 0) {
    return res.status(400).json({ message: 'Missing table number or items' })
  }

  try {
    let totalAmount = 0
    const orderItems = []

    // 1. Verify inventory and calculate total
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId)

      if (!menuItem) return res.status(404).json({ message: `Item not found` })
      if (!menuItem.isAvailable || menuItem.dailyInventory < item.quantity) {
        return res
          .status(400)
          .json({ message: `${menuItem.name} is sold out!` })
      }

      totalAmount += menuItem.price * item.quantity
      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
      })
    }

    // 2. Create the order
    const order = await Order.create({
      tableNumber,
      items: orderItems,
      totalAmount,
      specialInstructions,
    })

    // 3. Decrement inventory
    for (const item of items) {
      await MenuItem.findByIdAndUpdate(item.menuItemId, {
        $inc: { dailyInventory: -item.quantity },
      })
    }
    const io = req.app.get('io')
    if (io) {
      io.emit('newOrder', order)
    }

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get active orders (for Kitchen Display)
// @route   GET /api/orders/active
exports.getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['received', 'preparing', 'ready'] },
    }).sort({ createdAt: 1 })
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update order status (e.g., received -> preparing -> ready)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    )
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
