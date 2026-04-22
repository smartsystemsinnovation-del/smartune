export async function getLandingStats() {
  try {
    const res = await fetch('/api/public/stats');
    if (!res.ok) return { topInstrumentos: [], topEnsenanzas: [] };
    return await res.json();
  } catch (error) {
    console.error('Error fetching landing stats:', error);
    return { topInstrumentos: [], topEnsenanzas: [] };
  }
}

export async function getLandingReleases() {
  try {
    const res = await fetch('/api/public/releases');
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching landing releases:', error);
    return [];
  }
}
