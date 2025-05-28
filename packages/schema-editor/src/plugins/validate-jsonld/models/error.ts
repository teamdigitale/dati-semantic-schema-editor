export interface SwaggerError {
  source: string;
  level: string;
  type: string;
  message: string;
  path: string[];
  line: number;
}
