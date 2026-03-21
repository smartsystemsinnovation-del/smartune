import { NextResponse } from 'next/server';

export async function GET() {
  // To perfectly match the Figma design and guarantee UI integrity during the MVP,
  // we return the exact mock categories and hashtags defined in the user's reference image.
  // In a future production environment, this would query a 'tendencias' table or scan post content.
  const figmaTags = [
    { category: 'Music • Trending', name: 'HyperpopVibes', posts: '2.4k' },
    { category: 'Education • Trending', name: 'Synthesizer Masterclass', posts: '1.8k' },
    { category: 'Events • Trending', name: 'SmarTune Fest 2024', posts: '890' }
  ];

  return NextResponse.json({ success: true, data: figmaTags });
}
