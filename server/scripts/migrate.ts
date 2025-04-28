import { up } from '../database/migrations/001_initial_schema';

async function migrate() {
  try {
    console.log('Running migrations...');
    await up();
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 