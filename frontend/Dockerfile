FROM node:latest

WORKDIR /user/src/app

COPY ./package.json ./

COPY ./package-lock.json ./

RUN npm install react-router-dom
RUN npm install @mui/material @emotion/react @emotion/styled
RUN npm install axios

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]

