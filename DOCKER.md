# HOW TO RUN
First you need Docker installed.
Then run:
```
docker-compose up -d
```

## HOW TO RUN DOCKERFILE

To run, first build the Docker image:
```
docker build -t swoopchat/backend:latest .
```

Then, create a new Docker container:
```
docker create --name sc_backend -p 9500:9500 swoopchat/backend:latest
```

Finally, start/stop the container:
```
docker start sc_backend
```
or
```
docker stop sc_backend
```