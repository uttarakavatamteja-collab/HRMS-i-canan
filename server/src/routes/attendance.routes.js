const express = require('express');
const router = express.Router();
const { getAll, markAttendance, markBulkAttendance } = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getAll);
router.post('/', authorize('admin', 'hr'), markAttendance);
router.post('/bulk', authorize('admin', 'hr'), markBulkAttendance);

module.exports = router;
