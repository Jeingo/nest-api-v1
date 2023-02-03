export default () => ({
  MONGO_URL: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
  DB_NAME: process.env.DB_NAME || 'service',
  PORT: parseInt(process.env.PORT, 10) || 5000
});

export type IConfigType = {
  MONGO_URL: string;
  DB_NAME: string;
  PORT: number;
};
