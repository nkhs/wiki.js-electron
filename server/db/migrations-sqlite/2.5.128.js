exports.up = async knex => {
  await knex('users').update({
    email: knex.raw('LOWER(email)')
  })
  await knex.schema.alterTable('pages', table => {
    table.boolean('isSynced').defaultTo(false)
  })
  await knex.schema.alterTable('pages', table => {
    table.boolean('isDeleted').defaultTo(false)
  })

  await knex.schema.alterTable('pageTree', table => {
    table.boolean('isSynced').defaultTo(false)
  })
  await knex.schema.alterTable('pageTree', table => {
    table.boolean('isDeleted').defaultTo(false)
  })
}

exports.down = knex => { }
