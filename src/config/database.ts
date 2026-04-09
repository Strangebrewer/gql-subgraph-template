export type DatabaseConfig = {
  uri?: string;
  username: string;
  password: string;
  cluster: string;
  name: string;
  collections: {
    example: string;
  };
};

const databaseConfig: DatabaseConfig = {
  uri: process.env.MONGO_URI || undefined,
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  cluster: process.env.DB_CLUSTER || '',
  name: process.env.DB_NAME || '',
  collections: {
    example: process.env.EXAMPLE_COLLECTION || 'example',
  },
};

export default databaseConfig;
