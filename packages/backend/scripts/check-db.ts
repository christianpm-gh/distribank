/**
 * check-db.ts — Diagnóstico y reparación de schema en un nodo PostgreSQL
 *
 * Uso:
 *   npx ts-node scripts/check-db.ts <database_url>
 *
 * Ejemplos:
 *   npx ts-node scripts/check-db.ts "postgresql://postgres:.3131713@localhost:5432/distribank"
 *   npx ts-node scripts/check-db.ts "$NODE_A_DATABASE_URL"
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const REQUIRED_TABLES = [
  'customers',
  'accounts',
  'customer_accounts',
  'cards',
  'transactions',
  'transaction_log',
];

const DDL_PATH = path.resolve(
  __dirname,
  '../../frontend/docs/ddl_data_distribank/00_ddl_base.sql',
);

async function main() {
  const dbUrl = process.argv[2];
  if (!dbUrl) {
    console.error('Usage: npx ts-node scripts/check-db.ts <database_url>');
    process.exit(1);
  }

  const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
  const client = new Client({
    connectionString: dbUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  try {
    console.log('\n📡 Conectando a:', dbUrl.replace(/:[^:@]+@/, ':****@'));
    await client.connect();
    console.log('✅ Conexión establecida\n');

    // 1. Verificar versión
    const versionRes = await client.query('SELECT version();');
    console.log('PostgreSQL:', versionRes.rows[0].version.split(',')[0]);

    // 2. Verificar schemas
    const schemasRes = await client.query(
      "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema','pg_catalog','pg_toast') ORDER BY schema_name;"
    );
    console.log('\n📂 Schemas:', schemasRes.rows.map(r => r.schema_name).join(', '));

    // 3. Verificar tablas en public
    const tablesRes = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
    );
    const existingTables = tablesRes.rows.map((r: any) => r.tablename);
    console.log('\n📋 Tablas en public:', existingTables.length ? existingTables.join(', ') : '(ninguna)');

    // 4. Detectar tablas faltantes
    const missingTables = REQUIRED_TABLES.filter(t => !existingTables.includes(t));
    if (missingTables.length > 0) {
      console.log('\n⚠️  Tablas faltantes:', missingTables.join(', '));
      console.log('🔧 Aplicando DDL base...');
      await applyDDL(client);
    } else {
      console.log('\n✅ Todas las tablas requeridas existen');
    }

    // 5. Verificar y eliminar FK cross-nodo
    const fkRes = await client.query(
      "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'transactions' AND constraint_name = 'fk_transactions_to_account' AND table_schema = 'public';"
    );
    if (fkRes.rows.length > 0) {
      console.log('\n⚠️  FK cross-nodo detectada: fk_transactions_to_account');
      console.log('🔧 Eliminando FK...');
      await client.query('ALTER TABLE transactions DROP CONSTRAINT IF EXISTS fk_transactions_to_account;');
      console.log('✅ FK eliminada');
    } else {
      console.log('✅ FK cross-nodo ya eliminada');
    }

    // 6. Contar filas por tabla
    console.log('\n📊 Conteo de filas:');
    for (const table of REQUIRED_TABLES) {
      try {
        const countRes = await client.query(`SELECT COUNT(*) FROM public.${table};`);
        console.log(`   ${table}: ${countRes.rows[0].count} filas`);
      } catch {
        console.log(`   ${table}: error al contar`);
      }
    }

    console.log('\n✅ Diagnóstico completado\n');
  } catch (err) {
    console.error('\n❌ Error:', (err as Error).message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function applyDDL(client: Client) {
  if (!fs.existsSync(DDL_PATH)) {
    console.error('❌ DDL no encontrado en:', DDL_PATH);
    process.exit(1);
  }
  const ddl = fs.readFileSync(DDL_PATH, 'utf-8');
  try {
    await client.query(ddl);
    console.log('✅ DDL aplicado correctamente');
    // Siempre eliminar FK cross-nodo
    await client.query('ALTER TABLE transactions DROP CONSTRAINT IF EXISTS fk_transactions_to_account;');
    console.log('✅ FK cross-nodo eliminada post-DDL');
  } catch (err) {
    const msg = (err as Error).message;
    // Si el error es que las tablas ya existen, continuar
    if (msg.includes('already exists') || msg.includes('ya existe')) {
      console.log('ℹ️  Algunas estructuras ya existen, continuando...');
    } else {
      console.error('❌ Error aplicando DDL:', msg);
      process.exit(1);
    }
  }
}

main();
