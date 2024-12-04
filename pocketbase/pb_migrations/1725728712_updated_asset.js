/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2qcdy4e6rcmy303")

  collection.name = "assets"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2qcdy4e6rcmy303")

  collection.name = "asset"

  return dao.saveCollection(collection)
})
