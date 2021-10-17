### Build an image
>--tag (docker hub user)/(name image):(version) (path docker file)

`docker build -t adecora/demoapp:1.0 .`

    Successfully built d809d5a0af48
    Successfully tagged adecora/demoapp:1.0

### Run image locally in our system

`docker run d809d5a0af48`

### Why can't acces my container locally, on port 8080?
>-p, --publish a container's port(s) to the host **local:container**
>
>We map our localmachine 5000 port to a port on the docker container 8080

`docker run -p 5000:8080 IMAGE_ID`

### **Volumes**
### Shared  data across multiple containers
#### (a dedicated folder on the host machine)

`docker volumen create shared-stuff`

> Now we get this volume we can mounted somewhere in our container when we run it

`docker run --mount source=shared-stuff,target=/stuff`


### Debugging
> -it (interactive pseudo-TTY) 
>
>We get a terminal where we can explore our container

`docker exec  -it CONTAINER_ID /bin/sh`


### Docker compose
#### Each container **can run just one process** we can use docker compose ro tun multiple docker containers at the same time

> Create a docker-compose.yml

```
version: '3'
services: //Container running
  web:
    // Current working directory where our nodejs Dockerfile is
    build: .
    // Por forwarding configuration
    ports:
      - "8080:8080"
  // New separate container
  db:
    image: "mysql"
    environment:
      MYSQL_ROOT_PASSWORD: password
    // We mount volume in our db container
    volumes:
      - db-data:/foo

// Define to store db data across multiple containers
volumes:
  db-data:
```

`docker-compose up`

---


### General useful docker commands
>List all containers running 

`docker ps`

>Stop container

`docker stop CONTAINER_ID`