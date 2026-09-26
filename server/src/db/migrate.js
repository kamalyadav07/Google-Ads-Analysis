const fs = require('fs');
const path = require('path');
const { getPool, ensureDatabaseExists, testConnection } = require('../config/db');

async function runMigrations() {
  console.log('🔄 Checking database connectivity and running migrations...');

  await ensureDatabaseExists();
  const connTest = await testConnection();
  if (!connTest.connected) {
    console.warn(`⚠️ Could not connect to MySQL: ${connTest.error}`);
    console.warn('⚠️ Starting in standalone mode without migrations. Connect a remote MySQL instance to persist records.');
    return;
  }

  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    // 1. Create _migrations table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`_migrations\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL UNIQUE,
        \`executed_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Fetch already executed migrations
    const [executedRows] = await connection.query('SELECT `name` FROM `_migrations`');
    const executedSet = new Set(executedRows.map(r => r.name));

    // 3. Read migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`  ✓ Migration already applied: ${file}`);
        continue;
      }

      console.log(`  ▶ Running migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');

      // Strip SQL line comments first, then split by semicolon
      const noComments = sqlContent
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n');

      const statements = noComments
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      await connection.beginTransaction();
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }

      await connection.query('INSERT INTO `_migrations` (`name`) VALUES (?)', [file]);
      await connection.commit();
      console.log(`  ✅ Successfully applied migration: ${file}`);
    }

    // 4. Ensure default landing pages are registered
    const [pageRows] = await connection.query('SELECT COUNT(*) AS cnt FROM `landing_pages`');
    if (pageRows[0].cnt === 0) {
      console.log('  🌱 Registering default service landing pages...');
      const defaultPages = [
        ['cctv', 'Commercial CCTV & Surveillance Solutions', 450.00],
        ['noc', '24/7 Network Operations Center (NOC) Services', 650.00],
        ['video-conferencing', 'Enterprise Video Conferencing & Boardroom AV', 550.00],
        ['cybersecurity', 'Managed Detection & Enterprise Cybersecurity', 800.00],
        ['data-center', 'Data Center Hosting, Colocation & Migration', 1200.00],
        ['networking', 'Structured Cabling & Enterprise Networking', 400.00]
      ];

      for (const [slug, title, cpl] of defaultPages) {
        await connection.query(
          'INSERT INTO `landing_pages` (`slug`, `title`, `target_cpl`, `is_active`) VALUES (?, ?, ?, 1)',
          [slug, title, cpl]
        );
      }
      console.log('  ✅ 6 core landing pages registered.');
    }

    console.log('🎉 All migrations completed successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Direct execution from CLI
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigrations };
