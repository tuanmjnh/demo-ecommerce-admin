# --- Phase 1: Build (Use Node to build code into HTML/CSS/JS) ---
FROM node:22-slim as build-stage

WORKDIR /app

# Copy package to install library first (take advantage of cache)
COPY package.json ./

# Cài đặt (nó sẽ tự sinh lock file mới chuẩn Linux)
RUN npm install

# Copy toàn bộ code (Lúc này .dockerignore sẽ chặn node_modules rác ở ngoài)
COPY . .

# Build
RUN npm run build:docker

# --- Stage 2: Production (Use Nginx to run web) ---
FROM nginx:stable-alpine as production-stage

# Copy folder 'dist' (build result) from stage 1 to Nginx directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy Nginx custom configuration file to
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Open port 80 (Default web port)
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]