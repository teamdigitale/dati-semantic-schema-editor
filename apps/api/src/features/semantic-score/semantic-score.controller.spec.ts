import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import path from 'path';
import request from 'supertest';
import { App } from 'supertest/types';
import { LoggerModule } from '../logger';
import { SemanticScoreController } from './semantic-score.controller';

describe('SemanticScoreController', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({}), LoggerModule.forRoot({})],
      controllers: [SemanticScoreController],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: () =>
          'https://virtuoso-test-external-service-ndc-test.apps.cloudpub.testedev.istat.it/sparql',
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should process YAML file successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/semantic-score')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', path.join(__dirname, 'example.yaml'), {
        contentType: 'application/octet-stream',
      });
    expect(response.statusCode).toEqual(200);
    expect(response.headers['content-type']).toEqual('application/yaml');
    expect(response.headers['content-disposition']).toEqual(
      'attachment; filename="spec.yaml"',
    );
    expect(response.text).toContain('x-semantic-score');
  });
});
