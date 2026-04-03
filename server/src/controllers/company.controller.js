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

// POST /api/companies/register
const register = async (req, res, next) => {
  try {
    const { company_name, domain, admin_email, admin_password, admin_first_name, admin_last_name } = req.body;

    // Validate required fields
    if (!company_name || !admin_email || !admin_password || !admin_first_name || !admin_last_name) {
      return res.status(400).json({
        error: 'company_name, admin_email, admin_password, admin_first_name, and admin_last_name are required.',
      });
    }

    // Check if admin email already exists
    const existingUser = await db('users').where({ email: admin_email }).first();
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Check if company name already exists
    const existingCompany = await db('companies').where({ name: company_name }).first();
    if (existingCompany) {
      return res.status(409).json({ error: 'Company name already taken.' });
    }

    // Use a transaction to ensure atomicity
    const result = await db.transaction(async (trx) => {
      // 1. Create the company
      const [company] = await trx('companies')
        .insert({ name: company_name, domain: domain || null })
        .returning('*');

      // 2. Create the admin user linked to the company
      const password_hash = await bcrypt.hash(admin_password, 12);
      const [user] = await trx('users')
        .insert({
          company_id: company.id,
          email: admin_email,
          password_hash,
          role: 'admin',
          first_name: admin_first_name,
          last_name: admin_last_name,
        })
        .returning(['id', 'company_id', 'email', 'role', 'first_name', 'last_name', 'created_at']);

      return { company, user };
    });

    // Generate JWT for immediate login
    const token = generateToken(result.user);

    res.status(201).json({
      message: 'Company registered successfully.',
      company: {
        id: result.company.id,
        name: result.company.name,
        domain: result.company.domain,
      },
      user: result.user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register };
