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
    expect(typeof response.body.score).toBe('number');
    expect(response.body.score).toBeGreaterThanOrEqual(0);
    expect(response.body.score).toBeLessThanOrEqual(1);
    expect(response.body).toHaveProperty('timestamp');
    expect(typeof response.body.timestamp).toBe('number');
    expect(response.body.timestamp).toBeGreaterThanOrEqual(0);
    expect(response.body).toHaveProperty('sparql_endpoint');
    expect(typeof response.body.sparql_endpoint).toBe('string');
    expect(response.body.sparql_endpoint).toBe(
      'https://virtuoso-test-external-service-ndc-test.apps.cloudpub.testedev.istat.it/sparql',
    );
    expect(response.body).toHaveProperty('models');
    expect(Array.isArray(response.body.models)).toBe(true);
    expect(response.body.models.length).toBeGreaterThan(0);
    expect(response.body.models[0]).toHaveProperty('name');
    expect(response.body.models[0]).toHaveProperty('score');
    expect(response.body.models[0]).toHaveProperty('has_annotations');
    expect(response.body.models[0]).toHaveProperty('raw_properties_count');
    expect(response.body.models[0]).toHaveProperty('valid_properties_count');
    expect(response.body.models[0]).toHaveProperty('invalid_properties_count');
    expect(response.body.models[0]).toHaveProperty('properties');
    expect(Array.isArray(response.body.models[0].properties)).toBe(true);
    expect(response.body.models[0].properties.length).toBeGreaterThanOrEqual(0);
  });
});
