import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../../config/database';
import { Collection, Db } from 'mongodb';
import { DB_CLIENT } from '../../shared/mongo/mongo.module';
import { ExampleEntity } from './example.entity';

export const EXAMPLE_COLLECTION = 'EXAMPLE_COLLECTION';

export const ExampleCollectionFactory = {
  provide: EXAMPLE_COLLECTION,
  useFactory: (configService: ConfigService, db: Db): Collection<ExampleEntity> => {
    const { collections } = configService.get<DatabaseConfig>('database');
    return db.collection(collections.example);
  },
  inject: [ConfigService, DB_CLIENT],
};
