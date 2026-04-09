# gql-subgraph-template — Claude Context

## What This Is

A GitHub template repository for NestJS Apollo Federation 2 subgraphs in the personal-enterprise project. Each subgraph is a single-domain service backed by MongoDB Atlas.

When creating a new subgraph repo, use GitHub's "Use this template" button. The `example/` domain is scaffolding — follow it to build the real domain, then remove it once the real domain is complete and working.

---

## Stack

- NestJS 10
- Apollo Federation 2 (`@nestjs/graphql`, `@nestjs/apollo`, `@apollo/subgraph`)
- MongoDB 6 (native driver — no Mongoose, no ORM)
- `nestjs-pino` for structured JSON logging
- `@nestjs/jwt` for JWT verification (RS256, public key only)
- `uuid` v4 for ID generation
- `testcontainers` for integration tests

---

## Directory Structure

```
src/
  main.ts               ← bootstrap, env validation, pino logger, global exception filter
  app.module.ts         ← root module: ConfigModule, LoggerModule, GraphQLModule, SharedModule, domain modules
  config/
    app.ts              ← port, JWT public key
    database.ts         ← MongoDB connection vars + collection names
    configuration.ts    ← combines app + database for @nestjs/config
  common/
    filters/
      gql-exception.filter.ts   ← global filter: normalizes all errors to GraphQLError
    guards/
      jwt-access.guard.ts       ← JwtAccessGuard + JwtUserId param decorator
  shared/
    shared.module.ts    ← exports MongoModule, LibsModule, JwtModule
    mongo/
      mongo.module.ts   ← provides DB_CLIENT (mongodb Db instance)
    libs/
      libs.module.ts
      id-generator/
        id-generator.service.ts ← generates prefixed IDs using uuid v4
  app/
    <domain>/           ← one directory per domain (see Domain Structure below)
test/
  <domain>.integration.spec.ts  ← testcontainers integration tests (real MongoDB)
  jest.integration.json
```

---

## Domain Structure

Each domain follows a six-file pattern. Using `example/` as reference:

| File | Purpose |
|---|---|
| `example.entity.ts` | TypeScript types for MongoDB documents (`ExampleEntity`, `ExampleEntityRead`) |
| `example.factory.ts` | Collection injection token + NestJS factory provider |
| `example.model.ts` | GraphQL `@ObjectType` and `@ArgsType` classes |
| `example.module.ts` | Wires domain providers; imports `SharedModule` |
| `example.repository.ts` | MongoDB CRUD operations |
| `example.resolver.ts` | GraphQL queries and mutations |
| `example.service.ts` | Business logic; maps entities to models |

---

## Key Patterns

### MongoDB Connection
`MongoModule` provides a `DB_CLIENT` token (a `mongodb.Db` instance). Domain collection factories inject it to get their specific collection.

For local dev, set `MONGO_URI` in `.env.local` to bypass Atlas URI construction:
```
MONGO_URI=mongodb://localhost:27017
```
In production, leave `MONGO_URI` unset and provide the individual Atlas vars (`DB_USERNAME`, `DB_PASSWORD`, `DB_CLUSTER`, `DB_NAME`).

### JWT Auth
`JwtModule` is registered in `SharedModule` with the RS256 public key from `JWT_PUBLIC_KEY`. Any domain module that imports `SharedModule` can use `@UseGuards(JwtAccessGuard)` on resolvers. The `@JwtUserId()` param decorator extracts the user ID from the verified token.

`JwtAccessGuard` throws `UnauthorizedException` — never returns false.

### ID Generation
`IdGeneratorService.generate(prefix)` returns `${prefix}-${uuidv4()}`. The prefix identifies the document type (e.g. `VHL-`, `RCP-`). Available in any module that imports `SharedModule`.

### GraphQL Schema
`@Field()` decorators are not required on model classes — the `@nestjs/graphql` CLI plugin (configured in `nest-cli.json`) infers them automatically from files matching `.model.ts`.

### Exception Handling
`GqlExceptionFilter` is registered globally in `main.ts`. It normalizes all errors to `GraphQLError` with a numeric `code` extension. `HttpException` subclasses (like `UnauthorizedException`) are mapped using their HTTP status code.

### Logging
`nestjs-pino` writes structured JSON to stdout in production. In non-production environments, `pino-pretty` is used for readable output. Cloud Run ingests stdout automatically into Cloud Logging.

---

## Config

Config is split across two files and combined in `configuration.ts`:

- `config/app.ts` — `port`, `jwtPublicKey`
- `config/database.ts` — connection vars + `collections` object

When adding a new domain, add its collection name to the `collections` object in `database.ts` and add the corresponding env var to `.env.example`.

Access config via `ConfigService`:
```typescript
configService.get<DatabaseConfig>('database').collections.myDomain
configService.get<AppConfig>('app').jwtPublicKey
```

---

## Testing

Integration tests live in `test/` and use `@testcontainers/mongodb` to spin up a real MongoDB instance. They bypass the NestJS module system entirely — wiring up only the providers under test with the real DB injected directly.

Run integration tests:
```bash
pnpm run test:integration
```

Both unit tests (`pnpm test`) and integration tests (`pnpm run test:integration`) run in CI.

---

## Setting Up a New Subgraph from This Template

1. Create the repo using GitHub's "Use this template" button
2. Update `name` in `package.json` to match the new repo name
3. Build the real domain in `src/app/<domain>/` following the six-file pattern from `example/`
4. Add the new domain's collection name to `database.ts` and `.env.example`
5. Import the new domain module in `app.module.ts`
6. Add a corresponding integration test in `test/`
7. Once the real domain is complete and working, remove `src/app/example/`, its entry in `app.module.ts`, and the example collection from `database.ts` and `.env.example`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | HTTP port (default: 4000) |
| `MONGO_URI` | Local dev | Full MongoDB connection string — bypasses Atlas vars |
| `DB_USERNAME` | Production | MongoDB Atlas username |
| `DB_PASSWORD` | Production | MongoDB Atlas password |
| `DB_CLUSTER` | Production | MongoDB Atlas cluster identifier |
| `DB_NAME` | Yes | MongoDB database name |
| `JWT_PUBLIC_KEY` | Yes | RSA public key PEM for verifying JWTs |

Copy `.env.example` to `.env.local` for local dev. Never commit `.env.local`.
