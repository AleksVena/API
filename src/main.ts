import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//const cookieParser = require('cookie-parser');
import * as cookieParser from 'cookie-parser';

import { AllExceptionsFilter } from './core/interceptors/error.interceptor';
import { createDocumentation } from './core/documentation/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  //app.use(checkServerStatus);
  app.use(cookieParser());

  app.useGlobalFilters(new AllExceptionsFilter());

  createDocumentation(app);

  await app.listen(process.env.PORT || 3024);
}
bootstrap();
