const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')
const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        'https://dineflow-api-3nh3.onrender.com/api/auth/google/callback', // <--- REPLACE WITH YOUR ACTUAL RENDER URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id })
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            role: 'customer',
          })
        }
        done(null, user)
      } catch (err) {
        done(err, null)
      }
    },
  ),
)

// Email/Password Auth Routes
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)

// Google OAuth Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
)

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate JWT for the Google user
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    })

    // Redirect back to the live frontend with token in URL
    res.redirect(
      `https://dineflow-hvjgrijqu-ujjayatis-projects.vercel.app/login?token=${token}`) // <--- REPLACE WITH YOUR ACTUAL VERCEL URL
  },
)

module.exports = router
