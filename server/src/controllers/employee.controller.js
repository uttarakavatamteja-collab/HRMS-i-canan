const db = require('../config/db');

// GET /api/employees
const getAll = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const companyId = req.user.company_id;

    let query = db('employees')
      .join('users', 'employees.user_id', 'users.id')
      .leftJoin('departments', 'employees.department_id', 'departments.id')
      .where('employees.company_id', companyId)
      .select(
        'employees.*',
        'users.email',
        'users.first_name',
        'users.last_name',
        'users.role',
        'departments.name as department_name'
      );

    if (search) {
      query = query.where(function () {
        this.where('users.first_name', 'ilike', `%${search}%`)
          .orWhere('users.last_name', 'ilike', `%${search}%`)
          .orWhere('users.email', 'ilike', `%${search}%`)
          .orWhere('employees.employee_code', 'ilike', `%${search}%`);
      });
    }

    if (department) {
      query = query.where('employees.department_id', department);
    }

    if (status) {
      query = query.where('employees.status', status);
    }

    const countQuery = query.clone().clearSelect().count('employees.id as total').first();
    const [employees, countResult] = await Promise.all([
      query.orderBy('employees.created_at', 'desc').limit(limit).offset(offset),
      countQuery,
    ]);

    res.json({
      employees,
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

// GET /api/employees/:id
const getById = async (req, res, next) => {
  try {
    const employee = await db('employees')
      .join('users', 'employees.user_id', 'users.id')
      .leftJoin('departments', 'employees.department_id', 'departments.id')
      .where('employees.id', req.params.id)
      .andWhere('employees.company_id', req.user.company_id)
      .select(
        'employees.*',
        'users.email',
        'users.first_name',
        'users.last_name',
        'users.role',
        'departments.name as department_name'
      )
      .first();

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json({ employee });
  } catch (error) {
    next(error);
  }
};

// POST /api/employees
const create = async (req, res, next) => {
  try {
    const { user_id, department_id, employee_code, designation, phone, date_of_joining, salary, address, emergency_contact } = req.body;

    if (!user_id || !employee_code) {
      return res.status(400).json({ error: 'user_id and employee_code are required.' });
    }

    const existing = await db('employees').where({ employee_code, company_id: req.user.company_id }).first();
    if (existing) {
      return res.status(409).json({ error: 'Employee code already exists.' });
    }

    const [employee] = await db('employees')
      .insert({ company_id: req.user.company_id, user_id, department_id, employee_code, designation, phone, date_of_joining, salary, address, emergency_contact })
      .returning('*');

    res.status(201).json({ employee });
  } catch (error) {
    next(error);
  }
};

// PUT /api/employees/:id
const update = async (req, res, next) => {
  try {
    const { department_id, designation, phone, salary, status, address, emergency_contact } = req.body;

    const [employee] = await db('employees')
      .where({ id: req.params.id, company_id: req.user.company_id })
      .update({ department_id, designation, phone, salary, status, address, emergency_contact, updated_at: db.fn.now() })
      .returning('*');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json({ employee });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/employees/:id
const remove = async (req, res, next) => {
  try {
    const deleted = await db('employees').where({ id: req.params.id, company_id: req.user.company_id }).del();
    if (!deleted) {
      return res.status(404).json({ error: 'Employee not found.' });
    }
    res.json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
