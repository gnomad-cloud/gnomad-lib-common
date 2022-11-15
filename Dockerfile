FROM node:18-alpine

COPY package.json .
COPY tsconfig.json .
COPY garden.yaml .
COPY src src
COPY cms cms

RUN npm i
RUN npm run build

CMD [ "node", "./dist/index.js" ]

