# Node image with alpine to build the app
FROM node:20.10.0-alpine as build

# Create app directory
RUN mkdir -p /web

# Set the working directory 
WORKDIR /web

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source code
COPY . .

# Run build
RUN npm run build

# Nginx image with alpine to serve the app
FROM nginx:1.19.6-alpine as serve

# Copy the build output to replace the default nginx contents.
COPY --from=build /web/build /usr/share/nginx/html

# Copy the Nginx configuration file
COPY /docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]


