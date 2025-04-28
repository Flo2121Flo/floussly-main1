import { DatabaseService } from '../db';

async function up() {
  const db = DatabaseService.getInstance();

  // Create payments table
  await db.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) NOT NULL,
      status VARCHAR(10) NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    );

    CREATE INDEX idx_payments_status ON payments(status);
    CREATE INDEX idx_payments_created_at ON payments(created_at);
  `);
}

async function down() {
  const db = DatabaseService.getInstance();

  // Drop payments table
  await db.query(`
    DROP TABLE IF EXISTS payments;
  `);
}

export { up, down }; 