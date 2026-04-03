/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('employees', (table) => {
    table.increments('id').primary();
    table.integer('company_id').unsigned().notNullable().references('id').inTable('companies').onDelete('CASCADE');
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('department_id').unsigned().references('id').inTable('departments').onDelete('SET NULL');
    table.string('employee_code').notNullable();
    table.string('designation');
    table.string('phone');
    table.date('date_of_joining');
    table.decimal('salary', 12, 2).defaultTo(0);
    table.enum('status', ['active', 'inactive', 'terminated']).defaultTo('active');
    table.string('avatar_url');
    table.text('address');
    table.string('emergency_contact');
    table.unique(['company_id', 'employee_code']);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('employees');
};
