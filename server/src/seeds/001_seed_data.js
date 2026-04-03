const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  // Clean tables in order (respecting foreign keys)
  await knex('payroll').del();
  await knex('leaves').del();
  await knex('attendance').del();
  await knex('employees').del();
  await knex('users').del();
  await knex('departments').del();
  await knex('companies').del();

  // ── Company A: Acme Corp ───────────────────────────
  const [acme] = await knex('companies')
    .insert({ name: 'Acme Corp', domain: 'acme.com' })
    .returning('id');

  // ── Company B: Globex Inc ──────────────────────────
  const [globex] = await knex('companies')
    .insert({ name: 'Globex Inc', domain: 'globex.com' })
    .returning('id');

  // ── Departments (per company) ──────────────────────
  const [acmeEng, acmeHR, acmeFinance] = await knex('departments')
    .insert([
      { company_id: acme.id, name: 'Engineering', description: 'Software Development & IT' },
      { company_id: acme.id, name: 'Human Resources', description: 'People & Culture Management' },
      { company_id: acme.id, name: 'Finance', description: 'Accounting & Financial Planning' },
    ])
    .returning('id');

  const [globexOps, globexMkt] = await knex('departments')
    .insert([
      { company_id: globex.id, name: 'Operations', description: 'Business Operations & Logistics' },
      { company_id: globex.id, name: 'Marketing', description: 'Brand & Growth Strategy' },
    ])
    .returning('id');

  // ── Users ──────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12);
  const empHash = await bcrypt.hash('employee123', 12);

  // Acme users
  const [acmeAdmin, acmeHRUser, acmeEmp1] = await knex('users')
    .insert([
      { company_id: acme.id, email: 'admin@acme.com', password_hash: adminHash, role: 'admin', first_name: 'Alice', last_name: 'Admin' },
      { company_id: acme.id, email: 'hr@acme.com', password_hash: adminHash, role: 'hr', first_name: 'Sarah', last_name: 'Johnson' },
      { company_id: acme.id, email: 'john@acme.com', password_hash: empHash, role: 'employee', first_name: 'John', last_name: 'Doe' },
    ])
    .returning('id');

  // Globex users
  const [globexAdmin, globexEmp1] = await knex('users')
    .insert([
      { company_id: globex.id, email: 'admin@globex.com', password_hash: adminHash, role: 'admin', first_name: 'Bob', last_name: 'Boss' },
      { company_id: globex.id, email: 'jane@globex.com', password_hash: empHash, role: 'employee', first_name: 'Jane', last_name: 'Smith' },
    ])
    .returning('id');

  // ── Employees ──────────────────────────────────────
  // Acme employees
  await knex('employees').insert([
    {
      company_id: acme.id,
      user_id: acmeHRUser.id,
      department_id: acmeHR.id,
      employee_code: 'EMP-001',
      designation: 'HR Manager',
      phone: '+1-555-0101',
      date_of_joining: '2022-01-15',
      salary: 75000,
      status: 'active',
    },
    {
      company_id: acme.id,
      user_id: acmeEmp1.id,
      department_id: acmeEng.id,
      employee_code: 'EMP-002',
      designation: 'Senior Developer',
      phone: '+1-555-0102',
      date_of_joining: '2022-03-01',
      salary: 95000,
      status: 'active',
    },
  ]);

  // Globex employees
  await knex('employees').insert([
    {
      company_id: globex.id,
      user_id: globexEmp1.id,
      department_id: globexOps.id,
      employee_code: 'EMP-001',
      designation: 'Operations Lead',
      phone: '+1-555-0201',
      date_of_joining: '2023-01-20',
      salary: 70000,
      status: 'active',
    },
  ]);
};
