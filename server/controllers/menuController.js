const MenuItem = require('../models/MenuItem')

// @desc    Create a new menu item
// @route   POST /api/menu
exports.createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body)
    res.status(201).json(item)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// @desc    Get all menu items
// @route   GET /api/menu
exports.getMenuItems = async (req, res) => {
  try {
    // If customer, only show available items. If staff, show all.
    const filter =
      req.user && (req.user.role === 'manager' || req.user.role === 'chef')
        ? {}
        : { isAvailable: true }
    const items = await MenuItem.find(filter).sort({ category: 1 })
    res.status(200).json(items)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update a menu item (e.g., change inventory or mark sold out)
// @route   PUT /api/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    if (!item) return res.status(404).json({ message: 'Item not found' })
    res.status(200).json(item)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
