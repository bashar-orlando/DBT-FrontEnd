FROM node:18 AS angular

ARG deploy=desa

WORKDIR /app
COPY package.json /app/package.json
COPY . /app

RUN npm install -g bun
RUN bun install
RUN bun install -g @angular/cli
RUN bun run build

FROM nginx:1.17.8-alpine
COPY --from=angular /app/dist/browser/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

