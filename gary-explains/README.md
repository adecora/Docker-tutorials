### General useful docker commands
>List of all the different images availabe

`docker images`

> Publicy available images:
> [Docker hub](https://hub.docker.com/search?type=image)

```
When you fire up a container actually whats happening it creates a unique 
container for that moment until you exit and then when you run up a new one 
you spin up a whole brand-new container "old file are still there"
```
> Go into an old one

`docker container ls -a`

`docker start -i OLD_CONTAINER_ID`

> Get ride off old container images

`docker container prune`

> --rm, afer running the container the files associeted with the container are always deleted when the containers exits

`docker run --rm -it ubuntu bash`

> -t, tag name our container
>
> . , every in the current directory

`docker build -t hello-world-gcc .`

> check our images

`docker images`

> run our "hello-world-gcc" image

`docker run -it hello-world-gcc`

*we can ommit **-it** flags in here:*

`docker run hello-world-gcc`

____

`docker build -t simple-node-webserver .`


> -p, local:docker port 80 on our server docker get mapped to port 3000 on our machine


`docker run --rm -p 3000:80 simple-node-webserver`

*We can run a **second one***

`docker run --rm -p 3001:80 simple-node-webserver`

```
Now we have one web server running on port 3000 and another one on port 
3001 and both web servers think they're working on port 80 because that's 
the standard port number ofr a web server
```