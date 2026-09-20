import { adminCorsHeaders } from '../../_db';
import { signToken, authenticateAdminRequest } from '../../_auth';
import { checkAdminAuthRateLimit, recordAdminAuthFailure, resetAdminAuthFailures } from '../../_rateLimit';

export async function onRequestOptions(context: { request: Request }) {
  return new Response(null, {
    status: 204,
    headers: adminCorsHeaders(context.request)
  });
}

export async function onRequestPost(context: { request: Request; env: Record<string, any> }) {
  const { request, env } = context;
  const headers = adminCorsHeaders(request);

  // 1. Check brute force rate limit (5 failed attempts per 5 mins per IP)
  const rateLimit = checkAdminAuthRateLimit(request, 5, 300000);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'تم تجاوز عدد محاولات الدخول المسموح بها، يرجى المحاولة بعد قليل'
      }),
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': String(rateLimit.retryAfter || 300)
        }
      }
    );
  }

  try {
    const rawBody = await request.text();
    let body: any = {};
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'طلب غير صالح (Invalid JSON)' }), {
          status: 400,
          headers
        });
      }
    }

    if (body.action === 'verify') {
      const isAuthed = await authenticateAdminRequest(request, env);
      return new Response(JSON.stringify({ success: isAuthed, valid: isAuthed }), {
        status: isAuthed ? 200 : 401,
        headers
      });
    }

    const expectedPassword = env?.ADMIN_PASSWORD;
    const secret = env?.ADMIN_SECRET;

    if (!expectedPassword || typeof expectedPassword !== 'string' || !expectedPassword.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'إعدادات المشرف غير مهيأة على الخادم' }), {
        status: 500,
        headers
      });
    }

    if (!secret || typeof secret !== 'string' || !secret.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'مفتاح المصادقة الأمني غير مهيأ على الخادم' }), {
        status: 500,
        headers
      });
    }

    const password = (body.password || '').trim();

    if (!password || password !== expectedPassword.trim()) {
      // Record failed attempt for rate limiting
      recordAdminAuthFailure(request, 300000);
      return new Response(JSON.stringify({ success: false, error: 'كلمة المرور غير صحيحة' }), {
        status: 401,
        headers
      });
    }

    // Reset failed attempts upon successful login
    resetAdminAuthFailures(request);

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const token = await signToken({ role: 'admin', exp: expiresAt }, secret.trim());

    return new Response(
      JSON.stringify({
        success: true,
        token,
        expiresAt
      }),
      {
        status: 200,
        headers
      }
    );
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'حدث خطأ أثناء معالجة الطلب' }), {
      status: 500,
      headers
    });
  }
}


