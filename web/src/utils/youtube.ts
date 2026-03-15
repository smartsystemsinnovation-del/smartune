export async function fetchYouTubeSongs(genre?: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set');
  }

  // Enhanced search queries for better variety
  const randomKeywords = ['vibes', '2024', 'remix', 'playlist', 'bass', 'hits', 'dynamic', 'session'];
  const extraKeyword = randomKeywords[Math.floor(Math.random() * randomKeywords.length)];

  let query = '';
  if (genre) {
    query = `${genre} ${extraKeyword} music`;
  } else {
    const queries = ['electronic music', 'phonk music', 'pop hits mix', 'future bass'];
    query = `${queries[Math.floor(Math.random() * queries.length)]} ${extraKeyword}`;
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
  
  const songs = (data.items || []).map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    coverUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    previewUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
  }));

  return songs;
}
