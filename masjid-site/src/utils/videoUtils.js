// ============================================
// Your original getEmbedSrc (preserved and improved)
// ============================================
export function getEmbedSrc(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    // youtube.com/watch?v=VIDEO_ID
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    // youtu.be/VIDEO_ID
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    // vimeo.com/ID
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    // already an embed or player URL
    if (url.includes("embed") || url.includes("player")) return url;
    return null;
  } catch (e) {
    return null;
  }
}

// ============================================
// NEW helper functions (for thumbnails, card display)
// ============================================

/**
 * Extract YouTube video ID from any YouTube URL
 */
export function getYouTubeId(url) {
  if (!url) return null;
  // Handle common YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
    /(?:youtube\.com\/embed\/)([\w-]+)/,
    /(?:youtube\.com\/v\/)([\w-]+)/,
    /(?:youtube\.com\/shorts\/)([\w-]+)/,
    /(?:youtube\.com\/live\/)([\w-]+)/,
    /youtube\.com\/.*[?&]v=([\w-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

/**
 * Get YouTube thumbnail URL (highest quality available)
 */
export function getYouTubeThumbnail(url, quality = "maxresdefault") {
  const id = getYouTubeId(url);
  if (!id) return null;
  // Fallback chain: maxresdefault -> hqdefault -> mqdefault
  return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
}

/**
 * Get best available thumbnail URL with automatic fallback
 */
export async function getBestThumbnail(url) {
  const id = getYouTubeId(url);
  if (!id) return null;
  
  const qualities = ["maxresdefault", "hqdefault", "mqdefault"];
  for (const quality of qualities) {
    const imgUrl = `https://img.youtube.com/vi/${id}/${quality}.jpg`;
    try {
      const response = await fetch(imgUrl, { method: "HEAD" });
      if (response.ok) return imgUrl;
    } catch {
      continue;
    }
  }
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`; // fallback
}