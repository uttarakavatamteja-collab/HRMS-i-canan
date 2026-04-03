const express = require('express');
const router = express.Router();
const { getAll, apply, updateStatus } = require('../controllers/leave.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getAll);
router.post('/', apply);
router.put('/:id/status', authorize('admin', 'hr'), updateStatus);

module.exports = router;
