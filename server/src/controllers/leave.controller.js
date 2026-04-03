const db = require('../config/db');

// GET /api/leaves
const getAll = async (req, res, next) => {
  try {
    const { status, employee_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('leaves')
      .join('employees', 'leaves.employee_id', 'employees.id')
      .join('users', 'employees.user_id', 'users.id')
      .leftJoin('users as approver', 'leaves.approved_by', 'approver.id')
      .where('leaves.company_id', req.companyId)
      .select(
        'leaves.*',
        'employees.employee_code',
        'users.first_name',
        'users.last_name',
        'approver.first_name as approver_first_name',
        'approver.last_name as approver_last_name'
      );

    // Employees can only see their own leaves
    if (req.user.role === 'employee') {
      const emp = await db('employees').where({ user_id: req.user.id, company_id: req.companyId }).first();
      if (emp) {
        query = query.where('leaves.employee_id', emp.id);
      }
    } else if (employee_id) {
      query = query.where('leaves.employee_id', employee_id);
    }

    if (status) {
      query = query.where('leaves.status', status);
    }

    const countQuery = query.clone().clearSelect().count('leaves.id as total').first();
    const [leaves, countResult] = await Promise.all([
      query.orderBy('leaves.created_at', 'desc').limit(limit).offset(offset),
      countQuery,
    ]);

    res.json({
      leaves,
      pagination: {
        total: parseInt(countResult.total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/leaves
const apply = async (req, res, next) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;

    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'leave_type, start_date, and end_date are required.' });
    }

    // If employee role, use their own employee_id
    let empId = employee_id;
    if (req.user.role === 'employee') {
      const emp = await db('employees').where({ user_id: req.user.id, company_id: req.companyId }).first();
      if (!emp) return res.status(404).json({ error: 'Employee profile not found.' });
      empId = emp.id;
    }

    const [leave] = await db('leaves')
      .insert({ company_id: req.companyId, employee_id: empId, leave_type, start_date, end_date, reason })
      .returning('*');

    res.status(201).json({ leave });
  } catch (error) {
    next(error);
  }
};

// PUT /api/leaves/:id/approve
const updateStatus = async (req, res, next) => {
  try {
    const { status, admin_remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected.' });
    }

    const [leave] = await db('leaves')
      .where({ id: req.params.id, company_id: req.companyId })
      .update({ status, approved_by: req.user.id, admin_remarks, updated_at: db.fn.now() })
      .returning('*');

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    res.json({ leave });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, apply, updateStatus };
