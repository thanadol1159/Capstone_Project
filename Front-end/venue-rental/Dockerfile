# Build Stage
FROM node:20 AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code and build the app
COPY . . 
RUN npm run build

# Final Stage
FROM node:20
WORKDIR /app

# Copy the built app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./public

# Set permissions
RUN chown -R 1000:1000 /app

# Run as non-root user
USER 1000:1000

# Expose port and start the server
EXPOSE 3000
CMD ["node", "server.js"]
