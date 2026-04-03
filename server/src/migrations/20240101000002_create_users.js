/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.integer('company_id').unsigned().notNullable().references('id').inTable('companies').onDelete('CASCADE');
    table.string('email').notNullable();
    table.string('password_hash').notNullable();
    table.enum('role', ['admin', 'hr', 'employee']).defaultTo('employee');
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.unique(['company_id', 'email']);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
