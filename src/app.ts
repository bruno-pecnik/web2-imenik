import 'dotenv/config';
import express from 'express';
import { initDb } from './db.js';
import { sqliRouter } from './routes/sqli.js';

const app = express();
const port = process.env.PORT || 3000; // render zadaje port, a lokalno sluša na 3000

app.set('view engine', 'ejs'); 
app.use(express.urlencoded({ extended: true })); // omogućuje da server čita podatke iz formi (req.body)

app.use('/', sqliRouter); // uključi ruter u aplikaciju

await initDb(); // funkcija iz db.ts, inicijalizira bazu
app.listen(port, () => console.log(`Server na portu ${port}`));