FROM node:20.18.0

WORKDIR /app/productBack

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4444

CMD ["npm", "start"]