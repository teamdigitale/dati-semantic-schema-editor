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

  it('should process YAML file successfully and return JSON response', async () => {
    const response = await request(app.getHttpServer())
      .post('/semantic-score')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', path.join(__dirname, 'example.yaml'), {
        contentType: 'application/octet-stream',
      });
    expect(response.statusCode).toEqual(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty('score');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('sparql_endpoint');
    expect(response.body).toHaveProperty('summary');
    expect(response.body.summary).toHaveProperty('raw_models_count');
    expect(response.body.summary).toHaveProperty('positive_score_models_count');
    expect(response.body.summary).toHaveProperty('models_calculation_details');
    expect(
      Array.isArray(response.body.summary.models_calculation_details),
    ).toBe(true);
    expect(typeof response.body.score).toBe('number');
    expect(response.body.score).toBeGreaterThanOrEqual(0);
    expect(response.body.score).toBeLessThanOrEqual(1);
    expect(typeof response.body.timestamp).toBe('number');
    expect(typeof response.body.sparql_endpoint).toBe('string');
    expect(typeof response.body.summary.raw_models_count).toBe('number');
    expect(typeof response.body.summary.positive_score_models_count).toBe(
      'number',
    );
  });
});
