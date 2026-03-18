export const configuration = () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  throttleTTL: parseInt(process.env.THROTTLE_TTL || '60000'),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '15'),
  sparqlUrl: process.env.SPARQL_URL as string,
  sparqlCacheTTL: parseInt(process.env.SPARQL_CACHE_TTL || '300000'), // 5 minutes default
  basePath: process.env.BASE_PATH as string,
});
