# Replicated log

## Prerequirements

-   You need to have docker installed in your PC. Link to installation: https://docs.docker.com/engine/install/ (just in case😁)

## How to launch application

1. From project root (where `Dockerfile` is being located) run command `docker build . -t replicated-log:latest`
2. After image is built, run command `docker-compose up`

That must be it 🤔🤘🏻

## Available endpoints

-   `POST` - `http://localhost:4000/messages` : This endpoint saves the messages provided in the request body and replicates them to secondary nodes. It is accessible only from the master node

Below is preferable data structure of request body

```
{
  id: string | number,
  content: string
}
```

-   `GET` - `http://localhost:4001/messages`: This endpoint retrieves all messages saved via the POST endpoint. It can be accessed from secondary nodes as well.
