import { describe, expect, it } from 'vitest';
import 'reflect-metadata';

import { validate } from './validation';

describe('config', () => {
  it('should throw error if invalid config', () => {
    const config = {
      PORT: 3000,
      // SPARQL_URL: "https://api.example.com",
    };
    expect(() => validate(config)).toThrowError(
      `property SPARQL_URL has failed the following constraints: isString`,
    );
  });

  it('should continue if valid config', () => {
    // Make sure to have a correct .env file in root directory!
    const config = {
      PORT: 3000,
      CORS_ORIGIN: '*',
      SPARQL_URL: 'https://api.example.com',
    };
    expect(() => validate(config)).not.toThrow();
    expect(config.SPARQL_URL).toEqual('https://api.example.com');
  });
});
