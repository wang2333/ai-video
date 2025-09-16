export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// Basic private-network protection to avoid SSRF risks
function isPrivateHost(hostname: string) {
  // Block localhost and common private ranges
  if (!hostname) return true;
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower.endsWith('.localhost')) return true;
  if (lower === '127.0.0.1' || lower.startsWith('127.')) return true;
  if (lower === '0.0.0.0') return true;
  if (lower.endsWith('.local')) return true;
  // Simple IPv4 checks
  if (/^10\./.test(lower)) return true;
  if (/^192\.168\./.test(lower)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(lower)) return true;
  if (/^169\.254\./.test(lower)) return true;
  return false;
}

function getAllowedHostnames(): string[] {
  const raw = process.env.VIDEO_PROXY_ALLOWLIST || '';
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.toLowerCase());
}

function isHostAllowed(host: string) {
  const allow = getAllowedHostnames();
  if (!allow.length) return !isPrivateHost(host); // fallback: allow public hosts
  const h = host.toLowerCase();
  return allow.some(allowed =>
    h === allowed || h.endsWith(`.${allowed}`)
  );
}

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade'
]);

function copyHeaders(from: Headers, to: Headers) {
  from.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    // Avoid overriding set-cookie across origins
    if (key.toLowerCase() === 'set-cookie') return;
    to.set(key, value);
  });
}

async function handleProxy(req: NextRequest, method: 'GET' | 'HEAD') {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: '无效的 url' }, { status: 400 });
  }

  if (!/^https?:$/.test(target.protocol)) {
    return NextResponse.json({ error: '仅支持 http/https' }, { status: 400 });
  }

  if (!isHostAllowed(target.hostname)) {
    return NextResponse.json({ error: '目标主机不被允许' }, { status: 403 });
  }

  // Build request headers: forward Range and minimal identity headers
  const outHeaders: Record<string, string> = {};
  const range = req.headers.get('range');
  if (range) outHeaders['range'] = range;

  // Optional spoof headers to satisfy CDNs that require them
  const defaultUA =
    process.env.VIDEO_PROXY_USER_AGENT ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
  outHeaders['user-agent'] = req.headers.get('user-agent') || defaultUA;

  const refererOverride = process.env.VIDEO_PROXY_REFERER;
  if (refererOverride) {
    outHeaders['referer'] = refererOverride;
  } else if (req.headers.get('referer')) {
    // Some hosts require a referer; forwarding same-origin referer is often fine
    outHeaders['referer'] = req.headers.get('referer') as string;
  }

  // Forward Accept to help content negotiation, but avoid compression issues
  const accept = req.headers.get('accept');
  if (accept) outHeaders['accept'] = accept;

  // Perform upstream request
  const upstream = await fetch(target.toString(), {
    method,
    headers: outHeaders,
    redirect: 'follow'
  });

  if (!upstream.ok && upstream.status !== 206) {
    // Surface upstream error for easier debugging
    const text = await upstream.text().catch(() => '');
    return NextResponse.json(
      {
        error: `上游返回错误: ${upstream.status}`,
        detail: text?.slice(0, 1000)
      },
      { status: upstream.status }
    );
  }

  // Prepare response with streamed body and preserved headers
  const resHeaders = new Headers();
  copyHeaders(upstream.headers, resHeaders);

  // Ensure CORS exposure if needed in client JS (not strictly required for <video> same-origin)
  resHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges');

  // Prevent Next/Vercel edge from caching if not desired
  if (!resHeaders.has('cache-control')) {
    resHeaders.set('cache-control', 'public, max-age=0, s-maxage=0, must-revalidate');
  }

  return new NextResponse(method === 'HEAD' ? null : (upstream as any).body, {
    status: upstream.status,
    headers: resHeaders
  });
}

export async function GET(req: NextRequest) {
  return handleProxy(req, 'GET');
}

export async function HEAD(req: NextRequest) {
  return handleProxy(req, 'HEAD');
}

