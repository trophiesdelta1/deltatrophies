const isVercelBuild = process.env.VERCEL === '1';

if (isVercelBuild) {
  const value = process.env.VITE_API_URL;
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Set VITE_API_URL to the public HTTPS backend origin in Vercel.');
  }

  if (
    url.protocol !== 'https:' ||
    !url.hostname ||
    ['localhost', '127.0.0.1'].includes(url.hostname) ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('VITE_API_URL must be a public HTTPS origin without /api or a path.');
  }
}
