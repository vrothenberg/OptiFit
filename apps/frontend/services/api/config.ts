/**
 * API Configuration
 * 
 * This file contains environment-specific configuration for the API services.
 */

// Environment configurations
const ENV = {
  dev: {
    userServiceUrl: 'http://localhost:3000',
    loggingServiceUrl: 'http://localhost:4002',
    aiServiceUrl: 'http://localhost:4001',
  },
  staging: {
    userServiceUrl: 'https://staging-user-api.optifit.com',
    loggingServiceUrl: 'https://staging-logging-api.optifit.com',
    aiServiceUrl: 'https://staging-ai-api.optifit.com',
  },
  prod: {
    userServiceUrl: 'https://user-api.optifit.com',
    loggingServiceUrl: 'https://logging-api.optifit.com',
    aiServiceUrl: 'https://ai-api.optifit.com',
  }
};

// API request timeout in milliseconds
const API_TIMEOUT = 15000;

// Determine which environment to use
// In a real app, this would be based on environment variables or build configuration
const getEnvVars = () => {
  // For now, we'll always use the dev environment
  return ENV.dev;
};

// Export the configuration
export default {
  ...getEnvVars(),
  timeout: API_TIMEOUT,
  apiVersion: 'v1',
};
