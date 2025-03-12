# OptiFit Logging Service

This microservice handles food and exercise logging for the OptiFit application. It provides APIs for creating, retrieving, updating, and deleting food and exercise logs.

## Features

- Food logging with nutritional information
- Exercise logging
- Integration with Edamam API for food nutrition data
- JWT authentication
- TimescaleDB for efficient time-series data storage
- Swagger API documentation

## Tech Stack

- NestJS
- TypeORM
- TimescaleDB (PostgreSQL extension)
- Docker
- Swagger

## Prerequisites

- Node.js (v18+)
- Docker and Docker Compose
- Edamam API credentials (for food nutrition data)

## Getting Started

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Edamam API credentials:
   ```
   EDAMAM_APP_ID=your_app_id
   EDAMAM_APP_KEY=your_app_key
   ```

### Running with Docker

1. Start the service with Docker Compose:
   ```bash
   docker-compose up
   ```

2. The service will be available at http://localhost:3001
3. API documentation will be available at http://localhost:3001/docs

### Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start a TimescaleDB instance:
   ```bash
   docker-compose up timescaledb
   ```

3. Start the service:
   ```bash
   npm run start:dev
   ```

## API Endpoints

### Food Logging

- `POST /food/logs` - Create a new food log
- `GET /food/logs` - Get all food logs (with pagination and filtering)
- `GET /food/logs/:id` - Get a specific food log
- `PATCH /food/logs/:id` - Update a food log
- `DELETE /food/logs/:id` - Delete a food log

### Exercise Logging

- `POST /exercise/logs` - Create a new exercise log
- `GET /exercise/logs` - Get all exercise logs (with pagination and filtering)
- `GET /exercise/logs/:id` - Get a specific exercise log
- `PATCH /exercise/logs/:id` - Update an exercise log
- `DELETE /exercise/logs/:id` - Delete an exercise log

## Future Enhancements

- Daily and weekly summary endpoints
- Data export functionality
- Integration with AI service for personalized recommendations
- Sleep logging

## Authentication

This service uses JWT authentication. All endpoints require a valid JWT token except those marked as public.

## License

[License information]
