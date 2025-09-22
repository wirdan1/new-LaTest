const express = require('express');
const router = express.Router();

// Route untuk halaman utama
router.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'API is running'
  });
});

// API documentation redirect
router.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

module.exports = router;