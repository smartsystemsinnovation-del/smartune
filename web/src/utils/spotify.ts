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
  
  // REMOVING LIMIT COMPLETELY - Spotify defaults to 20
  const query = encodeURIComponent(`hardstyle workout`);
  const url = `https://api.spotify.com/v1/search?q=${query}&type=track`;

  console.log('DEBUG: EXTREME MINIMAL URL:', url);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`DEBUG: Spotify API FAILED [${response.status}]`, errorBody);
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

  console.log(`DEBUG: SUCCESS. Found ${tracks.length} tracks with previews.`);
  
  return tracks;
}
