FROM node:18.16.0-alpine as base

WORKDIR /app

COPY package.json tsconfig.json tsconfig.dev.json ./
COPY src ./src

RUN npm install && npm run build

FROM node:18.16.0-alpine

WORKDIR /app

COPY --from=base ./app/node_modules ./node_modules
COPY --from=base ./app/dist ./dist
COPY --from=base ./app/package.json ./

EXPOSE 8000
CMD ["npm", "run", "start"]