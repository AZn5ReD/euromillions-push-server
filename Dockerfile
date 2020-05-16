FROM node:14-alpine

WORKDIR /usr/src/app
RUN mkdir data
COPY . .
RUN npm install

CMD [ "npm", "start" ]
EXPOSE 5000