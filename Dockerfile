####################################################################################################
# Stage 1: Install dependencies
####################################################################################################

FROM node:18.13.0-bullseye@sha256:d871edd5b68105ebcbfcde3fe8c79d24cbdbb30430d9bd6251c57c56c7bd7646 AS dependencies

LABEL maintainer="Khushwant Singh Rao <ksrao1@myseneca.ca>"
LABEL description="Fragments UI testing web app"

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn
# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Set the NODE_ENV to production
ENV NODE_ENV=production

# Use /app as our working directory
WORKDIR /app

# Copy our package.json/package-lock.json in
COPY package* .

# Install node dependencies defined in package.json and package-lock.json
RUN npm ci --only=production

####################################################################################################
# Stage 2: Build and serve the app
####################################################################################################

FROM node:18.13.0-bullseye@sha256:d871edd5b68105ebcbfcde3fe8c79d24cbdbb30430d9bd6251c57c56c7bd7646 AS build

# Use /app as our working directory
WORKDIR /app

# Copy generated node_modules from dependencies stage
COPY --from=dependencies /app/ /app/

# Copy everything else into /app
COPY . .

# Run the server
CMD npm run serve

# We default to use port 1234
EXPOSE 1234