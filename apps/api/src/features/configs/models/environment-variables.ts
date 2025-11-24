import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsOptional()
  NODE_ENV: string;

  @IsNumber()
  PORT: number;

  @IsString()
  CORS_ORIGIN: string;

  @IsString()
  SPARQL_URL: string;
}
