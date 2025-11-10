# Documento di Progettazione API

## Panoramica

L'API per il calcolo del semantic score è un servizio REST basato su **NestJS** che permette di calcolare il punteggio semantico di documenti OpenAPI 3.0. Il servizio analizza gli schemi presenti nel documento e valida le proprietà semantiche utilizzando un database **Virtuoso** tramite query SPARQL.

## Funzionalità Principali

### Calcolo Semantic Score

L'API espone un endpoint `POST /api/v1/semantic-score` che:

1. **Accetta** documenti OpenAPI 3.0 in formato YAML o JSON (dimensione massima: 1MB)
2. **Valida** la struttura del documento OpenAPI
3. **Analizza** i modelli di dati presenti in `#/components/schemas`
4. **Calcola** il semantic score per ogni modello basandosi sulle proprietà semantiche validate
5. **Restituisce** il documento originale arricchito con:
   - `#/info/x-semantic-score`: punteggio semantico globale (media dei punteggi dei modelli)
   - `#/info/x-semantic-score-timestamp`: timestamp del calcolo

### Integrazione con Virtuoso

L'API si connette a un database **Virtuoso** (un database RDF/SPARQL) per validare le proprietà semantiche dei modelli di dati. Il processo funziona così:

1. Per ogni modello di dati con `x-jsonld-context`, l'API estrae le proprietà definite
2. Le proprietà vengono validate contro il vocabolario semantico tramite query SPARQL
3. Il punteggio viene calcolato come rapporto tra proprietà semantiche valide e totale proprietà

La connessione a Virtuoso avviene tramite l'endpoint SPARQL configurato nella variabile d'ambiente `SPARQL_URL`.

### Rate Limiting

L'API implementa un sistema di **rate limiting** per proteggere il servizio da abusi:

- **Limite**: 15 richieste per finestra temporale (configurabile via `THROTTLE_LIMIT`)
- **Finestra temporale**: 60 secondi (configurabile via `THROTTLE_TTL`)
- **Risposta**: Status code `429 Too Many Requests` quando il limite viene superato

### Sicurezza

- **Helmet**: Middleware per la sicurezza HTTP
- **CORS**: Configurabile tramite variabile d'ambiente
- **Validazione input**: Validazione automatica dei documenti OpenAPI
- **Limite dimensione file**: Massimo 1MB per richiesta

## Configurazione

### Variabili d'Ambiente

| Variabile        | Descrizione                           | Default       | Obbligatoria |
| ---------------- | ------------------------------------- | ------------- | ------------ |
| `NODE_ENV`       | Ambiente di esecuzione                | `development` | No           |
| `PORT`           | Porta su cui ascoltare                | `3000`        | No           |
| `CORS_ORIGIN`    | Origini CORS consentite               | `*`           | No           |
| `THROTTLE_TTL`   | Finestra temporale rate limiting (ms) | `60000`       | No           |
| `THROTTLE_LIMIT` | Numero massimo richieste per finestra | `15`          | No           |
| `SPARQL_URL`     | URL endpoint SPARQL Virtuoso          | -             | **Sì**       |

### Esempio File `.env`

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://example.com
THROTTLE_TTL=60000
THROTTLE_LIMIT=15
SPARQL_URL=https://virtuoso.example.com/sparql
```

## Deployment

### Prerequisiti

- Node.js (versione compatibile con NestJS)
- Accesso a un endpoint SPARQL Virtuoso
- Variabili d'ambiente configurate

### Build e Avvio

Per il deployment in ambiente locale, vanno eseguiti i seguenti passaggi:

1. **Installazione dipendenze**:

   ```bash
   pnpm install
   ```

2. **Build dell'applicazione**:

   ```bash
   cd apps/api
   pnpm run build
   ```

3. **Avvio in produzione**:
   ```bash
   pnpm run start:prod
   ```

### Docker

L'applicazione può essere deployata utilizzando Docker. Assicurarsi di configurare le variabili d'ambiente nel container:

```bash
docker build --target api --tag api:latest .
```

```bash
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e SPARQL_URL=https://virtuoso.example.com/sparql \
  -e THROTTLE_LIMIT=15 \
  -e THROTTLE_TTL=60000 \
  api:latest
```

### Considerazioni per il Deployment

- **Virtuoso**: Assicurarsi che l'endpoint SPARQL sia accessibile dall'ambiente di deployment
- **Rate Limiting**: Regolare i parametri `THROTTLE_LIMIT` e `THROTTLE_TTL` in base al carico atteso
- **CORS**: Configurare `CORS_ORIGIN` con le origini effettive in produzione (evitare `*`)
- **Logging**: I log sono abilitati in produzione per il monitoraggio
- **Swagger**: La documentazione Swagger è disabilitata in produzione per sicurezza

## Endpoint

Una descrizione degli endpoint in formato OpenAPI è disponibile all'indirizzo /openapi.yaml

## Architettura

L'API è strutturata in moduli NestJS:

- **SemanticScoreModule**: Gestisce il calcolo del semantic score
- **HealthModule**: Fornisce l'endpoint di health check
- **ConfigModule**: Gestisce la configurazione e le variabili d'ambiente
- **ThrottlerModule**: Implementa il rate limiting

Il calcolo del semantic score utilizza la libreria `@teamdigitale/schema-editor-utils` che gestisce:

- La risoluzione dei riferimenti JSON-LD
- Le query SPARQL a Virtuoso
- Il calcolo del punteggio semantico
