FROM node:17

LABEL maintainer="Tim Stewart"

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install pm2@latest -g

COPY ./ ./

CMD [ "pm2-runtime", "npm", "--", "run", "main" ]