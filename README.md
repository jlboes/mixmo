
**abandoned**



## The Game
Components of the game:
- 120 tiles carved with letters and a Gangster
- 1 rulebook
- 1 storing bag

It's a quick letters game.
The letter tiles are all in the middle of the table face down.
Each player receives 6 letters.
At the signal, all players turn their tiles and try to make crosswords with them.
When a player has used all his letters he says Mixmo
Each player picks two more letters and the game goes on until the all face-down letters are used.

## Install

As normal meteor app


### Importer un dictionnaire

```
mongoimport -h localhost:3001 --db meteor --collection dictionary --type json --file private/mots_fr_utf8.json
```



## Install with doker
### Mongo Docker Compose

```
mixmodb:
  image: mongo
  ports:
    - "3001:27017"
  volumes:
    - /data/mongo:/data/db
  command: --smallfiles
```

### Meteor image

Create your image with a docker file like

```
FROM node:latest

VOLUME /app
WORKDIR /app
EXPOSE 3000
EXPOSE 5050

RUN \
    apt-get update && apt-get install --no-install-recommends -y \
      screen \
    && npm install -g phantomjs \
    && curl -SL https://install.meteor.com/ | sh \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
```

Run image

```
docker run --rm -ti -e "MONGO_URL=mongodb://172.17.42.1:3001/meteor" -e "VELOCITY=1" -e "JASMINE_MIRROR_PORT=5050" -e "JASMINE_BROWSER=PhantomJS" -p 3000:3000 -p 5050:5050 -v  <path to app>:/app meteor:latest /bin/bash
```

