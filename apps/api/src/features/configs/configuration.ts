export const configuration = () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  throttleTTL: parseInt(process.env.THROTTLE_TTL || '60000'),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '15'),
  sparqlUrl: process.env.SPARQL_URL as string,
});
