const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const passport = require('passport')
const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)

// @desc    Google OAuth Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// @desc    Google OAuth Callback
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate JWT for the Google user
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
    
    // Redirect back to frontend with token in URL
    res.redirect(`http://localhost:3000/login?token=${token}`)
  }
)

module.exports = router
