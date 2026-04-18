const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// Get all jobs (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, location, type, search, sortBy } = req.query;
    let query = { isActive: true };
    
    if (category && category !== 'all') query.category = category;
    if (location && location !== 'all') query.location = location;
    if (type && type !== 'all') query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    let jobs = await Job.find(query);
    
    // Sorting
    if (sortBy === 'salary-high') {
      jobs.sort((a, b) => parseInt(b.salary) - parseInt(a.salary));
    } else if (sortBy === 'salary-low') {
      jobs.sort((a, b) => parseInt(a.salary) - parseInt(b.salary));
    } else if (sortBy === 'newest') {
      jobs.sort((a, b) => b.posted - a.posted);
    }
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    job.views += 1;
    await job.save();
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Post job (company only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.userType !== 'company') {
      return res.status(403).json({ message: 'Only companies can post jobs' });
    }
    
    const job = new Job({ ...req.body, companyId: req.userId });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.companyId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.companyId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Job.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;