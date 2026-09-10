export function getAdminToken() {
  const token = localStorage.getItem('adminToken');
  if (!token) return null;

  try {
    const segment = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedSegment = segment.padEnd(Math.ceil(segment.length / 4) * 4, '=');
    const payload = JSON.parse(atob(paddedSegment));
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem('adminToken');
      return null;
    }
    return token;
  } catch {
    localStorage.removeItem('adminToken');
    return null;
  }
}
