#! /bin/bash
rm cookie-jar*

curl -v  -c cookie-jar.txt -H "Content-Type: application/json" -H "Content-length: 22" -d '{"player_name":"DAVI"}' http://localhost:3000/player

curl -b cookie-jar.txt -X GET http://localhost:3000/waitplayer &


curl -c cookie-jar-2.txt  -H "Content-Type: application/json" -H "Content-length: 23" -d '{"player_name":"ALICE"}' http://localhost:3000/player

curl -b cookie-jar.txt -X GET http://localhost:3000/waitplayer

curl -b cookie-jar.txt -X GET http://localhost:3000/player

curl -b cookie-jar-2.txt -X GET http://localhost:3000/player

curl -v -I -b cookie-jar-2.txt -X GET  http://localhost:3000/gamedata

curl -v -I -b cookie-jar.txt -X GET  http://localhost:3000/gamedata
