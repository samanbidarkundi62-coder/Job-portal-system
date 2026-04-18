const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// Apply for job
router.post('/', auth, async (req, res) => {
  try {
    const { jobId, resumeUrl } = req.body;
    const job = await Job.findById(jobId);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    const existingApplication = await Application.findOne({ userId: req.userId, jobId });
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied' });
    }
    
    const application = new Application({
      userId: req.userId,
      jobId,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      resumeUrl
    });
    
    await application.save();
    
    job.applicants += 1;
    await job.save();
    
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.userId }).sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw application
router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await application.deleteOne();
    res.json({ message: 'Application withdrawn' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;