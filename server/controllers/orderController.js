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
    // Added 'pending_payment' so waiters can see pending bills!
    const orders = await Order.find({
      status: { $in: ['received', 'preparing', 'ready', 'pending_payment'] },
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

// @desc    Get bill for a specific table
// @route   GET /api/orders/table/:tableNumber
exports.getTableBill = async (req, res) => {
  try {
    const orders = await Order.find({ 
      tableNumber: req.params.tableNumber, 
      status: { $ne: 'paid' } 
    });
    
    const subtotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const gst = subtotal * 0.05; // 5% GST
    const grandTotal = subtotal + gst;
    
    res.status(200).json({ orders, subtotal, gst, grandTotal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Customer requests payment method
// @route   PUT /api/orders/table/:tableNumber/request-payment
exports.requestPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body; // 'cash', 'card', or 'online'
    await Order.updateMany(
      { tableNumber: req.params.tableNumber, status: { $ne: 'paid' } },
      { status: 'pending_payment', paymentMethod }
    );
    res.status(200).json({ message: "Payment requested. Waiter notified." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Waiter confirms payment is done
// @route   PUT /api/orders/table/:tableNumber/confirm-payment
exports.confirmPayment = async (req, res) => {
  try {
    await Order.updateMany(
      { tableNumber: req.params.tableNumber, status: 'pending_payment' },
      { status: 'paid' }
    );
    res.status(200).json({ message: "Payment confirmed successfully! Thank you." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sales analytics
// @route   GET /api/orders/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'paid' });
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    
    // Calculate top selling items
    const itemCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });
    
    const topItems = Object.entries(itemCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.status(200).json({ totalRevenue, totalOrders, topItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
