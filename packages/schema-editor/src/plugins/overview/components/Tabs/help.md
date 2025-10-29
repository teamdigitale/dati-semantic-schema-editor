###### 🇮🇹 ITALIAN

Questa applicazione visualizza i tuoi schemi dati (modelli) in formato OpenAPI interrogando i dati presenti su <https://schema.gov.it>.
Insieme al [validatore OpenAPI](https://italia.github.io/api-oas-checker/) supporta
la progettazione di API conformi al Modello di Interoperablità.

L'applicazione mostra:

- le informazioni sintattiche specificate
  in formato [OpenAPI 3.0](https://spec.openapis.org/oas/v3.0.3.html) (JSON Schema Wright Draft 00) quali
  il tipo sintattico (`string`, `number`, `object`, `array`, etc.) la lunghezza massima, minima, i valori o le espressioni regolari ammesse, etc;
- le informazioni semantiche in formato
  [JSON-LD](https://spec.openapis.org/oas/v3.0.3.html)
  come
  la descrizione([`rdfs:comment`](https://www.w3.org/2000/01/rdf-schema#comment)),
  il titolo ([`rdfs:label`](https://www.w3.org/2000/01/rdf-schema#label)),
  i vincoli legati alle classi semantiche
  ([`rdfs:Class`](https://www.w3.org/2000/01/rdf-schema#Class) / [`owl:Class`](https://www.w3.org/2002/07/owl#Class))
  e al dominio applicativo ([`rdfs:domain`](https://www.w3.org/2000/01/rdf-schema#domain), [`rdfs:range`](https://www.w3.org/2000/01/rdf-schema#range)).

Puoi aprire uno schema OpenAPI in formato JSON o YAML:

- incollando direttamente il contenuto nell'editor;
- trascinando un file sul pannello dell'editor;
- indicando nella barra degli indirizzi l'url del file da aprire.

Apporta le modifiche direttamente nell'editor,
quindi usa l'Action menu per
scaricarle localmente
o condividerle via web.

Usa `CTRL+Space` per attivare l'auto-completamento
delle parole chiave OpenAPI
(incluse quelle semantiche: `x-jsonld-type` e `x-jsonld-context`)
e degli URI delle classi semantiche principali.

L'editor supporta le seguenti scorciatoie da tastiera:

- `CTRL+F` cerca nel testo;
- `CTRL+H` sostituisci nel testo;
- `ALT+E` vai al prossimo errore.

###### 🇬🇧 ENGLISH

This application displays your data schemas (models) in OpenAPI format by querying the data on <https://schema.gov.it>.
Together with the [OpenAPI validator](https://italia.github.io/api-oas-checker/) it supports
the design of APIs compliant with the Italian Interoperability Model.

The application shows:

- the syntactic information specified
  in [OpenAPI 3.0](https://spec.openapis.org/oas/v3.0.3.html) format (JSON Schema Wright Draft 00)
  such as the syntactic type (`string`, `number`, `object`, `array`, etc.), the maximum and minimum length, the allowed values or regular expressions, etc;
- the semantic information in JSON-LD format
  like
  the description([`rdfs:comment`](https://www.w3.org/2000/01/rdf-schema#comment)),
  the title([`rdfs:label`](https://www.w3.org/2000/01/rdf-schema#label)),
  the constraints related to the semantic classes
  ( [`rdfs:Class`](https://www.w3.org/2000/01/rdf-schema#Class) / [`owl:Class`](https://www.w3.org/2002/07/owl#Class)) and to the application domain (`rdfs:domain`, `rdfs:range`).

You can open an OpenAPI schema in JSON or YAML format:

- by pasting the content directly into the editor;
- by dragging a file onto the editor panel;
- by entering the file's URL in the address bar.

Make changes directly in the editor,
then use the Action menu to
download them locally
or share them online.

Use `CTRL+Space` to activate the automatic completion
of OpenAPI keywords
and the URIs of the main semantic classes.

The editor supports the following keyboard shortcuts:

- `CTRL+F` search in the text;
- `CTRL+H` replace in the text;
- `ALT+E` go to the next error.
