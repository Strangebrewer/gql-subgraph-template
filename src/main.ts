import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GqlExceptionFilter } from './common/filters/gql-exception.filter';
import { AppConfig } from './config/app';

function validateEnv() {
  const required = ['JWT_PUBLIC_KEY', 'DB_NAME'];
  const missing = required.filter((key) => !process.env[key]);

  const hasMongoUri = !!process.env.MONGO_URI;
  const hasAtlasVars =
    !!process.env.DB_USERNAME && !!process.env.DB_PASSWORD && !!process.env.DB_CLUSTER;

  if (!hasMongoUri && !hasAtlasVars) {
    missing.push('MONGO_URI or (DB_USERNAME + DB_PASSWORD + DB_CLUSTER)');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new GqlExceptionFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<AppConfig>('app').port;

  await app.listen(port);
}

bootstrap();
