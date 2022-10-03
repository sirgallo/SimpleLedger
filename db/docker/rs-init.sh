#!/bin/bash

sleep 10
mongosh <<EOF
var config = {
    "_id": "dev_replication_set",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "atmdbprimary:27017",
            "priority": 3
        },
        {
            "_id": 2,
            "host": "atmdbreplica1:27017",
            "priority": 1
        },
        {
            "_id": 3,
            "host": "atmdbreplica2:27017",
            "priority": 1
        }
    ]
};
rs.initiate(config, { force: true });
rs.status();
EOF

sleep 15
mongosh <<EOF
use atmModels

db.createUser({
  user: 'devModelsUser',
  pwd: 'devModelsTestPass',
  roles: [
    {
      role: 'readWrite',
      db: 'devModels'
    }
  ],
});


db.createCollection('ledger', { capped: false });
db.createCollection('system', { capped: false });
db.createCollection('token', { capped: false });
db.createCollection('user', { capped: false });
EOF