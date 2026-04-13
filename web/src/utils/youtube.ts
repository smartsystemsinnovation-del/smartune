const MASTER_FALLBACK = [
  { id: 'orJSJGHjBLI', title: 'Ed Sheeran - Bad Habits [Official Video]', artist: 'Ed Sheeran', coverUrl: 'https://i.ytimg.com/vi/orJSJGHjBLI/hqdefault.jpg', previewUrl: 'https://www.youtube.com/watch?v=orJSJGHjBLI' },
  { id: 'V7mY79_Vf8U', title: 'Dua Lipa - Training Season (Official Video)', artist: 'Dua Lipa', coverUrl: 'https://i.ytimg.com/vi/V7mY79_Vf8U/hqdefault.jpg', previewUrl: 'https://www.youtube.com/watch?v=V7mY79_Vf8U' },
  { id: '4NRXx6U8ABQ', title: 'The Weeknd - Blinding Lights (Official Music Video)', artist: 'The Weeknd', coverUrl: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg', previewUrl: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ' },
  { id: 'H5v3kku4y6Q', title: 'Harry Styles - As It Was (Official Video)', artist: 'Harry Styles', coverUrl: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg', previewUrl: 'https://www.youtube.com/watch?v=H5v3kku4y6Q' },
  { id: 'G7KNmW9a75Y', title: 'Miley Cyrus - Flowers (Official Video)', artist: 'Miley Cyrus', coverUrl: 'https://i.ytimg.com/vi/G7KNmW9a75Y/hqdefault.jpg', previewUrl: 'https://www.youtube.com/watch?v=G7KNmW9a75Y' },
  { id: 'ic8j13piAhQ', title: 'Taylor Swift - Cruel Summer (Official Audio)', artist: 'Taylor Swift', coverUrl: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg', previewUrl: 'https://www.youtube.com/watch?v=ic8j13piAhQ' },
  { id: 'Xq_reL_tCis', title: 'Bad Bunny - MONACO (Official Video)', artist: 'Bad Bunny', coverUrl: 'https://i.ytimg.com/vi/Xq_reL_tCis/hqdefault.jpg', previewUrl: 'https://www.youtube.com/watch?v=Xq_reL_tCis' },
  { id: 'CocEMW6N65Q', title: 'Shakira || BZRP Music Sessions #53', artist: 'Bizarrap', coverUrl: 'https://i.ytimg.com/vi/CocEMW6N65Q/hqdefault.jpg', previewUrl: 'https://www.youtube.com/watch?v=CocEMW6N65Q' }
];

export async function fetchYouTubeSongs(genre?: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YOUTUBE_API_KEY is not set. Using MASTER_FALLBACK.');
    return MASTER_FALLBACK;
  }

  // Use genre directly if provided, since it might have precise negative keywords (-mix, etc)
  let query = '';
  const antiMixSuffix = ' -"mix" -"playlist" -"enganchado" -"recopilacion" -"compilacion" -"álbum"';

  if (genre) {
    // If the genre is just a clean word (not containing "-mix"), append the anti-mix suffix
    query = genre.includes('-mix') ? genre : `${genre} "official video" ${antiMixSuffix}`; 
  } else {
    // We have a master array of global, unmistakable superstars
    const stars = [
      '"Ed Sheeran"', '"AC/DC"', '"Dua Lipa"', '"The Weeknd"', 
      '"Bruno Mars"', '"Eminem"', '"Rihanna"', '"Katy Perry"', 
      '"Imagine Dragons"', '"Billie Eilish"', '"Justin Bieber"', 
      '"Ariana Grande"', '"Bad Bunny"', '"Shakira"', '"Coldplay"', 
      '"Maroon 5"', '"Post Malone"', '"Drake"', '"Taylor Swift"',
      '"Harry Styles"', '"Miley Cyrus"', '"Lady Gaga"', '"Avicii"'
    ];
    
    // Pick 4 distinct random stars to mix them up
    const shuffled = stars.sort(() => 0.5 - Math.random());
    const selectedStars = shuffled.slice(0, 4);

    // Create a boolean OR query for YouTube: ("Artist 1" | "Artist 2" | "Artist 3") "official video" -mix...
    query = `(${selectedStars.join(' | ')}) "official video"${antiMixSuffix}`;
  }
  
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${apiKey}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('YouTube API Error:', errorBody);
      
      // If quota exceeded (403), return MASTER_FALLBACK instead of crashing
      if (response.status === 403) {
        console.warn('YouTube Quota Exceeded. Using MASTER_FALLBACK.');
        return MASTER_FALLBACK;
      }
      
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

    // Global post-fetch filtering
    songs = songs.filter((song: any) => {
      const title = (song.title || '').toLowerCase();
      return !title.includes('mix') && 
             !title.includes('playlist') && 
             !title.includes('enganchado') &&
             !title.includes('album');
    });

    return songs.length > 0 ? songs : MASTER_FALLBACK;
  } catch (err) {
    console.error('YouTube Fetch Failure:', err);
    return MASTER_FALLBACK;
  }
}
