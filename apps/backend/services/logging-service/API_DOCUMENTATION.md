# Logging Service API Documentation

This document provides comprehensive documentation for the OptiFit Logging Service API, which handles food and exercise logging functionality.

## Authentication

The API uses JWT (JSON Web Token) for authentication. Most endpoints require a valid JWT token in the Authorization header. The token is obtained from the User Service.

### Headers for Protected Endpoints

```
Authorization: Bearer <access_token>
```

## Endpoints

### Food Logging

#### Create Food Log

Creates a new food log entry.

- **URL**: `/food/logs`
- **Method**: `POST`
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "foodName": "string",
    "amount": "number",
    "unit": "string",
    "calories": "number",
    "protein": "number",
    "carbs": "number",
    "fat": "number",
    "time": "ISO8601 datetime",
    "geolocation": "string (optional)",
    "imageUrl": "string (optional)"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": "string (UUID)",
    "userId": "string",
    "foodName": "string",
    "amount": "number",
    "unit": "string",
    "calories": "number",
    "protein": "number",
    "carbs": "number",
    "fat": "number",
    "time": "ISO8601 datetime",
    "geolocation": "string or null",
    "imageUrl": "string or null",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```

#### Get All Food Logs

Returns a list of food logs for the authenticated user with optional filtering.

- **URL**: `/food/logs`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `startDate`: ISO8601 datetime (optional) - Filter logs from this date
  - `endDate`: ISO8601 datetime (optional) - Filter logs until this date
  - `limit`: number (optional, default: 10) - Limit the number of results
  - `offset`: number (optional, default: 0) - Offset for pagination
- **Success Response**: `200 OK`
  ```json
  {
    "total": "number",
    "data": [
      {
        "id": "string (UUID)",
        "userId": "string",
        "foodName": "string",
        "amount": "number",
        "unit": "string",
        "calories": "number",
        "protein": "number",
        "carbs": "number",
        "fat": "number",
        "time": "ISO8601 datetime",
        "geolocation": "string or null",
        "imageUrl": "string or null",
        "createdAt": "ISO8601 datetime",
        "updatedAt": "ISO8601 datetime"
      }
    ]
  }
  ```

#### Get Food Log by ID

Returns a specific food log by ID.

- **URL**: `/food/logs/:id`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` (UUID)
- **Success Response**: `200 OK`
  ```json
  {
    "id": "string (UUID)",
    "userId": "string",
    "foodName": "string",
    "amount": "number",
    "unit": "string",
    "calories": "number",
    "protein": "number",
    "carbs": "number",
    "fat": "number",
    "time": "ISO8601 datetime",
    "geolocation": "string or null",
    "imageUrl": "string or null",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```
- **Error Response**: `404 Not Found`

#### Update Food Log

Updates a food log entry. There are two ways to update a food log:

1. **Without changing the time field** (more efficient)
2. **With changing the time field** (requires deleting and recreating the record)

