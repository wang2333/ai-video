export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAllowedUrl(urlStr: string) {
  try {
    const u = new URL(urlStr);
    if (!(u.protocol === 'http:' || u.protocol === 'https:')) return false;
    // 仅允许代理七牛测试域名，避免被滥用
    const host = u.hostname.toLowerCase();
    return host.includes('clouddn.com') || host.includes('qiniudn.com');
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');
  if (!targetUrl) return new Response('Missing url', { status: 400 });
  if (!isAllowedUrl(targetUrl)) return new Response('Forbidden url', { status: 403 });

  const range = req.headers.get('range') || undefined;

  try {
    const upstream = await fetch(targetUrl, {
      // 不透传 Referer/Origin，规避防盗链
      headers: {
        ...(range ? { Range: range } : {}),
        'Accept-Encoding': 'identity',
      },
    });

    const headers = new Headers();
    // 透传与媒体播放相关的关键响应头
    const pass = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'last-modified',
      'etag',
      'cache-control',
    ];
    for (const k of pass) {
      const v = upstream.headers.get(k);
      if (v) headers.set(k, v);
    }
    // 便于前端读取范围信息
    headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range');

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  } catch (e) {
    return new Response('Upstream fetch failed', { status: 502 });
  }
}

