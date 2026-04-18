const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    
    const newMessage = new Message({
      senderId: req.userId,
      receiverId,
      message
    });
    
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversations for user
router.get('/conversations', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.userId }, { receiverId: req.userId }]
    }).sort({ createdAt: -1 });
    
    // Get unique users
    const userIds = new Set();
    messages.forEach(msg => {
      userIds.add(msg.senderId.toString());
      userIds.add(msg.receiverId.toString());
    });
    
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('fullName email');
    
    res.json({ messages, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between two users
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.userId, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.userId }
      ]
    }).sort({ createdAt: 1 });
    
    // Mark as read
    await Message.updateMany(
      { senderId: req.params.userId, receiverId: req.userId, isRead: false },
      { isRead: true }
    );
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;