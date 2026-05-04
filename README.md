# BeeReady

**BeeReady** egy tanulást segítő webalkalmazás, amely kvízeket, flashcardokat, órarendet és közösségi funkciókat (Hive) kínál diákok számára.

---

##  Funkciók

- **Kvíz** – Saját kvízek létrehozása és kitöltése
- **Flashcards** – Kártyaalapú tanulás paklik segítségével
- **Órarend** – Személyes órarend kezelése
- **Hive** – Közösségi felület (csoportos funkciók)
- **Profil** – Felhasználói fiók, avatar választással
- **Admin panel** – Adminisztrátori felület

---

## Technológiai stack

| Réteg      | Technológia                              |
|------------|------------------------------------------|
| Frontend   | HTML, CSS, vanilla JavaScript            |
| Backend    | Node.js, Express 5                       |
| Adatbázis  | MySQL 2                                  |
| Auth       | JWT (jsonwebtoken), bcrypt               |
| Egyéb      | morgan (logging), express-rate-limit, dotenv |

---

## Előfeltételek

- [Node.js](https://nodejs.org/) v18+
- MySQL szerver (pl. XAMPP, MySQL Workbench, vagy natív telepítés)

---

## Telepítés és indítás

### 1. Projekt klónozása

```bash
git clone <repository-url>
cd BeeReady
```

### 2. Függőségek telepítése

```bash
cd backend
npm install
```

### 3. Környezeti változók beállítása

```bash
cp .env.example .env
```

Nyisd meg a `.env` fájlt és töltsd ki az adatokat:

```env
SERVER_IP=127.0.0.1
PORT=4000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=jelszo
DB_NAME=BeeReady_db
DB_CONNECTION_LIMIT=10

# JWT titkos kulcs generálása:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<generalt_kulcs>

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=300
```

### 4. Adatbázis létrehozása

Importáld az SQL sémát MySQL-be:

MySQL Workbench-ben: **File → Open SQL Script → `backend/sql/beeready_db.sql` → Execute**

### 5. Szerver indítása

```bash
# Produkció
npm start

# Fejlesztői mód (automatikus újraindítással)
npm run dev
```

Az alkalmazás elérhető: **http://127.0.0.1:4000/**

---

## Tesztek futtatása

```bash
cd backend
npm test
```

A tesztek Jest keretrendszerrel futnak (`unit.test.js`).



---

## Projektstruktúra

```
BeeReady/
├── backend/
│   ├── api/
│   │   └── api.js              # API végpontok
│   ├── middleware/
│   │   ├── errorHandler.js     # Hibakezelő middleware
│   │   └── jsonwebtoken.js     # JWT autentikáció
│   ├── sql/
│   │   ├── beeready_db.sql     # Adatbázis séma
│   │   ├── database.js         # DB kapcsolat
│   │   └── querys.js           # SQL lekérdezések
│   ├── server.js               # Express szerver belépési pont
│   ├── utils.js                # Segédfüggvények
│   ├── unit.test.js            # Egységtesztek
│   ├── data_test.js            # Adattesztek
│   └── .env.example            # Környezeti változók mintája
└── frontend/
    ├── html/
    │   ├── index.html          # Bejelentkezés / Regisztráció
    │   ├── main.html           # Fő alkalmazás
    │   └── admin.html          # Admin felület
    ├── css/                    # Stíluslapok modulonként
    ├── javascript/             # Frontend logika modulonként
    └── img/                    # Képek, ikonok, avatárok
```

---

## Szerzők

- **Székely Balázs**
- **Székely Hunor**

---

