FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
# COPY package.json package-lock.json ./
COPY ["package.json", "package-lock.json", "./"]
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application (if you're running in production)
# RUN npm run build

# For development, expose the dev server port
EXPOSE 3000

# Use an entrypoint script to support environment variables
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]