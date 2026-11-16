# SmartChip — menaxhimi i çipave të banesës

Dy panele: **Admin** dhe **Banor**. Çipi aktiv hap **të gjitha katet**. Pagesa e vonuar e fik çipin. SOS në lift njofton gjithë ndërtesën.

## Llogaritë demo

| Rol | Email | Fjalëkalimi |
|-----|--------|-------------|
| Admin | `admin@smartchip.local` | `admin123` |
| Banor (çip aktiv) | `arben@smartchip.local` | `banor123` |
| Banor (pagesë vonuar, çip fikur) | `elira@smartchip.local` | `banor123` |

## Nisja

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --app-dir .
```

```bash
cd frontend
npm install
npm run dev
```

Hap http://localhost:5173

Databaza e re: `backend/smartchip.db` (SQLite për demo; në prodhim mund të jetë SQL Server).

## Çfarë ka

- Admin: banesa, çipa, kërkesa, pagesa, aktivizim/çaktivizim, lift jashtë pune
- Banor: profili, çipat, kërkesë për çip, raportim i humbur, pagesa, SOS
- Njoftime në app + kanal `email` i simuluar (SOS, outage, afati i pagesës)
- **EchoFloor** (unik): kati ku ngeci dikush “jehon” te të gjithë banorët; fqinjët klikojnë **Po vij**

Email real (SMTP) mund të lidhet më vonë mbi të njëjtat njoftime.
