/**
 * Convert a string to a URL-friendly slug.
 * "Louis Vuitton" → "louis-vuitton"
 * "Dolce & Gabbana" → "dolce-gabbana"
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")    // non-alphanum → hyphen
    .replace(/^-+|-+$/g, "")        // trim leading/trailing hyphens
}
