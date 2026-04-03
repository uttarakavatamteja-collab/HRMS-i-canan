const db = require('../config/db');

// GET /api/payroll
const getAll = async (req, res, next) => {
  try {
    const { month, year, status, employee_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('payroll')
      .join('employees', 'payroll.employee_id', 'employees.id')
      .join('users', 'employees.user_id', 'users.id')
      .where('payroll.company_id', req.companyId)
      .select(
        'payroll.*',
        'employees.employee_code',
        'employees.designation',
        'users.first_name',
        'users.last_name'
      );

    if (req.user.role === 'employee') {
      const emp = await db('employees').where({ user_id: req.user.id, company_id: req.companyId }).first();
      if (emp) query = query.where('payroll.employee_id', emp.id);
    } else if (employee_id) {
      query = query.where('payroll.employee_id', employee_id);
    }

    if (month) query = query.where('payroll.month', month);
    if (year) query = query.where('payroll.year', year);
    if (status) query = query.where('payroll.status', status);

    const countQuery = query.clone().clearSelect().count('payroll.id as total').first();
    const [payroll, countResult] = await Promise.all([
      query.orderBy([{ column: 'payroll.year', order: 'desc' }, { column: 'payroll.month', order: 'desc' }]).limit(limit).offset(offset),
      countQuery,
    ]);

    res.json({
      payroll,
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

// POST /api/payroll/generate
const generate = async (req, res, next) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ error: 'month and year are required.' });
    }

    // Get all active employees
    const employees = await db('employees').where({ status: 'active', company_id: req.companyId });

    const payrollRecords = [];
    for (const emp of employees) {
      // Check if already generated
      const existing = await db('payroll').where({ employee_id: emp.id, month, year, company_id: req.companyId }).first();
      if (existing) continue;

      const basicSalary = parseFloat(emp.salary) || 0;
      const allowances = basicSalary * 0.2; // 20% allowances
      const deductions = basicSalary * 0.1; // 10% deductions (tax, insurance)
      const netSalary = basicSalary + allowances - deductions;

      const [record] = await db('payroll')
        .insert({
          company_id: req.companyId,
          employee_id: emp.id,
          month,
          year,
          basic_salary: basicSalary,
          allowances,
          deductions,
          net_salary: netSalary,
          status: 'pending',
        })
        .returning('*');

      payrollRecords.push(record);
    }

    res.status(201).json({
      message: `Payroll generated for ${payrollRecords.length} employees.`,
      payroll: payrollRecords,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/payroll/:id
const updateStatus = async (req, res, next) => {
  try {
    const { status, paid_date, notes } = req.body;

    const updates = { status, notes, updated_at: db.fn.now() };
    if (status === 'paid') {
      updates.paid_date = paid_date || new Date().toISOString().split('T')[0];
    }

    const [record] = await db('payroll')
      .where({ id: req.params.id, company_id: req.companyId })
      .update(updates)
      .returning('*');

    if (!record) {
      return res.status(404).json({ error: 'Payroll record not found.' });
    }

    res.json({ payroll: record });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, generate, updateStatus };
