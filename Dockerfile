FROM alpine:3.8 AS base

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN apk add --no-cache nodejs nodejs-npm tini

WORKDIR /usr/src/app

ENTRYPOINT ["/sbin/tini", "--"]

COPY package*.json ./

FROM base AS dependencies

RUN npm set progress=false && npm config set depth 0

RUN npm install

RUN cp -R node_modules prod_node_modules

RUN npm install

FROM base AS release

COPY --from=dependencies /usr/src/app/prod_node_modules ./node_modules

COPY . .

CMD npm start