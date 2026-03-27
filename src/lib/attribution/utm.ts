/**
 * UTM Parameter Parsing
 * Extracts UTM parameters from URL search params.
 */

export interface UTMParams {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/**
 * Parse UTM parameters from a URL or URLSearchParams.
 * Returns null values for missing params (not undefined).
 */
export function parseUTM(url: URL | URLSearchParams): UTMParams {
  const params = 'searchParams' in url ? url.searchParams : url;

  return {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    term: params.get("utm_term"),
    content: params.get("utm_content"),
  };
}

/**
 * Check if the URL contains any UTM parameters.
 */
export function hasUTMParams(url: URL | URLSearchParams): boolean {
  const params = 'searchParams' in url ? url.searchParams : url;
  return UTM_KEYS.some((key) => params.has(key));
}
