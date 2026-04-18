const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple routes - direct yahi pe
app.get('/', (req, res) => {
  res.json({ 
    message: 'AramSeKaam API is running!',
    status: 'success',
    time: new Date().toISOString()
  });
});

app.get('/api/jobs', (req, res) => {
  res.json({
    success: true,
    jobs: [
      { id: 1, title: 'React Developer', company: 'Google', location: 'Bangalore', salary: '15 LPA' },
      { id: 2, title: 'Python Developer', company: 'Amazon', location: 'Hyderabad', salary: '18 LPA' }
    ]
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  res.json({ 
    success: true, 
    message: 'User registered successfully',
    user: { email }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({ 
    success: true, 
    message: 'Login successful',
    token: 'dummy_token_123',
    user: { email }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});