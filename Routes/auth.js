const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, phone, userType, companyName } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = new User({
      fullName,
      email,
      password,
      phone,
      userType,
      companyName
    });
    
    await user.save();
    
    const token = jwt.sign({ userId: user._id, userType: user.userType }, process.env.JWT_SECRET);
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign({ userId: user._id, userType: user.userType }, process.env.JWT_SECRET);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        companyName: user.companyName,
        onboardingAnswers: user.onboardingAnswers
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'AramSeKaam - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #667eea;">AramSeKaam</h2>
          <h3>Email Verification</h3>
          <p>Your OTP for verification is:</p>
          <div style="font-size: 32px; font-weight: bold; color: #764ba2; text-align: center; padding: 20px;">${otp}</div>
          <p>This OTP is valid for 10 minutes.</p>
          <hr>
          <p style="color: #999; font-size: 12px;">AramSeKaam Job Portal</p>
        </div>
      `
    });
    
    res.json({ message: 'OTP sent successfully', otp });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// Update onboarding answers
router.put('/onboarding/:userId', async (req, res) => {
  try {
    const { onboardingAnswers } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { onboardingAnswers },
      { new: true }
    );
    res.json({ message: 'Onboarding completed', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { fullName, phone, password } = req.body;
    const updates = { fullName, phone };
    if (password) updates.password = password;
    
    const user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true }).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;