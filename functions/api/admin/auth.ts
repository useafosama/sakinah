import { corsHeaders } from '../../_db';
import { signToken, authenticateAdminRequest } from '../../_auth';

const DEFAULT_ADMIN_PASSWORD = 'sakinah_admin_2026';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

export async function onRequestPost(context: { request: Request; env: Record<string, any> }) {
  const { request, env } = context;

  try {
    const body = await request.json() as any;

    if (body.action === 'verify') {
      const isAuthed = await authenticateAdminRequest(request, env);
      return new Response(JSON.stringify({ success: isAuthed, valid: isAuthed }), {
        status: isAuthed ? 200 : 401,
        headers: corsHeaders()
      });
    }

    const password = (body.password || '').trim();
    const expectedPassword = (env && env.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;

    if (!password || password !== expectedPassword) {
      return new Response(JSON.stringify({ success: false, error: 'كلمة المرور غير صحيحة' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    const secret = (env && env.ADMIN_SECRET) || undefined;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const token = await signToken({ role: 'admin', exp: expiresAt }, secret);

    return new Response(
      JSON.stringify({
        success: true,
        token,
        expiresAt
      }),
      {
        status: 200,
        headers: corsHeaders()
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: corsHeaders()
    });
  }
}
