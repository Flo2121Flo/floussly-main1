import fs from 'fs';
import path from 'path';

function createMigration() {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const name = process.argv[2] || 'migration';
  const filename = `${timestamp}_${name}.ts`;
  const migrationsDir = path.join(__dirname, '../database/migrations');

  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const template = `import { DatabaseService } from '../db';

async function up() {
  const db = DatabaseService.getInstance();

  await db.query(\`
    -- Add your migration SQL here
  \`);
}

async function down() {
  const db = DatabaseService.getInstance();

  await db.query(\`
    -- Add your rollback SQL here
  \`);
}

export { up, down };
`;

  const filePath = path.join(migrationsDir, filename);
  fs.writeFileSync(filePath, template);
  console.log(`Created migration file: ${filename}`);
}

createMigration(); 