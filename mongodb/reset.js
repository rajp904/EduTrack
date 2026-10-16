/**
 * MongoDB Database Reset Script
 * Course: CSE494 - Intelligent NoSQL Databases
 * 
 * Safely drops existing collections, reapplies $jsonSchema validators,
 * and recreates all indexes.
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyValidators } from './validators.js';
import { createIndexes } from './indexes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrack';

export async function resetDatabase() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log(` Resetting MongoDB database: ${MONGODB_URI}`);
    const db = client.db();

    const collections = ['attendance', 'marks', 'students', 'courses'];
    for (const name of collections) {
      try {
        await db.collection(name).drop();
        console.log(` Dropped collection '${name}'`);
      } catch (err) {
        if (err.codeName !== 'NamespaceNotFound') {
          console.warn(` Warning dropping '${name}':`, err.message);
        }
      }
    }

    await client.close();

    console.log('\n Re-applying validators...');
    await applyValidators();

    console.log('\n Re-creating indexes...');
    await createIndexes();

    console.log('\n Database reset complete and ready for clean data seeding!');
  } catch (err) {
    console.error(' Error resetting database:', err);
    throw err;
  }
}

if (process.argv[1] && process.argv[1].endsWith('reset.js')) {
  resetDatabase().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
