# Stage 1: Build
FROM node:20 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Production
FROM node:20

# Set the working directory
WORKDIR /app

# Copy the built application from the build stage
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./public

# Expose the required port
EXPOSE 3000

# Start the standalone Next.js server
CMD ["node", "server.js"]
