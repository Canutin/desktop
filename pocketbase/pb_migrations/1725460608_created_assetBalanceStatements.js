/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "bibcsj4ts9rlc1q",
    "created": "2024-09-04 14:36:48.243Z",
    "updated": "2024-09-04 14:36:48.243Z",
    "name": "assetBalanceStatements",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "g2imkfwg",
        "name": "value",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "2o3bhddf",
        "name": "quantity",
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
        "id": "1vujcjuq",
        "name": "cost",
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
        "id": "nhbwkzhk",
        "name": "asset",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "2qcdy4e6rcmy303",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id = asset.owner.id",
    "viewRule": "@request.auth.id = asset.owner.id",
    "createRule": "@request.auth.id = asset.owner.id",
    "updateRule": "@request.auth.id = asset.owner.id",
    "deleteRule": "@request.auth.id = asset.owner.id",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("bibcsj4ts9rlc1q");

  return dao.deleteCollection(collection);
})
