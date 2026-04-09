import { Injectable } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { IdGeneratorService } from '../../shared/libs/id-generator/id-generator.service';
import { ExampleEntity } from './example.entity';
import { CreateExampleArgs, DeleteResult, Example, UpdateExampleArgs } from './example.model';
import { ExampleRepository } from './example.repository';

@Injectable()
export class ExampleService {
  constructor(
    private readonly exampleRepository: ExampleRepository,
    private readonly idGenerator: IdGeneratorService,
  ) {}

  async findById(id: string): Promise<Example> {
    const record = await this.exampleRepository.findById(id);
    if (!record) {
      throw new GraphQLError('Example not found', {
        extensions: { code: 404 },
      });
    }
    return mapToModel(record);
  }

  async find(userId: string): Promise<Example[]> {
    const records = await this.exampleRepository.find({ userId });
    return records.map(mapToModel);
  }

  async create(args: CreateExampleArgs, userId: string): Promise<Example> {
    const entity: ExampleEntity = {
      ...args,
      userId,
      id: this.idGenerator.generate('EXP'),
    };
    const record = await this.exampleRepository.create(entity);
    return mapToModel(record);
  }

  async update(id: string, args: UpdateExampleArgs): Promise<Example> {
    const record = await this.exampleRepository.findOneAndUpdate(id, args);
    if (!record) {
      throw new GraphQLError('Example not found', {
        extensions: { code: 404 },
      });
    }
    return mapToModel(record);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.exampleRepository.deleteOne(id);
  }
}

function mapToModel(entity: ExampleEntity): Example {
  return {
    id: entity.id,
    thing: entity.thing,
    userId: entity.userId,
  };
}
