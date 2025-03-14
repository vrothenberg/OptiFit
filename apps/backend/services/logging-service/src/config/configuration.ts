export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'logging_service',
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  },
  edamam: {
    appId: process.env.EDAMAM_APP_ID || '',
    appKey: process.env.EDAMAM_APP_KEY || '',
    food: {
      appId: process.env.EDAMAM_FOOD_APP_ID || '',
      appKey: process.env.EDAMAM_FOOD_APP_KEY || '',
    },
    nutrition: {
      appId: process.env.EDAMAM_NUTRITION_APP_ID || '',
      appKey: process.env.EDAMAM_NUTRITION_APP_KEY || '',
    }
  },
});
