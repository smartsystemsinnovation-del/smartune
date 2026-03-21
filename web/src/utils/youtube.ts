export async function fetchYouTubeSongs(genre?: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set');
  }

  // Use genre directly if provided, since it might have precise negative keywords (-mix, etc)
  let query = '';
  const antiMixSuffix = ' -"mix" -"playlist" -"enganchado" -"recopilacion" -"compilacion" -"álbum"';

  if (genre) {
    // If the genre is just a clean word (not containing "-mix"), append the anti-mix suffix
    query = genre.includes('-mix') ? genre : `${genre}${antiMixSuffix}`; 
  } else {
    // To absolutely guarantee famous songs, we randomize from a curated list of global superstars
    const famousArtists = [
      'Ed Sheeran official video',
      'AC/DC official video',
      'Marshmello official video',
      'Dua Lipa official video',
      'The Weeknd official video',
      'Coldplay official video',
      'Bruno Mars official video',
      'Eminem official video',
      'Rihanna official video',
      'Katy Perry official video',
      'Imagine Dragons official video',
      'Shawn Mendes official video',
      'Billie Eilish official video',
      'Justin Bieber official video',
      'Ariana Grande official video',
      'Bad Bunny official video',
      'Shakira official video'
    ];
    query = `${famousArtists[Math.floor(Math.random() * famousArtists.length)]}${antiMixSuffix}`;
  }
  
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${apiKey}`;

  console.log('DEBUG: Fetching YouTube songs from:', url.replace(apiKey, 'HIDDEN'));

  const response = await fetch(url);
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('YouTube API Error:', errorBody);
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();
  
  let songs = (data.items || []).map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    coverUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    previewUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
  }));

  // Global post-fetch filtering to ensure no stray mixes slip through on ANY endpoint (MusicSwipe, Dashboard, etc)
  songs = songs.filter((song: any) => {
    const title = (song.title || '').toLowerCase();
    return !title.includes('mix') && 
           !title.includes('playlist') && 
           !title.includes('enganchado') &&
           !title.includes('album');
  });

  return songs;
}