- **URL**: `/food/logs/:id`
- **Method**: `PATCH`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` (UUID)
- **Request Body** (without time field):
  ```json
  {
    "foodName": "string (optional)",
    "amount": "number (optional)",
    "unit": "string (optional)",
    "calories": "number (optional)",
    "protein": "number (optional)",
    "carbs": "number (optional)",
    "fat": "number (optional)",
    "geolocation": "string (optional)",
    "imageUrl": "string (optional)"
  }
  ```
- **Request Body** (with time field):
  ```json
  {
    "foodName": "string (optional)",
    "amount": "number (optional)",
    "unit": "string (optional)",
    "calories": "number (optional)",
    "protein": "number (optional)",
    "carbs": "number (optional)",
    "fat": "number (optional)",
    "time": "ISO8601 datetime",
    "geolocation": "string (optional)",
    "imageUrl": "string (optional)"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": "string (UUID)",
    "userId": "string",
    "foodName": "string",
    "amount": "number",
    "unit": "string",
    "calories": "number",
    "protein": "number",
    "carbs": "number",
    "fat": "number",
    "time": "ISO8601 datetime",
    "geolocation": "string or null",
    "imageUrl": "string or null",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```
- **Error Response**: `404 Not Found`

#### Delete Food Log

Deletes a food log entry.

- **URL**: `/food/logs/:id`
- **Method**: `DELETE`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` (UUID)
- **Success Response**: `204 No Content`
- **Error Response**: `404 Not Found`

### Exercise Logging

#### Create Exercise Log

Creates a new exercise log entry.

- **URL**: `/exercise/logs`
- **Method**: `POST`
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "name": "string",
    "type": "string",
    "duration": "number",
    "intensity": "string",
    "calories": "number",
    "time": "ISO8601 datetime",
    "geolocation": "string (optional)"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": "string (UUID)",
    "userId": "string",
    "name": "string",
    "type": "string",
    "duration": "number",
    "intensity": "string",
    "calories": "number",
    "time": "ISO8601 datetime",
    "geolocation": "string or null",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```

#### Get All Exercise Logs

Returns a list of exercise logs for the authenticated user with optional filtering.

- **URL**: `/exercise/logs`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `startDate`: ISO8601 datetime (optional) - Filter logs from this date
  - `endDate`: ISO8601 datetime (optional) - Filter logs until this date
  - `limit`: number (optional, default: 10) - Limit the number of results
  - `offset`: number (optional, default: 0) - Offset for pagination
- **Success Response**: `200 OK`
  ```json
  {
    "total": "number",
    "data": [
      {
        "id": "string (UUID)",
        "userId": "string",
        "name": "string",
        "type": "string",
        "duration": "number",
        "intensity": "string",
        "calories": "number",
        "time": "ISO8601 datetime",
        "geolocation": "string or null",
        "createdAt": "ISO8601 datetime",
        "updatedAt": "ISO8601 datetime"
      }
    ]
  }
  ```

#### Get Exercise Log by ID

Returns a specific exercise log by ID.

- **URL**: `/exercise/logs/:id`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` (UUID)
- **Success Response**: `200 OK`
  ```json
  {
    "id": "string (UUID)",
    "userId": "string",
    "name": "string",
    "type": "string",
    "duration": "number",
    "intensity": "string",
    "calories": "number",
    "time": "ISO8601 datetime",
    "geolocation": "string or null",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```
- **Error Response**: `404 Not Found`

#### Update Exercise Log

Updates an exercise log entry. There are two ways to update an exercise log:

1. **Without changing the time field** (more efficient)
2. **With changing the time field** (requires deleting and recreating the record)

- **URL**: `/exercise/logs/:id`
- **Method**: `PATCH`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` (UUID)
- **Request Body** (without time field):
  ```json
  {
    "name": "string (optional)",
    "type": "string (optional)",
    "duration": "number (optional)",
    "intensity": "string (optional)",
    "calories": "number (optional)",
    "geolocation": "string (optional)"
  }
  ```
- **Request Body** (with time field):
  ```json
  {
    "name": "string (optional)",
    "type": "string (optional)",
    "duration": "number (optional)",
    "intensity": "string (optional)",
    "calories": "number (optional)",
    "time": "ISO8601 datetime",
    "geolocation": "string (optional)"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": "string (UUID)",
    "userId": "string",
    "name": "string",
    "type": "string",
    "duration": "number",
    "intensity": "string",
    "calories": "number",
    "time": "ISO8601 datetime",
    "geolocation": "string or null",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```
- **Error Response**: `404 Not Found`

#### Delete Exercise Log

Deletes an exercise log entry.

- **URL**: `/exercise/logs/:id`
- **Method**: `DELETE`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` (UUID)
- **Success Response**: `204 No Content`
- **Error Response**: `404 Not Found`

## Error Handling

The API returns standard HTTP status codes to indicate the success or failure of a request.

### Common Error Codes

- `400 Bad Request`: The request was malformed or contained invalid parameters
- `401 Unauthorized`: Authentication is required or the provided credentials are invalid
- `403 Forbidden`: The authenticated user doesn't have permission to access the requested resource
- `404 Not Found`: The requested resource doesn't exist
- `500 Internal Server Error`: An unexpected error occurred on the server

### Error Response Format

```json
{
  "statusCode": "number",
  "message": "string",
  "error": "string"
}
```

## Integration Examples

### Frontend Integration

Here are examples of how to integrate with the API from a frontend application:

#### Create a Food Log

```javascript
async function createFoodLog(foodLogData) {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('/food/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(foodLogData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create food log');
  }
  
  return await response.json();
}
```

#### Get Food Logs for a Date Range

```javascript
async function getFoodLogs(startDate, endDate, limit = 10, offset = 0) {
  const accessToken = localStorage.getItem('accessToken');
  
  const url = new URL('/food/logs', window.location.origin);
  if (startDate) url.searchParams.append('startDate', startDate.toISOString());
  if (endDate) url.searchParams.append('endDate', endDate.toISOString());
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('offset', offset.toString());
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch food logs');
  }
  
  return await response.json();
}
```

#### Update a Food Log Without Changing Time

```javascript
async function updateFoodLog(id, updateData) {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch(`/food/logs/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updateData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update food log');
  }
  
  return await response.json();
}
```

#### Update a Food Log With Time Change

```javascript
async function updateFoodLogWithTime(id, updateData) {
  // Note: This operation is more expensive as it requires deleting and recreating the record
  // Only include the time field when it actually needs to be changed
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch(`/food/logs/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      ...updateData,
      time: updateData.time.toISOString(),
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update food log with new time');
  }
  
  return await response.json();
}
```

## Data Models

### FoodLog

```typescript
interface FoodLog {
  id: string; // UUID
  userId: string;
  foodName: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: Date; // Part of the primary key for TimescaleDB
  geolocation?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ExerciseLog

```typescript
interface ExerciseLog {
  id: string; // UUID
  userId: string;
  name: string;
  type: string;
  duration: number;
  intensity: string;
  calories: number;
  time: Date; // Part of the primary key for TimescaleDB
  geolocation?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## TimescaleDB Considerations

This API uses TimescaleDB for efficient time-series data storage. Some important considerations:

1. The `time` field is part of the primary key for both `FoodLog` and `ExerciseLog` entities.
2. Updating the `time` field requires special handling (delete and recreate) because it's part of the primary key.
3. When querying logs, using time ranges (startDate and endDate) is more efficient due to TimescaleDB's partitioning.

For more details on the TimescaleDB implementation, see the [TimescaleDB Entity Design](./docs/TIMESCALEDB_ENTITY_DESIGN.md) documentation.

## Edamam API Integration

The logging service integrates with the Edamam API for food nutrition data. This integration is handled internally by the service and doesn't require any special considerations from API consumers.

## Rate Limiting

The API implements rate limiting to prevent abuse. Clients are limited to 100 requests per minute per IP address. When the rate limit is exceeded, the API will return a `429 Too Many Requests` response.
