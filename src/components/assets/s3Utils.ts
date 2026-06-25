/**
 * Utility functions for handling S3 keys and URLs
 */

export function extractS3Key(url: string): string {
  if (!url.startsWith("http")) {
    return url
  }

  const pathOnly = url.split("?")[0]

  const bucketPattern = /\/assets\/(.*)/
  const match = pathOnly.match(bucketPattern)

  if (match && match[1]) {
    return match[1]
  }

  const parts = pathOnly.split("/")
  const assetsIndex = parts.indexOf("assets")

  if (assetsIndex !== -1 && assetsIndex < parts.length - 1) {
    return parts.slice(assetsIndex + 1).join("/")
  }

  return url
}

/**
 * Returns the key of a server-side resized variant of an asset.
 * The backend exposes resized images under `_resized/{width}/{originalKey}`,
 * letting us request e.g. an 800px-wide image instead of the full-resolution one.
 */
export function resizedS3Key(key: string, width: number): string {
  if (!key) return key
  if (key.startsWith("_resized/")) return key
  return `_resized/${width}/${key}`
}
