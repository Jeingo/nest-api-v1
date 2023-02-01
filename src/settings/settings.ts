export const settings = {
  MONGO_URL: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
  DB_NAME: process.env.DB_NAME || 'service',
  PORT: process.env.PORT || 5000
};
