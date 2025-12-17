export default ({ env }) => {
  // Для Strapi Cloud используем ТОЛЬКО PostgreSQL
  return {
    connection: {
      client: 'postgres',
      connection: {
        connectionString: env('DATABASE_URL'),
        ssl: { rejectUnauthorized: false }
      },
      pool: { min: 2, max: 10 },
    },
  };
};