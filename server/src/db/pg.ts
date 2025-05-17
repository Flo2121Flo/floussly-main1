import { Pool } from 'pg';
import { config } from '../config/config';

export const pg = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pg.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
}); 