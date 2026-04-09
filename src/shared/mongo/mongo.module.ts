import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../../config/database';
import { Db, MongoClient } from 'mongodb';

export const DB_CLIENT = 'DB_CLIENT';

@Module({
  providers: [
    {
      provide: DB_CLIENT,
      useFactory: async (configService: ConfigService): Promise<Db> => {
        const { uri, username, password, cluster, name } = configService.get<DatabaseConfig>('database');
        const connectionUri = uri ?? `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${name}?retryWrites=true`;
        const client = await MongoClient.connect(connectionUri);
        return client.db(name);
      },
      inject: [ConfigService],
    },
  ],
  exports: [DB_CLIENT],
})
export class MongoModule {}
