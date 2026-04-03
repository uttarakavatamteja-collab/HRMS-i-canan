const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/employee.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authorize('admin', 'hr'), create);
router.put('/:id', authorize('admin', 'hr'), update);
router.delete('/:id', authorize('admin'), remove);

module.exports = router;
