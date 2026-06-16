FROM node:18-alpine

# Install build tools if needed for native modules (optional, but good practice)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 5002

CMD ["npm", "start"]
