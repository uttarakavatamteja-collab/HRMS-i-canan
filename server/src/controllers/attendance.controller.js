const db = require('../config/db');

// GET /api/attendance
const getAll = async (req, res, next) => {
  try {
    const { date, employee_id, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('attendance')
      .join('employees', 'attendance.employee_id', 'employees.id')
      .join('users', 'employees.user_id', 'users.id')
      .where('attendance.company_id', req.companyId)
      .select(
        'attendance.*',
        'employees.employee_code',
        'users.first_name',
        'users.last_name'
      );

    if (date) {
      query = query.where('attendance.date', date);
    }

    if (employee_id) {
      query = query.where('attendance.employee_id', employee_id);
    }

    if (status) {
      query = query.where('attendance.status', status);
    }

    // If user is an employee, only show their own attendance
    if (req.user.role === 'employee') {
      const emp = await db('employees').where({ user_id: req.user.id, company_id: req.companyId }).first();
      if (emp) {
        query = query.where('attendance.employee_id', emp.id);
      }
    }

    const countQuery = query.clone().clearSelect().count('attendance.id as total').first();
    const [records, countResult] = await Promise.all([
      query.orderBy('attendance.date', 'desc').limit(limit).offset(offset),
      countQuery,
    ]);

    res.json({
      attendance: records,
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

// POST /api/attendance
const markAttendance = async (req, res, next) => {
  try {
    const { employee_id, date, check_in, check_out, status, notes } = req.body;

    if (!employee_id || !date) {
      return res.status(400).json({ error: 'employee_id and date are required.' });
    }

    // Check if attendance already marked
    const existing = await db('attendance').where({ employee_id, date, company_id: req.companyId }).first();
    if (existing) {
      // Update existing record
      const [record] = await db('attendance')
        .where({ id: existing.id })
        .update({ check_in, check_out, status, notes, updated_at: db.fn.now() })
        .returning('*');
      return res.json({ attendance: record, updated: true });
    }

    const [record] = await db('attendance')
      .insert({ company_id: req.companyId, employee_id, date, check_in, check_out, status: status || 'present', notes })
      .returning('*');

    res.status(201).json({ attendance: record });
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance/bulk
const markBulkAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'date and records array are required.' });
    }

    const results = [];
    for (const record of records) {
      const existing = await db('attendance').where({ employee_id: record.employee_id, date, company_id: req.companyId }).first();
      if (existing) {
        const [updated] = await db('attendance')
          .where({ id: existing.id })
          .update({ status: record.status, check_in: record.check_in, check_out: record.check_out, updated_at: db.fn.now() })
          .returning('*');
        results.push(updated);
      } else {
        const [created] = await db('attendance')
          .insert({ company_id: req.companyId, employee_id: record.employee_id, date, status: record.status, check_in: record.check_in, check_out: record.check_out })
          .returning('*');
        results.push(created);
      }
    }

    res.json({ attendance: results, count: results.length });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, markAttendance, markBulkAttendance };
