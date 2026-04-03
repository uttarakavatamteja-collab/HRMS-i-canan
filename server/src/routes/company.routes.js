const express = require('express');
const router = express.Router();
const { register } = require('../controllers/company.controller');

// Public endpoint — no auth required for company signup
router.post('/register', register);

module.exports = router;
