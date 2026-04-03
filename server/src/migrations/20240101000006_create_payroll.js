/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('payroll', (table) => {
    table.increments('id').primary();
    table.integer('company_id').unsigned().notNullable().references('id').inTable('companies').onDelete('CASCADE');
    table.integer('employee_id').unsigned().references('id').inTable('employees').onDelete('CASCADE');
    table.integer('month').notNullable();
    table.integer('year').notNullable();
    table.decimal('basic_salary', 12, 2).notNullable();
    table.decimal('allowances', 12, 2).defaultTo(0);
    table.decimal('deductions', 12, 2).defaultTo(0);
    table.decimal('net_salary', 12, 2).notNullable();
    table.enum('status', ['pending', 'processed', 'paid']).defaultTo('pending');
    table.date('paid_date');
    table.text('notes');
    table.unique(['employee_id', 'month', 'year']);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('payroll');
};
