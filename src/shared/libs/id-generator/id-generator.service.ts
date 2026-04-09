import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IdGeneratorService {
  generate(prefix: string): string {
    return `${prefix}-${uuidv4()}`;
  }
}
