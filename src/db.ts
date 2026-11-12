import pg from 'pg';
import bcrypt from 'bcryptjs';

// jedan pool za cijelu aplikaciju
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDb() {
  // tablica employees
  // oib i placa se ne prikazuju u pretrazi, njih napadac izvlaci SQL umetanjem
  await pool.query(`
    CREATE TABLE IF NOT EXISTS employees ( 
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      department TEXT NOT NULL,
      email TEXT NOT NULL,
      oib CHAR(11) NOT NULL,
      salary NUMERIC(8,2) NOT NULL
    )
  `);

  // tablica users 
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  // prebroji retke tablice employees
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM employees'); 
  if (rows[0].n === 0) { // ako nema redaka, ubaci testne podatke
    await pool.query(`
      INSERT INTO employees (first_name, last_name, department, email, oib, salary) VALUES
        ('Dora', 'Vuković', 'Prodaja', 'dora.vukovic@bjelovar-soft.hr', '48201937465', 1387.50),
        ('Filip', 'Zrinšćak', 'IT', 'filip.z@bjelovar-soft.hr', '90317264851', 2214.00),
        ('Nikolina', 'Grgić', 'Računovodstvo', 'n.grgic@bjelovar-soft.hr', '17520948336', 1693.20),
        ('Ante', 'Vuković', 'Skladište', 'ante.vukovic@bjelovar-soft.hr', '62039175884', 1148.75),
        ('Lea', 'Pavlić', 'HR', 'lea.pavlic@bjelovar-soft.hr', '35846102973', 1580.00),
        ('Damir', 'Šarić', 'Uprava', 'damir.saric@bjelovar-soft.hr', '79153840260', 3962.40),
        ('Karla', 'Mesić', 'Marketing', 'karla.m@bjelovar-soft.hr', '24690517398', 1471.90),
        ('Ivor', 'Bencetić', 'IT', 'ivor.bencetic@bjelovar-soft.hr', '86417290531', 2487.10)
    `);
  }

  // prebroji retke tablice users
  const users = await pool.query('SELECT COUNT(*)::int AS n FROM users');
  if (users.rows[0].n === 0) { // ako nema redaka, ubaci testne podatke
    const hash = await bcrypt.hash('1234', 10); // namjerno slaba lozinka za brute-force
    // ubaci korisnika admin s hashom lozinke
    await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
      ['admin', hash]
    );
  }
}