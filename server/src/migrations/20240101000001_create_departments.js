/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('departments', (table) => {
    table.increments('id').primary();
    table.integer('company_id').unsigned().notNullable().references('id').inTable('companies').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('description');
    table.boolean('is_active').defaultTo(true);
    table.unique(['company_id', 'name']);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('departments');
};
