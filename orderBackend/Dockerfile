FROM node:20.18.0

WORKDIR /app/orderBack

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3333

CMD ["npm", "start"]