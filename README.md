# web2-imenik

Druga laboratorijska vježba iz Web2 (Napredni razvoj programske potpore za web). Web-aplikacija
koja demonstrira dvije sigurnosne ranjivosti, svaka s prekidačem (checkbox) za
uključivanje i isključivanje. Tema je interni imenik zaposlenika.

Aplikacija: https://web2-imenik.onrender.com

## Ranjivosti

**1. SQL injection** (stranica `/`, pretraga po prezimenu)
Kad je ranjivost uključena, unos se spaja direktno u SQL upit, pa unos
`' OR 1=1 --` vrati sve retke iz tablice. Kad je isključena, koristi se
parametrizirani upit (`$1`) i taj unos ne vrati ništa. Izvršeni upit se
ispisuje na stranici da se vidi razlika.

**2. Broken Authentication** (stranica `/login`, prijava admina)
Gumb "Pokreni brute-force" isprobava listu čestih lozinki. Kad je ranjivost
uključena, nema ograničenja pa se slaba lozinka na kraju pogodi. Kad je
isključena, račun se zaključa nakon 3 pogrešna pokušaja na 5 minuta, pa
napad ne uspije.

## Testni korisnik

korisnik: admin

lozinka: 1234

## Napomena (SQL injection na cloudu)

Render ispred aplikacije ima WAF (Cloudflare) koji se na besplatnom planu ne
može isključiti. On prepozna `' OR 1=1 --` kao napad i vrati 403 prije nego
zahtjev dođe do aplikacije, bez obzira na stanje prekidača. Zato se SQL
injection (i napad i obrana) demonstrira lokalno. Na cloudu radi normalna
pretraga po prezimenu, a brute-force napad radi i na cloudu jer ne šalje
napadački unos.

## Lokalno pokretanje

Treba Node.js i PostgreSQL baza (koristio sam Neon, neon.tech). U korijenu
projekta napravite datoteku `.env` i upišite connection string svoje baze:

    DATABASE_URL=postgresql://korisnik:lozinka@host/baza?sslmode=verify-full

Zatim pokrenite:

    npm install
    npm run dev

Otvorite http://localhost:3000. Tablice i testni podaci se stvaraju sami pri
prvom pokretanju.

## Korišteno

Node.js, Express, TypeScript, EJS, PostgreSQL (pg), bcryptjs.