FROM node:carbon

WORKDIR /usr/src/app

# Do the install bits first cause it takes forever
COPY server/package*.json ./server/
RUN npm install --prefix server

# Now copy everything else
COPY . .

# Run node
EXPOSE 3000
CMD [ "npm", "start", "--prefix", "server" ]

