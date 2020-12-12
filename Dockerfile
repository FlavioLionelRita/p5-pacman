FROM node:12.16.1-alpine
USER root
# Create app directory
WORKDIR /usr/src/app
RUN apk --update add \
  unzip \
  git \
  curl 

# Bundle app source
COPY index.js index.js
COPY ./config ./config
COPY ./public ./public
COPY package*.json ./
RUN npm install
CMD [ "node","index"]