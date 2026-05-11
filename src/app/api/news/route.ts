import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'borsa';
  
  // Google News RSS -> JSON
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=tr&gl=TR&ceid=TR:tr`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const res = await fetch(apiUrl, {
      next: { revalidate: 300 } // 5 dakika cache
    });

    if (!res.ok) {
      if (res.status === 429) {
        return NextResponse.json({ status: 'error', message: 'Rate limit' }, { status: 429 });
      }
      throw new Error(`News API failed: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('News Fetch Error:', error);
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}
