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
  await knex.schema.alterTable('pages', table => {
    table.text('localSynced').defaultTo('')
  })

  await knex.schema.alterTable('pageTree', table => {
    table.boolean('isSynced').defaultTo(false)
  })
  await knex.schema.alterTable('pageTree', table => {
    table.boolean('isDeleted').defaultTo(false)
  })
  await knex.schema.alterTable('pageTree', table => {
    table.text('localSynced').defaultTo('')
  })

  await knex.schema.alterTable('assets', table => {
    table.boolean('isSynced').defaultTo(false)
  })
  await knex.schema.alterTable('assets', table => {
    table.boolean('isDeleted').defaultTo(false)
  })
  await knex.schema.alterTable('assets', table => {
    table.text('localSynced').defaultTo('')
  })

  await knex.schema.alterTable('assetFolders', table => {
    table.boolean('isSynced').defaultTo(false)
  })
  await knex.schema.alterTable('assetFolders', table => {
    table.boolean('isDeleted').defaultTo(false)
  })
  await knex.schema.alterTable('assetFolders', table => {
    table.text('localSynced').defaultTo('')
  })

  await knex.schema.alterTable('assetData', table => {
    table.boolean('isSynced').defaultTo(false)
  })
  await knex.schema.alterTable('assetData', table => {
    table.boolean('isDeleted').defaultTo(false)
  })
  await knex.schema.alterTable('assetData', table => {
    table.text('localSynced').defaultTo('')
  })
}

exports.down = knex => { }
