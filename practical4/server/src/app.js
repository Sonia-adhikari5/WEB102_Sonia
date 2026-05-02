const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

app.get('/', (req, res) => {
  res.send('TikTok API is running');
});

module.exports = app;

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});