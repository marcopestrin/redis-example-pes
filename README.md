## Description

Just another simple example to learn Redis

## Requirements

- NodeJs and NPM must be installed
- Docker

## How to run

Run `docker-compose up -d --build` then `docker logs redis-example-pes -f`

## Endpoints

- GET http://localhost:4000/users
- POST http://localhost:4000/users/getToken
- POST http://localhost:4000/users/signup?token=1234567890
