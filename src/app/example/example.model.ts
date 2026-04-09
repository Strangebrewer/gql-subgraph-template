import { ArgsType, Directive, ObjectType } from '@nestjs/graphql';

// @Field() decorators are not required on these types — the @nestjs/graphql
// CLI plugin (configured in nest-cli.json) infers them automatically from
// files matching the .model.ts suffix.

@ObjectType()
@Directive('@key(fields: "id")')
export class Example {
  id: string;
  thing: string;
  userId: string;
}

@ArgsType()
export class CreateExampleArgs {
  thing: string;
}

@ArgsType()
export class UpdateExampleArgs {
  thing: string;
}

@ObjectType()
export class DeleteResult {
  acknowledged: boolean;
  deletedCount: number;
}
