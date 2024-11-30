FROM node:20 AS build
# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the required port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]