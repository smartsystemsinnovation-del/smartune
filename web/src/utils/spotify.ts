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
  
  // We use track seeds which are more reliable than genre seeds in some regions/accounts
  // Let's use some popular high-energy track IDs as seeds (Hardstyle/Electronic)
  const seedTracks = '49U7p2u1iF6KjX0T76L0E9,6088m9Ynu996oxpY9WqYid'; // Tevvez Tracks
  const url = `https://api.spotify.com/v1/recommendations?limit=50&seed_tracks=${seedTracks}&min_energy=0.6`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Spotify API Error:', errorData);
    throw new Error('Failed to fetch songs from Spotify');
  }

  const data = await response.json();
  
  // Filter for tracks with preview_url and map to simpler format
  const tracks = data.tracks
    .filter((track: any) => track.preview_url !== null)
    .map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      coverUrl: track.album.images[0]?.url,
      previewUrl: track.preview_url,
    }));

  return tracks;
}
