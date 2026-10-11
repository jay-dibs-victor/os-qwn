import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import bcrypt from "bcryptjs";

let db: Database | null = null;

export async function getDb() {
  if (db) return db;

  db = await open({
    filename: path.join(process.cwd(), "queens_os.db"),
    driver: sqlite3.Database,
  });

  // Create admins table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'admin'
    )
  `);

  // Seed default admin if table is empty
  const adminCount = await db.get("SELECT COUNT(*) as count FROM admins");
  if (adminCount.count === 0) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.warn("ADMIN_PASSWORD not set. Skipping admin seeding.");
      return db;
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await db.run(
      "INSERT INTO admins (username, password, role) VALUES (?, ?, ?)",
      ["admin", hashedPassword, "admin"]
    );
    console.log("Admin user seeded on initialization.");
  }

  return db;
}
