export async function onRequest(context) {
  const url = new URL(context.request.url);
  const stationId = url.pathname.replace('/api/realtime/', '');
  const externalUrl = `https://dataruido.mma.gob.cl/realtime?s=${stationId}`;

  const response = await fetch(externalUrl);
  const csv = await response.text();

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
