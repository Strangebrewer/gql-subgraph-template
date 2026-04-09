import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAccessGuard, JwtUserId } from '../../common/guards/jwt-access.guard';
import { CreateExampleArgs, DeleteResult, Example, UpdateExampleArgs } from './example.model';
import { ExampleService } from './example.service';

@Resolver(() => Example)
export class ExampleResolver {
  constructor(private readonly exampleService: ExampleService) {}

  @Query(() => Example)
  @UseGuards(JwtAccessGuard)
  async getExample(
    @Args('id') id: string,
  ): Promise<Example> {
    return this.exampleService.findById(id);
  }

  @Query(() => [Example])
  @UseGuards(JwtAccessGuard)
  async getExamples(
    @JwtUserId() userId: string,
  ): Promise<Example[]> {
    return this.exampleService.find(userId);
  }

  @Mutation(() => Example)
  @UseGuards(JwtAccessGuard)
  async createExample(
    @JwtUserId() userId: string,
    @Args() args: CreateExampleArgs,
  ): Promise<Example> {
    return this.exampleService.create(args, userId);
  }

  @Mutation(() => Example)
  @UseGuards(JwtAccessGuard)
  async updateExample(
    @Args('id') id: string,
    @Args() args: UpdateExampleArgs,
  ): Promise<Example> {
    return this.exampleService.update(id, args);
  }

  @Mutation(() => DeleteResult)
  @UseGuards(JwtAccessGuard)
  async deleteExample(
    @Args('id') id: string,
  ): Promise<DeleteResult> {
    return this.exampleService.delete(id);
  }
}
