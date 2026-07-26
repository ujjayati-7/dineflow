const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true },
    items: [
      {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        name: String, // Stored for historical reference
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['none', 'cash', 'card', 'online'],
      default: 'none',
    },
    status: {
      type: String,
      enum: ['received', 'preparing', 'ready', 'served', 'paid'],
      default: 'received',
    },
    specialInstructions: { type: String },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Order', orderSchema)
