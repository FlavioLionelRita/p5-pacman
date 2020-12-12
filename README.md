# Pacman


## Docker
login:
```
docker login -u flaviolrita -p <PASSWORD> registry.gitlab.com 
docker login -u flaviolrita -p brieger0293 registry.gitlab.com 
```

build:
```
docker build -t registry.gitlab.com/flaviolrita/p5-pacman:0.0.1 .
```

run:
```
docker run -ti --rm -p 8000:8000 --env-file .env registry.gitlab.com/flaviolrita/p5-pacman:0.0.1 
```

push:
```
docker push registry.gitlab.com/flaviolrita/p5-pacman:0.0.1
```
## Docker compose
up:
```
docker-compose up -d
```
down:
```
docker-compose down
```
