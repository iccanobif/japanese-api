#!/bin/sh
set -e

# TODO: make this script fail if one of the commands fails, and print an error message

MONGODB_URI=mongodb://mongo:27017/japaneseapi

echo "Using MongoDB at ${MONGODB_URI}..."
# Run DB initialization scripts if database is not initialized
echo "Running DB initialization scripts..."
echo "Parsing Daijirin..."
node build/src/daijirin/daijirin-parse.js
echo "Building database..."
node build/src/build-db.js ${MONGODB_URI}

# TODO: delete intermediate files after building the database
  
# Start the compiled app
echo "Starting app..."
exec node build/src/index.js
