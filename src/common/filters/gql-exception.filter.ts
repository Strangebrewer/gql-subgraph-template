import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class GqlExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GqlExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType<GqlContextType>() !== 'graphql') {
      return;
    }

    if (exception instanceof GraphQLError) {
      this.logger.error(exception.message);
      throw exception;
    }

    if (exception instanceof HttpException) {
      this.logger.error(exception.message);
      throw new GraphQLError(exception.message, {
        extensions: { code: exception.getStatus() },
      });
    }

    this.logger.error(exception);
    throw new GraphQLError('Internal server error', {
      extensions: { code: 500 },
    });
  }
}
