import app from './app';
import database from './database';

export default () => ({
  app: app(),
  database: database(),
});
