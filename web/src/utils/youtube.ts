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
    const randomKeywords = ['vibes 2024', 'hits', 'session', 'official video', 'videoclip oficial'];
    const extraKeyword = randomKeywords[Math.floor(Math.random() * randomKeywords.length)];
    const queries = ['pop', 'rock', 'hip hop', 'electronic', 'R&B'];
    query = `${queries[Math.floor(Math.random() * queries.length)]} ${extraKeyword}${antiMixSuffix}`;
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
