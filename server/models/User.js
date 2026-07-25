const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Null if using Google OAuth
    googleId: { type: String },
    role: {
      type: String,
      enum: ['customer', 'waiter', 'chef', 'manager'],
      default: 'customer',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('User', userSchema)
