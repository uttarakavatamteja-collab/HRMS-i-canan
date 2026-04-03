/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('leaves', (table) => {
    table.increments('id').primary();
    table.integer('company_id').unsigned().notNullable().references('id').inTable('companies').onDelete('CASCADE');
    table.integer('employee_id').unsigned().references('id').inTable('employees').onDelete('CASCADE');
    table.enum('leave_type', ['casual', 'sick', 'annual', 'maternity', 'paternity', 'unpaid']).notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.text('reason');
    table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending');
    table.integer('approved_by').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.text('admin_remarks');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('leaves');
};
