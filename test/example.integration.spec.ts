import { Test, TestingModule } from '@nestjs/testing';
import { MongoDBContainer, StartedMongoDBContainer } from '@testcontainers/mongodb';
import { Db, MongoClient } from 'mongodb';
import { EXAMPLE_COLLECTION } from '../src/app/example/example.factory';
import { ExampleRepository } from '../src/app/example/example.repository';
import { ExampleService } from '../src/app/example/example.service';
import { IdGeneratorService } from '../src/shared/libs/id-generator/id-generator.service';
describe('Example (integration)', () => {
  let container: StartedMongoDBContainer;
  let client: MongoClient;
  let db: Db;
  let module: TestingModule;
  let service: ExampleService;

  beforeAll(async () => {
    container = await new MongoDBContainer().start();
    client = await MongoClient.connect(container.getConnectionString(), { directConnection: true });
    db = client.db('test');

    module = await Test.createTestingModule({
      providers: [
        { provide: EXAMPLE_COLLECTION, useValue: db.collection('example') },
        ExampleRepository,
        ExampleService,
        IdGeneratorService,
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
  }, 60000);

  afterAll(async () => {
    await module.close();
    await client.close();
    await container.stop();
  });

  afterEach(async () => {
    await db.collection('example').deleteMany({});
  });

  it('creates and retrieves an example', async () => {
    const userId = 'user-1';
    const created = await service.create({ thing: 'test thing' }, userId);

    expect(created.id).toBeDefined();
    expect(created.thing).toBe('test thing');
    expect(created.userId).toBe(userId);

    const found = await service.findById(created.id);
    expect(found).toEqual(created);
  });

  it('finds all examples for a user', async () => {
    await service.create({ thing: 'first' }, 'user-1');
    await service.create({ thing: 'second' }, 'user-1');
    await service.create({ thing: 'other user' }, 'user-2');

    const results = await service.find('user-1');
    expect(results).toHaveLength(2);
  });

  it('updates an example', async () => {
    const created = await service.create({ thing: 'original' }, 'user-1');
    const updated = await service.update(created.id, { thing: 'updated' });
    expect(updated.thing).toBe('updated');
  });

  it('deletes an example', async () => {
    const created = await service.create({ thing: 'to delete' }, 'user-1');
    const result = await service.delete(created.id);
    expect(result.deletedCount).toBe(1);
  });

  it('throws when example not found', async () => {
    await expect(service.findById('nonexistent')).rejects.toThrow('Example not found');
  });
});
