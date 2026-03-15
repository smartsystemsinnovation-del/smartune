export async function fetchYouTubeSongs(genre?: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set');
  }

  // Search queries for the desired genres
  let query = '';
  if (genre) {
    query = `${genre} music mix`;
  } else {
    const queries = ['electronic music mix', 'phonk music mix', 'pop hits 2024'];
    query = queries[Math.floor(Math.random() * queries.length)];
  }
  
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${apiKey}`;

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
