/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('companies', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('domain');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('companies');
};
