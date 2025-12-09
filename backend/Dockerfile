FROM node:22-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
RUN npm install

COPY . .

COPY docker-entrypoint.sh /usr/src/app
RUN chmod +x /usr/src/app/docker-entrypoint.sh
CMD ["./docker-entrypoint.sh"]