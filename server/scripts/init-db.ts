import { DatabaseService } from '../database/db';

async function initDatabase() {
  try {
    const db = DatabaseService.getInstance();
    await db.init();
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase(); 