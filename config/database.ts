export default ({ env }) => ({
  connection: {
    client: env('DATABASE_CLIENT', 'postgres'),
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi_local'),
      user: env('DATABASE_USERNAME', 'postgres'),
      password: env('DATABASE_PASSWORD', ''),
      ssl:
        env.bool('DATABASE_SSL', false)
          ? { rejectUnauthorized: env.bool('DATABASE_SSL_SELF_SIGNED', false) ? false : true }
          : false,
    },
    pool: { min: 2, max: 10 },
  },
});
