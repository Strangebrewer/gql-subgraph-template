import { Inject, Injectable } from '@nestjs/common';
import { Collection, Filter, FindOptions, ReturnDocument, UpdateFilter } from 'mongodb';
import { EXAMPLE_COLLECTION } from './example.factory';
import { ExampleEntity, ExampleEntityRead } from './example.entity';

@Injectable()
export class ExampleRepository {
  private readonly primaryKey = 'id';

  constructor(
    @Inject(EXAMPLE_COLLECTION)
    private readonly collection: Collection<ExampleEntityRead>,
  ) {}

  async findOne(filter: Filter<ExampleEntityRead>, options?: FindOptions): Promise<ExampleEntityRead> {
    return this.collection.findOne(filter, options);
  }

  async findById(id: string, options?: FindOptions): Promise<ExampleEntityRead> {
    return this.collection.findOne({ [this.primaryKey]: id } as Filter<ExampleEntityRead>, options);
  }

  async find(filter: Filter<ExampleEntityRead>, options?: FindOptions): Promise<ExampleEntityRead[]> {
    return this.collection.find(filter, options).toArray();
  }

  async create(entity: ExampleEntity): Promise<ExampleEntityRead> {
    const result = await this.collection.insertOne(entity as ExampleEntityRead);
    return { _id: result.insertedId.toString(), ...entity };
  }

  async findOneAndUpdate(id: string, fields: UpdateFilter<ExampleEntity>): Promise<ExampleEntityRead> {
    return this.collection.findOneAndUpdate(
      { [this.primaryKey]: id } as Filter<ExampleEntityRead>,
      { $set: fields },
      { returnDocument: ReturnDocument.AFTER },
    );
  }

  async deleteOne(id: string) {
    return this.collection.deleteOne({ [this.primaryKey]: id } as Filter<ExampleEntityRead>);
  }
}
