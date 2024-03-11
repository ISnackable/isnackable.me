import type * as types from '@/lib/types';
import { search } from '@/lib/notion';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(
    searchParams
  ) as unknown as types.SearchParams;

  console.log('<<< lambda search-notion', params);
  const results = await search(params);
  console.log('>>> lambda search-notion', results);

  return Response.json(results, {
    status: 200,
    headers: {
      'Cache-Control':
        'public, s-maxage=60, max-age=60, stale-while-revalidate=60',
    },
  });
}
