import 'dotenv/config';
import express from 'express';
import { initDb } from './db.js';

const app = express();
const port = process.env.PORT || 3000; // render zadaje port, a lokalno sluša na 3000

// ruta početne stranice
app.get('/', (_req, res) => {
  res.send('Imenik radi');
});

await initDb(); // funkcija iz db.ts, inicijalizira bazu
app.listen(port, () => console.log(`Server na portu ${port}`));