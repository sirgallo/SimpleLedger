#!/bin/bash

readonly truthyInput="input should be yes or no"

echo "Init services? (yes or no):"
read startServices

if [ "$startServices" == "yes" ]
then
  echo "starting services for the first time"

  docker-compose -f docker-compose.mongoreplica.yml up --build -d
  docker exec -it atmdb_primary_cont /scripts/rs-init.sh
  
  sleep 20
  docker-compose -f docker-compose.atm.yml up --build
elif [ "$startServices" == "no" ]
then
  echo "restarting services..."
  docker-compose -f docker-compose.mongoreplica.yml down
  docker-compose -f docker-compose.atm.yml down

  sleep 10

  docker-compose -f docker-compose.mongoreplica.yml up -d

  sleep 20
  docker-compose -f docker-compose.atm.yml up --build
else
  echo truthyInput
fi