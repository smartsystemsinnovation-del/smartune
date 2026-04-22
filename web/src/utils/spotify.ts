export async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials are not set in environment variables');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Spotify access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function fetchSpotifySongs() {
  const token = await getSpotifyAccessToken();
  
  const rawQuery = process.env.SPOTIFY_DEFAULT_QUERY || 'top hits global';
  const query = encodeURIComponent(rawQuery);
  const url = `https://api.spotify.com/v1/search?q=${query}&type=track`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorBody = await response.text();
    // Eliminar log de debug (Fase 1.8)
    throw new Error(`Spotify API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Filter for tracks with preview_url
  let tracks = (data.tracks?.items || [])
    .filter((track: any) => track.preview_url !== null)
    .map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      coverUrl: track.album?.images[0]?.url || '',
      previewUrl: track.preview_url,
    }));

  // Eliminar log de debug (Fase 1.8)
  
  return tracks;
}
