import { GraphQLError } from 'graphql';

export class NotFoundError extends GraphQLError {
  constructor(item: string) {
    const msg = `${item} not found`;
    super(msg, { extensions: { code: 404 } });
  }
}
