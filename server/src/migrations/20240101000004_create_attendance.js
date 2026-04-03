/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('attendance', (table) => {
    table.increments('id').primary();
    table.integer('company_id').unsigned().notNullable().references('id').inTable('companies').onDelete('CASCADE');
    table.integer('employee_id').unsigned().references('id').inTable('employees').onDelete('CASCADE');
    table.date('date').notNullable();
    table.time('check_in');
    table.time('check_out');
    table.enum('status', ['present', 'absent', 'half-day', 'late', 'on-leave']).defaultTo('present');
    table.text('notes');
    table.unique(['employee_id', 'date']);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('attendance');
};
