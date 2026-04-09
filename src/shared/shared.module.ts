import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from '../config/app';
import { LibsModule } from './libs/libs.module';
import { MongoModule } from './mongo/mongo.module';

@Module({
  imports: [
    MongoModule,
    LibsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        publicKey: configService.get<AppConfig>('app').jwtPublicKey,
        verifyOptions: { algorithms: ['RS256'] },
      }),
    }),
  ],
  exports: [MongoModule, LibsModule, JwtModule],
})
export class SharedModule {}
