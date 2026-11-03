import * as SQLite from 'expo-sqlite';

let promesa: Promise<SQLite.SQLiteDatabase> | null = null;

export function obtenerBaseDatos(): Promise<SQLite.SQLiteDatabase> {
  if (!promesa) {
    promesa = (async () => {
      const db = await SQLite.openDatabaseAsync('hallazgos.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS hallazgos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          foto TEXT NOT NULL,
          clase_predicha TEXT NOT NULL,
          confianza REAL NOT NULL,
          confiable INTEGER NOT NULL,
          fecha TEXT NOT NULL,
          latitud REAL,
          longitud REAL
        );
      `);
      return db;
    })();
    promesa.catch(() => {
      promesa = null;
    });
  }
  return promesa;
}