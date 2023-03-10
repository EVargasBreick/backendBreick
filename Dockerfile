FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . . 
COPY breickventas_lat.crt /etc/ssl/certs/
COPY breickkey.key /etc/ssl/private/
COPY breickventas_lat.ca-bundle /etc/ssl/certs/

EXPOSE 443

CMD ["node", "server"]