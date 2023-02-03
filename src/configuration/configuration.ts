export default () => ({
  MONGO_URL: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
  DB_NAME: process.env.DB_NAME || 'service',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  BASIC_AUTH_LOGIN: process.env.BASIC_AUTH_LOGIN,
  BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD
});

export type IConfigType = {
  MONGO_URL: string;
  DB_NAME: string;
  PORT: number;
  BASIC_AUTH_LOGIN: string;
  BASIC_AUTH_PASSWORD: string;
};
