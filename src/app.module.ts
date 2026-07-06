import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';
import { SharedModule } from './shared/shared.module';
import { ExampleModule } from './app/example/example.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.local',
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        level: 'info',
        stream: {
          write(msg: string) {
            const entry = JSON.parse(msg);
            const internal = [
              'InstanceLoader',
              'NestFactory',
              'RouterExplorer',
              'RoutesResolver',
              'NestApplication',
              'GraphQLModule',
              'AppModule',
            ];
            if (internal.includes(entry.context)) return;
            process.stdout.write(msg);
          },
        },
      },
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { federation: 2 },
    }),
    SharedModule,
    ExampleModule,
  ],
})
export class AppModule {}
