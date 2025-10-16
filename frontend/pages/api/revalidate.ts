import type { NextApiRequest, NextApiResponse } from 'next';

type RevalidateRequestBody = {
  path?: string;
  paths?: string[];
  serviceSlug?: string;
  serviceSlugs?: string[];
  locale?: 'ru' | 'en';
};

const DEFAULT_LOCALES: Array<'ru' | 'en'> = ['ru', 'en'];

function isAuthorized(req: NextApiRequest): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return false;

  const headerSecret = req.headers['x-revalidate-secret'];
  const auth = req.headers.authorization; // Bearer <token>

  if (typeof headerSecret === 'string' && headerSecret === secret) return true;
  if (Array.isArray(headerSecret) && headerSecret.includes(secret)) return true;
  if (auth && auth.startsWith('Bearer ') && auth.slice(7) === secret) return true;

  // Also allow query param for convenience (e.g., manual curl)
  if (typeof req.query.secret === 'string' && req.query.secret === secret) return true;

  return false;
}

function normalizePath(path: string): string {
  if (!path.startsWith('/')) return `/${path}`;
  return path;
}

function buildPathsFromBody(body: RevalidateRequestBody): string[] {
  const requestedLocale = body.locale && DEFAULT_LOCALES.includes(body.locale) ? body.locale : undefined;

  const addLocaleVariants = (p: string): string[] => {
    const base = normalizePath(p);
    // In Next.js i18n for Pages Router, default locale ('ru') is not prefixed.
    if (requestedLocale) {
      return requestedLocale === 'ru' ? [base] : [`/en${base}`];
    }
    return [base, `/en${base}`];
  };

  const paths: string[] = [];

  if (body.path) {
    paths.push(...addLocaleVariants(body.path));
  }
  if (Array.isArray(body.paths)) {
    for (const p of body.paths) paths.push(...addLocaleVariants(p));
  }
  if (body.serviceSlug) {
    const base = `/services/${body.serviceSlug}`;
    paths.push(...addLocaleVariants(base));
  }
  if (Array.isArray(body.serviceSlugs)) {
    for (const slug of body.serviceSlugs) paths.push(...addLocaleVariants(`/services/${slug}`));
  }

  // De-duplicate
  return Array.from(new Set(paths));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const body = (req.body || {}) as RevalidateRequestBody;
    const paths = buildPathsFromBody(body);

    if (paths.length === 0) {
      return res.status(400).json({ error: 'No paths or service slugs provided' });
    }

    const revalidated: string[] = [];
    const failed: Array<{ path: string; error: string }> = [];

    for (const p of paths) {
      try {
        await res.revalidate(p);
        revalidated.push(p);
      } catch (e: any) {
        failed.push({ path: p, error: e?.message || 'Unknown error' });
      }
    }

    const status = failed.length > 0 ? 207 : 200; // 207 Multi-Status if partial failure
    return res.status(status).json({ revalidated, failed });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Internal error' });
  }
}
