# Use official Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all app files
COPY . .

# Expose backend port (change if needed)
EXPOSE 3000

CMD ["node", "server.js"]