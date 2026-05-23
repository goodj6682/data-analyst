import initSqlJs, { Database } from "sql.js";
import { ParsedData } from "@/types";

let db: Database | null = null;

async function getDB(): Promise<Database> {
  if (!db) {
    const SQL = await initSqlJs();
    db = new SQL.Database();
  }
  return db;
}

export async function loadCSVToSQLite(data: ParsedData): Promise<void> {
  const database = await getDB();

  const columnDefs = data.headers
    .map((col) => {
      const safeName = col.name.replace(/[^a-zA-Z0-9_]/g, "_");
      if (col.type === "number") return `"${safeName}" REAL`;
      return `"${safeName}" TEXT`;
    })
    .join(", ");

  database.run(`DROP TABLE IF EXISTS uploaded_data`);
  database.run(`CREATE TABLE uploaded_data (${columnDefs})`);

  if (data.rows.length === 0) return;

  const placeholders = data.headers.map(() => "?").join(", ");
  const stmt = database.prepare(
    `INSERT INTO uploaded_data VALUES (${placeholders})`
  );

  for (const row of data.rows) {
    const values = row.map((val, colIdx) => {
      const col = data.headers[colIdx];
      if (col.type === "number") {
        const num = Number(val);
        return isNaN(num) ? null : num;
      }
      return val !== null && val !== undefined ? String(val) : null;
    });
    stmt.run(values);
  }

  stmt.free();
}

export async function executeSQL(sql: string): Promise<any[]> {
  const database = await getDB();
  const results = database.exec(sql);

  if (results.length === 0) return [];

  const columns = results[0].columns;
  const rows = results[0].values;

  return rows.map((row) => {
    const obj: Record<string, any> = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}
