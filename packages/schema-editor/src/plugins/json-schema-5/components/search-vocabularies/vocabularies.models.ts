/**
 * Types derived from the Controlled Vocabularies API OpenAPI 3.0 schema
 * (schema names match `components.schemas` where applicable).
 */

/** `AsciiText` — path segment id (agency / key concept). */
export type AsciiText = string;

/** `TextFilter` — query string filters on metadata fields. */
export type TextFilter = string;

/** `LanguageTagShort` — ISO 639-1 two-letter code. */
export type LanguageTagShort = string;

/** `TitleString` — short human-readable title (incl. newlines per schema). */
export type TitleString = string;

/** `URI` — absolute URI string. */
export type URI = string;

/** `Url` — absolute or relative URI reference. */
export type Url = string;

/** `Limit` — pagination page size (0–200, default 20 in schema). */
export type Limit = number;

/** `Offset` — pagination offset (0–100000). */
export type Offset = number;

/** int32 headers and numeric fields from the API. */
export type Int32 = number;

export interface Link {
  href: URI;
}

export type ServiceDescriptionMediaType = 'application/openapi+yaml' | 'application/openapi+json';

export interface ServiceDescription {
  href: URI;
  type: ServiceDescriptionMediaType;
}

export type ServiceMetaMediaType = 'application/ld+json';

export interface ServiceMeta {
  href: URI;
  type: ServiceMetaMediaType;
}

/**
 * `APIDistribution` — one vocabulary API entry in RFC 9727 linkset format
 * (property names match JSON from the API).
 * Required: about, href, title, author, description.
 */
export interface APIDistribution {
  /** @deprecated */
  _concept?: TitleString;
  /** @deprecated */
  _vocabulary_type?: URI;
  about: URI;
  author: URI;
  description: string;
  href: URI;
  hreflang: LanguageTagShort[];
  'predecessor-version': Link[];
  'service-desc': ServiceDescription[];
  'service-meta': ServiceMeta[];
  title: TitleString;
  version?: string;
}

/**
 * `APICatalog` — catalog block with distributions and pagination.
 * Required: api-catalog, item.
 */
export interface APICatalog {
  anchor?: URI;
  'api-catalog': URI;
  count?: Limit;
  item: APIDistribution[];
  limit?: Limit;
  offset?: Offset;
  total_count?: Offset;
}

/** `Linkset` — root of `application/linkset+json` for catalog listing. */
export interface Linkset {
  linkset: APICatalog[];
}

export interface ItemUriRef {
  uri: Url;
}

/**
 * `Item` — base vocabulary concept row (extended per-vocabulary in sub-OAS).
 * Required: id, label, uri.
 */
export interface Item {
  href?: URI;
  id: string;
  label: string;
  parent?: ItemUriRef[];
  uri: Url;
  vocab?: ItemUriRef[];
}

/**
 * `PaginatedResponse` — paged list of vocabulary items.
 */
export interface PaginatedResponse {
  items?: Item[];
  limit?: Limit;
  offset?: Offset;
  totalResults?: Offset;
}

/**
 * `Problem` — RFC 9457 problem details (`application/problem+json`).
 * Required: title, status (per this schema; `type` optional with default).
 */
export interface Problem {
  detail?: string;
  instance?: Url;
  status: Int32;
  title: string;
  type?: URI;
}

/** Binary dump body (`application/octet-stream`). */
export type DumpResponse = Blob | ArrayBuffer;

/** ---------------------------------------------------------------------- */
/** Common response headers (components + path responses).               */
/** ---------------------------------------------------------------------- */

export interface CacheControlHeader {
  'Cache-Control'?: string;
}

export interface RetryAfterHeader {
  'Retry-After'?: Int32;
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit'?: Int32;
  'X-RateLimit-Remaining'?: Int32;
  'X-RateLimit-Reset'?: Int32;
}

export type VocabulariesSuccessHeaders = CacheControlHeader & RateLimitHeaders;

export type VocabulariesErrorHeaders = RetryAfterHeader & Partial<RateLimitHeaders>;

/** ---------------------------------------------------------------------- */
/** Query parameters (GET /vocabularies, GET /vocabularies/{agencyId}).      */
/** ---------------------------------------------------------------------- */

export interface VocabularyCatalogQueryParams {
  limit?: Limit;
  offset?: Offset;
  q?: TextFilter;
}

/** Path + query for agency-scoped catalog list. */
export interface VocabularyCatalogByAgencyParams extends VocabularyCatalogQueryParams {
  agencyId: AsciiText;
}

/** ---------------------------------------------------------------------- */
/** Query parameters (GET /vocabularies/{agencyId}/{keyConcept} items).   */
/** ---------------------------------------------------------------------- */

export interface VocabularyItemsQueryParams {
  limit?: Limit;
  /** Cursor = last item `id` from previous page. */
  cursor?: string;
  label?: TextFilter;
}

export interface VocabularyAgencyKeyPathParams {
  agencyId: AsciiText;
  keyConcept: AsciiText;
}

export interface VocabularyItemByIdPathParams extends VocabularyAgencyKeyPathParams {
  id: string;
}
