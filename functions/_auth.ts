export async function signToken(payload: Record<string, any>, secret: string): Promise<string> {
  if (!secret || typeof secret !== 'string' || !secret.trim()) {
    throw new Error('ADMIN_SECRET environment variable is not configured');
  }

  const enc = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const body = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const data = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret.trim()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${data}.${sigBase64}`;
}

export async function verifyToken(token: string, secret: string): Promise<Record<string, any> | null> {
  try {
    if (!token || typeof token !== 'string') return null;
    if (!secret || typeof secret !== 'string' || !secret.trim()) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, sig] = parts;
    const data = `${header}.${body}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret.trim()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const binarySig = Uint8Array.from(
      atob(sig.replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify('HMAC', key, binarySig, enc.encode(data));
    if (!isValid) return null;

    const payload = JSON.parse(atob(body));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

export async function authenticateAdminRequest(request: Request, env?: Record<string, any>): Promise<boolean> {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  const secret = env?.ADMIN_SECRET;
  if (!secret || typeof secret !== 'string' || !secret.trim()) {
    return false;
  }

  const verified = await verifyToken(token, secret);
  return !!(verified && verified.role === 'admin');
}

