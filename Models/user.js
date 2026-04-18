const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  userType: { type: String, enum: ['jobseeker', 'company'], default: 'jobseeker' },
  companyName: { type: String, default: '' },
  onboardingAnswers: {
    jobRole: String,
    qualifications: String,
    experience: String,
    expectedSalary: String,
    location: String,
    skills: String
  },
  profileViews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  isVerified: { type: Boolean, default: false }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);