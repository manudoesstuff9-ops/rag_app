FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy full source
COPY backend/src ./src

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "start"]