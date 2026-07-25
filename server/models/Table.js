const mongoose = require('mongoose')

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number, default: 4 },
    status: {
      type: String,
      enum: ['available', 'occupied', 'cleaning', 'reserved'],
      default: 'available',
    },
    currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Table', tableSchema)
