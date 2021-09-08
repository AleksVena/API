import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function createDocumentation(app) {
  // не создавать документацию для прода
  if (process.env.NODE_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('документация')
      .setDescription('API description')
      .setVersion('1.0')
      .addTag('auth')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }
}
