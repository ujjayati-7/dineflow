const Table = require('../models/Table')

// @desc    Get all tables
// @route   GET /api/tables
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 })
    res.status(200).json(tables)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update table status
// @route   PUT /api/tables/:id
exports.updateTableStatus = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    )
    if (!table) return res.status(404).json({ message: 'Table not found' })
    res.status(200).json(table)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
