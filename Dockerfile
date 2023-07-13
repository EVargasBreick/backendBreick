FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . . 


COPY breickventas_tech.crt /etc/ssl/certs/
COPY breickventas.tech.key /etc/ssl/private/
COPY breickventas_tech.ca-bundle /etc/ssl/certs/


EXPOSE 443
EXPOSE 5432

CMD ["node", "server"]