FROM node:22-alpine

RUN apk add --no-cache curl

WORKDIR /ur/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]