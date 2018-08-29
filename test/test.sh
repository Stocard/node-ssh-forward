#!/bin/bash
set -e

directory=$(pwd)
if [[ $directory == *"/test" ]]; then
  cd ..
fi

docker-compose -f ./test/docker-compose.yml build
docker-compose -f ./test/docker-compose.yml up --force-recreate --abort-on-container-exit

CODE=0
docker-compose --file=./test/docker-compose.yml ps -q | xargs docker inspect -f '{{ .State.ExitCode }}' | while read code; do
    if [ "$code" == "1" ]; then
       CODE=-1
    fi
done
docker-compose -f ./test/docker-compose.yml down
exit $CODE
