We can check images: [Docker hub, node search](https://hub.docker.com/_/node)

> To download an image 

`docker pull node`

> Check our images

`docker images`

> Check running containers

`docker ps`

> Check all the containers. -a, --all all containers by default just shows running ones

`docker ps -a`

or different syntax

`docker container ls -a`

#### Run a container:

> Doesn't do anything it created this container but it instantly exited as you can see here

`docker run node`

For some help to run **flag options**

`docker run --help`

> -it, allows us to plug into the terminal straight away after running it


#### Build an image

> . where Dockerfile is 
>
>--tag, name for our image

`docker build . --tag node-server`

#### Run the container

```
Containers by default are isolated and this port
5000 is not open to the public, we need to opened
```

> -p, 
>
> --name, give a name to our container
>
> -d, container running in the background not holding the terminal, return us the container id

`docker run -p 3000:5000 --name node-server-container -d node-server`

Now we can use the **name** to stop and remove the container

> -t, by default it spends ten seconds to stop a container we can specified time to stop it with the -t tag. 

`docker stop node-server-container -t 0`

`docker rm node-server-container`


### Rebuild image after applyin same changes to our server file
**Same instruction** 

`docker build . --tag node-server`

Original image is preserved without a tag
```
node-server             latest    970935d527e1   40 seconds ago   934MB
<none>                  <none>    292da813be6c   18 minutes ago   934MB
```
To remove an image:

`docker images rm REPOSITORY_NAME / IMAGE_ID`

Short version

``docker rmi REPOSITORY_NAME / IMAGE_ID``


#### To explore a container 

> -it, flag to allow us to open a terminal in there

`docker exec -it CONTAINER_ID / CONTAINER_NAME bash`

**NOW** we have a shell inside the container

We can execute stand-alone commands, eg. check our dependencies

`docker exec CONTAINER_ID / CONTAINER_NAME npm list`


### Multiple containers

If we want to use multiple services, eg. server, database.

We must split it on **diferent containers**

* Create a Dockerfile for our nodejs server

```
FROM node:16

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "start"]
```

* Seach for postgres image on [Docker hub](https://hub.docker.com/_/postgres)

> Execute postgres image
>
> --name, call the container docker-postgres
>
> -e, set environment variables
>
> -p, expose the default postgres port 5432 to the port 4321 on our machine
>
> -d, run container on the background, to free our terminal

`docker run --name docker-postgres -e POSTGRES_PASSWORD=123456 -d -p 4321:5432 postgres`

`docker exec -it  docker-postgres psql`

```
psql: error: connection to server on socket 
"/var/run/postgresql/.s.PGSQL.5432" failed: 
FATAL:  role "root" does not exist
```

> -U, we need to specified the default **postgres** user

`docker exec -it  docker-postgres psql -U postgres`

We can tested to executing

`npm migrate`

now we check if migration execute correctly, *creating our users table*

`docker exec -it  docker-postgres psql -U postgres`

> Inside postgres list tables

`postgres=# \d`


```
              List of relations
 Schema |     Name     |   Type   |  Owner   
--------+--------------+----------+----------
 public | users        | table    | postgres
 public | users_id_seq | sequence | postgres
(2 rows)
```

### Build this app into a container and then have those containers talk to each other unsing **docker-compose**

```
version: '3.9'

sevices:
  server:
    build: .  // To point to our docker file
    ports:
      - '5000:5000'  // expose port local:container
  db:
    image: 'postgres'  // Use local or downloaded postgres image
    ports:
      - '4321_5432'  // expose port local:container
    environment:  // Set all env varibles we want in our container
      POSTGRES_PASSWORD: '123456'
      POSTGRES_USER: 'docker'  // Create user docker in postgres and a db with the same name for the user
```

> -d, detach mode to not block the terminal

`docker-compose up -d`

Create both container and it given the name prefix from the folder where we are executing

```
Creating multiple-container_db_1     ... done
Creating multiple-container_server_1 ... done
```

Let's run a command to migrate the database

`docker exec multiple-container_server_1 npm run migrate`

```
> docker-tut@1.0.0 migrate
> node scripts/migrate.js

Error: connect ECONNREFUSED 127.0.0.1:4321
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1146:16) {
  errno: -111,
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '127.0.0.1',
  port: 4321
}
```

Problem on db.js

```
const knex = require('knex')

module.exports = knex({
  client: 'postgres',
  connection: {
    // Can't be localhost we call as our docker-compose service host: 'db' and docker in the backgound
    it's going to replace this db with te address of that container
    host: 'localhost',
    user: 'docker',
    password: '123456',
    database: 'docker',
    // And also we are gonna use the default postgress port
    port: 4321
  },
})

```

Let's rebuild it

> Stop the container and actually remove them

`docker-compose down`


> --build, it's gonna change if anything have change and them it's gonna build the image, and not use the actual one if there are some differences
 
`docker-compose up --build -d`


`docker exec multiple-container_server_1 npm run migrate`

```
> docker-tut@1.0.0 migrate
> node scripts/migrate.js

Created users table!
```

` docker exec -it multiple-container_db_1 psql -U docker`

```
psql (14.0 (Debian 14.0-1.pgdg110+1))
Type "help" for help.

docker=# \dt  // if we list the tables, there is an users table
        List of relations
 Schema | Name  | Type  | Owner  
--------+-------+-------+--------
 public | users | table | docker

docker=# select * from users;
 id | name 
----+------
(0 rows)
```

`docker exec multiple-container_server_1 npm run seed`

```
> docker-tut@1.0.0 seed
> node scripts/seed.js

Added dummy users!
```

` docker exec -it multiple-container_db_1 psql -U docker`

```
psql (14.0 (Debian 14.0-1.pgdg110+1))
Type "help" for help.

docker=# select * from users;
 id |   name   
----+----------
  1 | John Doe
  2 | Jane Doe
(2 rows)
```

> So now we can fetch data from our db

`curl localhost:5000/users`

```
[{"id":1,"name":"John Doe"},{"id":2,"name":"Jane Doe"}]
```

> We can add data to our db

`curl -X POST -d 'name=Alex' localhost:5000/users`

```
[{"id":3,"name":"Alex"}]
```

> Now Alex is added to the users list 

`curl localhost:5000/users`

```
[{"id":1,"name":"John Doe"},{"id":2,"name":"Jane Doe"},{"id":3,"name":"Alex"}]
```

 We can check it from database

`docker exec -it multiple-container_db_1 psql -U docker`

```
psql (14.0 (Debian 14.0-1.pgdg110+1))
Type "help" for help.

docker=# select * from users;
 id |   name   
----+----------
  1 | John Doe
  2 | Jane Doe
  3 | Alex
(3 rows)
```

### PROBLEM: 
If we run **docker-compose down** we lost data in our db because data is stored inside the container

### SOLUTION:
**Volumes** is a separate directory where docker woll store certain files that you want to have persisted.
We want to create this container with our database but we want the data in it to be persisted and not removed anytime we removed that container or even the image itself.

> We add the volumes in our docker-compose.yml

```
version: '3.9'

services:
  server:
    build: .
    ports:
      - '5000:5000'
  db:
    image: 'postgres'

    // We can remove this ports from here, we don't need to export the or
    // expose this port because because by default docker-compose creates a
    // network that allows these services to talk to each other and we don't
    // need to access the database from outside
    ports:
        - '4321_5432' 

    environment:
      POSTGRES_PASSWORD: '123456'
      POSTGRES_USER: 'docker'
    // Use of volumes in our db 
    volumes:
      - data:/var/lib/postgresql/data

// General definition of our volumes
volumes:
  data:
```

`docker-compose up --build -d`

`docker exec multiple-container_server_1 npm run migrate`

`docker exec multiple-container_server_1 npm run seed`

> To check our db actually didn't store any of the changes we made before

`curl localhost:5000/users`

```
[{"id":1,"name":"John Doe"},{"id":2,"name":"Jane Doe"}]
```

`curl -X POST -d 'name=Alejandro' localhost:5000/users`

`curl -X POST -d 'name=Isaac' localhost:5000/users`

And now even if we remove the containers, the *data will still persist*

`docker-compose down`


**Where it persist?**

`docker volume ls`

```
DRIVER    VOLUME NAME
local     multiple-container_data
```

`docker-compose up --build -d`


> Our users data its still in there

`curl localhost:5000/users`


```
[{"id":1,"name":"John Doe"},{"id":2,"name":"Jane Doe"},{"id":3,"name":"Alejandro"},{"id":4,"name":"Isaac"}
```