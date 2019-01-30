FROM node:8

COPY ["package.json", "/usr/src/"]

WORKDIR /usr/src

RUN npm install -g pm2

RUN npm install

COPY [".", "/usr/src"]

EXPOSE 3000

CMD ["pm2-runtime", "start", "./dist/server.js"]
