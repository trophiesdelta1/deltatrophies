const getImageUrl = (path) => {
  if (!path) return null;

  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }

  const apiOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiOrigin}${normalizedPath}`;
};

export const getOptimizedImageUrl = (
  path,
  { width, height, quality = 'auto:best' } = {},
) => {
  const originalUrl = getImageUrl(path);
  if (!originalUrl || !/^https:\/\/res\.cloudinary\.com\//i.test(originalUrl)) {
    return originalUrl;
  }

  const uploadMarker = '/image/upload/';
  if (!originalUrl.includes(uploadMarker)) return originalUrl;

  const transformation = [
    'c_limit',
    'f_auto',
    'fl_progressive',
    `q_${quality}`,
    Number.isInteger(width) && width > 0 ? `w_${width}` : null,
    Number.isInteger(height) && height > 0 ? `h_${height}` : null,
  ]
    .filter(Boolean)
    .join(',');

  return originalUrl.replace(uploadMarker, `${uploadMarker}${transformation}/`);
};

export default getImageUrl;
