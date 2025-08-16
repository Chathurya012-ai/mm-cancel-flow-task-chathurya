// Utility to get API URL based on window.origin
export function apiUrl(path: string): string {
  if (typeof window !== 'undefined' && window.origin.startsWith('http')) {
    return path;
  }
  return `http://localhost:3000${path.startsWith('/') ? path : '/' + path}`;
}
