import { Router } from 'express';
import { pool } from '../db.js';

export const sqliRouter = Router(); // novi skup ruta

// početna stranica 
sqliRouter.get('/', (_req, res) => {
  res.render('index', { results: null, query: null, sql: null });
});

// pretraga zaposlenika po prezimenu
sqliRouter.post('/search', async (req, res) => {
  // čita prezume iz forme, ako ga nema stavi prazan string
  const prezime = req.body.prezime ?? '';
  // ako je checkbox označen, postavi ranjivo na true
  const ranjivo = req.body.ranjivo === 'on'; 

  let sql: string;
  let result;

  if (ranjivo) {
    // nesigurno, prezime se spaja direkno na SQL, pa unos postaje dio koda
    sql = `SELECT * FROM employees WHERE LOWER(last_name) = LOWER('${prezime}')`;
    result = await pool.query(sql);
  } else {
    // sigurno, prezime se salje odvojeno u nizu, pg ga umetne na mjesto $1 (baza tretira kao vrijednost, ne kao SQL)
    sql = `SELECT * FROM employees WHERE LOWER(last_name) = LOWER($1)`;
    result = await pool.query(sql, [prezime]);
  }

  res.render('index', { // prikaže stranicu s rezultatima pretrage
    results: result.rows,
    query: prezime,
    sql, 
  });
});