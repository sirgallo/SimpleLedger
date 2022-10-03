#!/bin/bash

readonly truthyInput="input should be yes or no"

echo "Init services? (yes or no):"
read startServices

if [ "$startServices" == "yes" ]
then
  echo "starting services for the first time"

  docker-compose -f docker-compose.mongoreplica.yml up --build -d
  docker exec -it ledgerdb_primary_cont /scripts/rs-init.sh
  
  sleep 20
  docker-compose -f docker-compose.ledger.yml up --build --scale ledger=2
elif [ "$startServices" == "no" ]
then
  echo "restarting services..."
  docker-compose -f docker-compose.mongoreplica.yml down
  docker-compose -f docker-compose.ledger.yml down

  sleep 10

  docker-compose -f docker-compose.mongoreplica.yml up -d

  sleep 20
  docker-compose -f docker-compose.ledger.yml up --build --scale ledger=2
else
  echo truthyInput
fi