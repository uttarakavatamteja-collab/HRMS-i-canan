const express = require('express');
const router = express.Router();
const { getAll, generate, updateStatus } = require('../controllers/payroll.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getAll);
router.post('/generate', authorize('admin', 'hr'), generate);
router.put('/:id', authorize('admin', 'hr'), updateStatus);

module.exports = router;
