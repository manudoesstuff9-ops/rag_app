FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3

COPY backend/package*.json ./

RUN npm install

COPY backend/src ./src

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]