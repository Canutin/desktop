/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "bwxajn9enyaq8xo",
    "created": "2024-09-04 14:36:48.243Z",
    "updated": "2024-09-04 14:36:48.243Z",
    "name": "accountBalanceStatements",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "oxksqobm",
        "name": "value",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "ibzrrpm2",
        "name": "account",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "qa5d0040txax605",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id = account.owner.id",
    "viewRule": "@request.auth.id = account.owner.id",
    "createRule": "@request.auth.id = account.owner.id",
    "updateRule": "@request.auth.id = account.owner.id",
    "deleteRule": "@request.auth.id = account.owner.id",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("bwxajn9enyaq8xo");

  return dao.deleteCollection(collection);
})
