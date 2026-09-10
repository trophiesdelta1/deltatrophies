import { randomBytes } from 'node:crypto';

function slugBase(parts: (string | undefined)[]): string {
  return parts
    .filter((part): part is string => Boolean(part))
    .join('-')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 240);
}

export function createSlug(...parts: (string | undefined)[]): string {
  return `${slugBase(parts) || 'product'}-${randomBytes(4).toString('hex')}`;
}

export function updateSlug(currentSlug: string, ...parts: (string | undefined)[]): string {
  const currentSuffix = /-([a-f\d]{8})$/i.exec(currentSlug)?.[1];
  const suffix = currentSuffix ?? randomBytes(4).toString('hex');
  return `${slugBase(parts) || 'product'}-${suffix.toLowerCase()}`;
}
