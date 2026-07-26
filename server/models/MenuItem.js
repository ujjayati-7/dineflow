const mongoose = require('mongoose')

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    },
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
