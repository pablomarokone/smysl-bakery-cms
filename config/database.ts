export default ({ env }) => {
  // FORCE POSTGRES FOR ALL ENVIRONMENTS
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