import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('Imenik radi');
});

app.listen(port, () => console.log(`Server na portu ${port}`));