# Stage 1: Build
FROM node:16-slim AS builder

WORKDIR /user/src/app

ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_DEFAULT_REGION

ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ENV AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION

# Copy package.json and package-lock.json
COPY frontend/package.json ./
COPY frontend/package-lock.json ./

# Install all dependencies listed in package.json
RUN npm install

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the rest of the code
COPY ./frontend .

# Build the project
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy build artifacts from the builder stage
COPY --from=builder /user/src/app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx and serve the static files
CMD ["nginx", "-g", "daemon off;"]