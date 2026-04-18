const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  type: { type: String, enum: ['Full Time', 'Part Time', 'Remote', 'Internship'], required: true },
  skills: [{ type: String }],
  exp: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  logo: { type: String, default: '💼' },
  applicants: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  posted: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Job', jobSchema);