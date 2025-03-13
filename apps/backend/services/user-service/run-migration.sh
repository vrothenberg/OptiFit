#!/bin/bash

# Run the migration
echo "Running migration to merge UserProfile into User..."
npm run migration:run

echo "Migration completed successfully!"
echo "You may need to restart your NestJS server for the changes to take effect."
