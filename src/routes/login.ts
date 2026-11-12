import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

// skup ruta za drugu ranjivost
export const loginRouter = Router();

// broj neuspjelih pokusaja i vrijeme do kad je račun zaključan
const attempts = new Map<string, number>(); // parovi ključ-vrijednost, koliko krivih pokušaja ima svaki korisnik
const lockedUntil = new Map<string, number>(); // do kada je koji korisnik zaključan, timestamp od 1970.
const MAX_ATTEMPTS = 3;
const LOCK_MS = 5 * 60 * 1000; // 5 minuta

// lista lozinki za brute-force
const COMMON_PASSWORDS = [
  'password', '123', '123456789', 'qwerty', 'abc', 
  '111111', 'abcd', 'abcde', '12345', '1234',
];

// provjera jednog para korisnik-lozinka
async function tryLogin(username: string, password: string, ranjivo: boolean) {
  // sigurno, ako je račun još uvijek zaključan unutar 5 min, odbij 
  if (!ranjivo) {
    const until = lockedUntil.get(username) ?? 0; // dohvati vrijeme do kad je korisnik zaključan
    if (Date.now() < until) {
      return { ok: false, locked: true };
    }
  }

  // provjera postoji li korisnik u bazi
  const { rows } = await pool.query(
    'SELECT password_hash FROM users WHERE username = $1',
    [username]
  );
  if (rows.length === 0) return { ok: false, locked: false }; // nema korisnika

  // provjeri je li lozinka dobra
  const match = await bcrypt.compare(password, rows[0].password_hash);
  // ako je dobra
  if (match) {
    attempts.delete(username); // resetiraj brojač krivih pokušaja
    lockedUntil.delete(username); // makni zaključavanje
    return { ok: true, locked: false };
  }

  // ako je lozinka neuspješna
  const n = (attempts.get(username) ?? 0) + 1; 
  attempts.set(username, n); // povećaj brojač pokušaja
  if (n >= MAX_ATTEMPTS) {
    lockedUntil.set(username, Date.now() + LOCK_MS); // ako previše pokušaja, zaključaj račun na 5 minuta
  }
  return { ok: false, locked: false };
}

// ruta za login stranicu
loginRouter.get('/login', (_req, res) => {
  res.render('login', { log: null });
});

// jedan pokušaj obrade login forme
loginRouter.post('/login', async (req, res) => {
  const username = req.body.username ?? '';
  const password = req.body.password ?? '';
  const ranjivo = req.body.ranjivo === 'on'; // on ako je kvačica selektirana

  const result = await tryLogin(username, password, ranjivo);

  let ishod;
  if (result.locked) ishod = 'račun zaključan';
  else if (result.ok) ishod = `USPJEH, prijavljen kao ${username}`;
  else ishod = 'neuspjeh';

  res.render('login', { log: [{ pokusaj: '-', lozinka: password, ishod }] });
});

// brute-force napad, proba listu lozinki
loginRouter.post('/brute', async (req, res) => {
  const username = req.body.username || 'admin';
  const ranjivo = req.body.ranjivo === 'on';

  attempts.delete(username);     // resetira brojač pokušaja za demo brute-force napada
  lockedUntil.delete(username); // resetira zaključavanje 
  const log = [];

  for (let i = 0; i < COMMON_PASSWORDS.length; i++) {
    const lozinka = COMMON_PASSWORDS[i];
    const result = await tryLogin(username, lozinka, ranjivo);

    let ishod;
    if (result.locked) ishod = 'zaključan';
    else if (result.ok) ishod = 'USPJEH';
    else ishod = 'neuspjeh';

    log.push({ pokusaj: i + 1, lozinka, ishod });
    if (result.ok) break; // lozinka pogođena, prekini
  }

  res.render('login', { log });
});