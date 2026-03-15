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
  
  // Using both tracks and genres for better hit rate
  const seedTracks = '49U7p2u1iF6KjX0T76L0E9,6088m9Ynu996oxpY9WqYid';
  const seedGenresArr = 'workout,gaming,edm';
  const url = `https://api.spotify.com/v1/recommendations?limit=50&seed_tracks=${seedTracks}&seed_genres=${seedGenresArr}&min_energy=0.4`;

  console.log('Fetching Spotify recommendations from:', url);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Spotify API Error Response:', errorBody);
    throw new Error(`Spotify API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`Found ${data.tracks?.length || 0} tracks from Spotify API`);
  
  // Filter for tracks with preview_url and map to simpler format
  const tracks = (data.tracks || [])
    .filter((track: any) => track.preview_url !== null)
    .map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      coverUrl: track.album?.images[0]?.url || '',
      previewUrl: track.preview_url,
    }));

  console.log(`Returning ${tracks.length} tracks with previews`);
  return tracks;
}
