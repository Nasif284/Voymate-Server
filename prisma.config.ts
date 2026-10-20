import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'src/infrastructure/database/schema/',
  migrations: {
    path: 'src/infrastructure/database/migrations',
    seed: 'tsx src/infrastructure/database/seeds/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
