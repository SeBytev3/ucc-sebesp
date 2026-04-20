import { cleanEnv, str, port, num } from 'envalid';

export function validateEnv() {
  const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
    PORT: port({ default: 4000 }),
    DATABASE_URL: str(),
    JWT_SECRET: str(),
    JWT_EXPIRATION: str({ default: '24h' }),
    JWT_COOKIE_EXPIRATION: num({ default: 1 }),
    UPLOAD_DIR: str({ default: 'uploads' }),
  });

  // Validate JWT_SECRET length manually
  if (env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return env;
}
