const express = require('express');
const router = express.Router();
const SavedJob = require('../models/SavedJob');
const auth = require('../middleware/auth');

// Save job
router.post('/', auth, async (req, res) => {
  try {
    const { jobId, jobTitle, company, location, salary } = req.body;
    
    const existing = await SavedJob.findOne({ userId: req.userId, jobId });
    if (existing) {
      return res.status(400).json({ message: 'Already saved' });
    }
    
    const savedJob = new SavedJob({
      userId: req.userId,
      jobId,
      jobTitle,
      company,
      location,
      salary
    });
    
    await savedJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get saved jobs
router.get('/', auth, async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ userId: req.userId }).sort({ savedAt: -1 });
    res.json(savedJobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove saved job
router.delete('/:jobId', auth, async (req, res) => {
  try {
    await SavedJob.findOneAndDelete({ userId: req.userId, jobId: req.params.jobId });
    res.json({ message: 'Removed from saved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;