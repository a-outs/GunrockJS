FROM node:17

LABEL maintainer="Tim Stewart"

COPY ./ /app

WORKDIR /app

RUN ls

RUN npm install

RUN npm install pm2@latest -g

CMD [ "pm2-runtime", "npm", "--", "run", "main" ]