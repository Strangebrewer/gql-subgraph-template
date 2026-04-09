import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { ExampleCollectionFactory } from './example.factory';
import { ExampleRepository } from './example.repository';
import { ExampleResolver } from './example.resolver';
import { ExampleService } from './example.service';

@Module({
  imports: [SharedModule],
  providers: [
    ExampleCollectionFactory,
    ExampleRepository,
    ExampleResolver,
    ExampleService,
  ],
})
export class ExampleModule {}
