const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, company_id: user.company_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingUser = await db('users').where({ email, company_id: req.user.company_id }).first();
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered in this company.' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const [user] = await db('users')
      .insert({ company_id: req.user.company_id, email, password_hash, first_name, last_name, role: role || 'employee' })
      .returning(['id', 'company_id', 'email', 'role', 'first_name', 'last_name', 'created_at']);

    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password, domain } = req.body;

    if (!email || !password || !domain) {
      return res.status(400).json({ error: 'Email, password, and company domain are required.' });
    }

    const company = await db('companies').where({ domain }).first();
    if (!company) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    const user = await db('users').where({ email, company_id: company.id }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        company_id: user.company_id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'email', 'role', 'first_name', 'last_name', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // If the user is an employee, also fetch employee details
    const employee = await db('employees')
      .where({ user_id: user.id, company_id: req.companyId })
      .first();

    // Fetch company info
    const company = await db('companies')
      .where({ id: req.user.company_id })
      .select('id', 'name', 'domain', 'created_at')
      .first();

    res.json({ user, employee: employee || null, company: company || null });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
