# gql-subgraph-template

A GitHub template repository for NestJS Apollo Federation 2 subgraphs. Part of the [personal-enterprise](https://github.com/Strangebrewer/personal-enterprise) project.

Each subgraph in this system is a single-domain service — vehicles, recipes, home maintenance, etc. — that exposes a GraphQL schema and participates in a federated supergraph via Apollo Router. This template provides the foundation every subgraph shares: MongoDB connection, JWT auth, structured logging, error handling, and an integration-tested example domain to build from.

---

## Stack

- **NestJS 10** with Apollo Federation 2
- **MongoDB** via the native driver (no Mongoose — document schemas are defined in TypeScript, not as ODM models)
- **nestjs-pino** for structured JSON logging to stdout (Cloud Logging-compatible)
- **JWT verification** via `@nestjs/jwt` with RS256 — public key only, stateless validation
- **testcontainers** for integration tests against a real MongoDB instance

---

## Architecture

### Federation

Each subgraph exposes its own schema and is composed into the supergraph by Apollo Router at runtime. The `@key` directive on entity types enables cross-subgraph entity resolution. Schemas are generated from code via the `@nestjs/graphql` CLI plugin, which infers `@Field()` decorators automatically from `.model.ts` files — keeping model classes clean and reducing boilerplate.

### Auth

JWTs are issued exclusively by the auth service and verified here using only the public key — no cross-service calls per request. `JwtModule` is registered once in `SharedModule` and available to all domain modules. The `@UseGuards(JwtAccessGuard)` decorator protects individual resolvers; the `@JwtUserId()` param decorator extracts the verified user ID from the request context.

### MongoDB

The native MongoDB driver is used directly. Collections are injected as typed `Collection<T>` instances via NestJS's custom provider pattern — each domain defines its own factory that gets the collection by name from the shared `Db` instance. This keeps the connection lifecycle centralized while keeping collection ownership with the domain that uses it.

### Error Handling

A global `GqlExceptionFilter` normalizes all errors — whether thrown by guards, resolvers, or services — into consistent `GraphQLError` responses with a numeric `code` extension. NestJS `HttpException` subclasses (e.g. `UnauthorizedException`) are mapped using their HTTP status codes, so the GraphQL client always receives a predictable error shape.

---

## Project Structure

```
src/
  main.ts               ← bootstrap, startup env validation, logger, global filter
  app.module.ts         ← root module
  config/               ← app + database config, loaded via @nestjs/config
  common/
    filters/            ← GqlExceptionFilter
    guards/             ← JwtAccessGuard, JwtUserId decorator
  shared/
    mongo/              ← DB_CLIENT provider (mongodb Db instance)
    libs/               ← IdGeneratorService (prefixed uuid v4 IDs)
  app/
    example/            ← reference domain: entity, factory, model, module,
                           repository, resolver, service
test/
  example.integration.spec.ts   ← testcontainers integration tests
  jest.integration.json
```

---

## Creating a New Subgraph

This repo is a GitHub template. Use the "Use this template" button to create a new subgraph repo, then:

1. Update `name` in `package.json`
2. Build the real domain in `src/app/<domain>/` following the six-file pattern in `src/app/example/`
3. Add the domain's collection name to `src/config/database.ts` and `.env.example`
4. Register the new module in `app.module.ts`
5. Add integration tests in `test/`
6. Remove `src/app/example/` once the real domain is working

The `example/` domain is intentionally left in place as a reference until it's no longer needed.

---

## Local Development

Copy `.env.example` to `.env.local` and fill in the values.

For local MongoDB (via docker-compose in `infra/`), set:
```
MONGO_URI=mongodb://localhost:27017
```
This bypasses the Atlas connection string construction. Leave `MONGO_URI` unset in production and provide the individual Atlas vars instead.

```bash
pnpm run start:dev
```

---

## Testing

Integration tests use testcontainers to spin up a real MongoDB instance — no mocks, no in-memory substitutes. The test module wires up only the providers under test, injecting the real collection directly.

```bash
# Unit tests
pnpm test

# Integration tests (requires Docker)
pnpm run test:integration
```

Both run in CI on every push.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | HTTP port (default: 4000) |
| `MONGO_URI` | Local dev | Full connection string — bypasses Atlas vars |
| `DB_USERNAME` | Production | MongoDB Atlas username |
| `DB_PASSWORD` | Production | MongoDB Atlas password |
| `DB_CLUSTER` | Production | MongoDB Atlas cluster identifier |
| `DB_NAME` | Yes | MongoDB database name |
| `JWT_PUBLIC_KEY` | Yes | RSA public key PEM for verifying access tokens |

The app validates required environment variables at startup and exits with a clear error message if any are missing.
