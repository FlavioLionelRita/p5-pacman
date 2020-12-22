# Pacman


## Docker
login:
```
docker login -u flaviolrita -p <PASSWORD> registry.gitlab.com 
```

### buildx 
```
docker buildx build --platform "linux/amd64,linux/arm64,linux/arm/v7" -t registry.gitlab.com/flaviolrita/p5-pacman:0.0.4 --push .
```
### only amd64
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
## run from cluster raspberry
```
http://192.168.1.152:30008/
```