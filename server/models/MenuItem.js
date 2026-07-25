const mongoose = require('mongoose')

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    prepTimeMins: { type: Number, default: 15 },
    dailyInventory: { type: Number, default: 50 },
    isAvailable: { type: Boolean, default: true },
    category: {
      type: String,
      enum: ['Starters', 'Mains', 'Desserts', 'Drinks'],
      default: 'Mains',
    },
    salesHistory: [{ date: Date, quantitySold: Number }], // For AI forecasting
  },
  { timestamps: true },
)

module.exports = mongoose.model('MenuItem', menuItemSchema)
