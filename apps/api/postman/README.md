# Postman — Semantic Score Calculator API

Collection Postman per testare l'API `apps/api` (Semantic Score Calculator) deployata.

## Contenuto

- `Semantic Score Calculator.postman_collection.json` — la collection con 8 test.
- `fixtures/` — file di esempio caricati dalle richieste verso `/semantic-score`:
  - `annotated.yaml` — OpenAPI 3.0 annotato (x-jsonld-type / x-jsonld-context).
  - `not-annotated.yaml` — OpenAPI 3.0 valido senza annotazioni semantiche.
  - `unsupported.txt` — file di testo con media type non supportato.
  - `openapi-3.1.0.yaml` — documento OpenAPI 3.1.0 (versione non supportata).

## Casi testati

| Richiesta | Verifica |
|-----------|----------|
| `api istat - healthcheck` | `GET /status` → 200, body `{status:200, title:"OK"}` |
| `api istat - file annotato` | `POST /semantic-score` con file annotato → 200, score 0..1, model annotati |
| `api istat - file non annotato` | `POST /semantic-score` senza annotazioni → 200, score 0, `has_annotations:false` |
| `api istat - file non supportato` | media type non valido → 415 `application/problem+json` |
| `api istat - file con errori (openapi 3.1.0)` | versione non supportata → 406, detail cita `3.0.x` |
| `api istat - disabilitazione swagger in produzione` | `GET /swagger-ui` → 404 (UI disabilitata); `openapi.yaml` resta 200 |
| `api istat - cors` | preflight `OPTIONS /status` → header `Access-Control-Allow-*` |
| `api istat - rate limiting` | molte richieste a `/status` → 429 con header di throttling |

## Variabili di collection

| Variabile | Default | Note |
|-----------|---------|------|
| `baseUrl` | `https://example.com/api/v1` | **Placeholder**: impostalo sull'host di produzione reale (path `<host>/api/v1`). |
| `rateLimitMaxAttempts` | `40` | Numero massimo di richieste prima di considerare fallito il test di rate limiting. |
| `corsOrigin` | `https://teamdigitale.github.io` | Origin usato nel preflight CORS. Allinealo a `CORS_ORIGIN` lato server se ristretto. |

## Esecuzione in Postman (UI)

1. Importa `Semantic Score Calculator.postman_collection.json`.
2. Imposta la variabile di collection `baseUrl` sull'URL di produzione.
3. I campi file delle richieste usano percorsi relativi (`fixtures/...`). Apri il **Collection Runner**
   e imposta la *working directory* su questa cartella (`apps/api/postman/`), oppure ri-seleziona
   manualmente i file in ciascuna richiesta.
4. Esegui la collection (Run) o le singole richieste (Send).

## Esecuzione con Newman (CLI)

```bash
# dalla root del repo
newman run "apps/api/postman/Semantic Score Calculator.postman_collection.json" \
  --working-dir apps/api/postman \
  --env-var baseUrl=https://<host-name>/api/v1
```

## Verifica in locale (consigliata prima di puntare a produzione)

```bash
cd apps/api
npm run start:dev          # API su http://localhost:3000/api/v1
```

Poi esegui con `baseUrl=http://localhost:3000/api/v1`. Note:

- I casi 1, 2, 3, 4, 5, 7 sono verificabili in locale.
- Il caso **6 (swagger)** in locale **fallisce** se `NODE_ENV` non è `production` (in dev la Swagger UI
  è attiva e risponde 200). Va verificato contro produzione, oppure avviando l'API con
  `NODE_ENV=production`.
- Il caso **8 (rate limiting)** invia molte richieste reali; in locale scatta col limite di default
  (15 richieste / 60s).
