FROM node:18

RUN apt-get update
RUN apt-get install -y curl

WORKDIR /usr/src/simpleledger

COPY core ./core
COPY ledger ./ledger
COPY db ./db

COPY moduleAlias.mjs \
    ServerConfigurations.ts \ 
    package.json \
    package-lock.json \
    gruntfile.cjs \
    tsconfig.json ./

RUN npm install
RUN npm run build:all

EXPOSE 1098
CMD ["npm", "run", "start:ledger"]