const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY || 'b25b959554ed76058ac220b7b2e0a026';

const jsonFetch = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed: ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
};

export const searchItunesAlbums = async (term, limit = 25, country = 'US') => {
  const encoded = encodeURIComponent(term.trim());
  const url = `https://itunes.apple.com/search?term=${encoded}&entity=album&limit=${limit}&country=${country}`;
  const data = await jsonFetch(url);
  return (data.results || []).map((album) => ({
    ...album,
    releaseDate: album.releaseDate ? new Date(album.releaseDate) : null,
  }));
};

export const lookupItunesAlbumTracks = async (collectionId) => {
  const url = `https://itunes.apple.com/lookup?id=${collectionId}&entity=song`;
  const data = await jsonFetch(url);
  const items = data.results || [];
  const album = items.find((item) => item.wrapperType === 'collection');
  const tracks = items.filter((item) => item.wrapperType === 'track');
  return { album, tracks };
};

export const lastFmAlbumInfo = async (artist, album) => {
  const qs = new URLSearchParams({
    method: 'album.getinfo',
    api_key: LASTFM_API_KEY,
    artist,
    album,
    format: 'json',
  });
  const url = `https://ws.audioscrobbler.com/2.0/?${qs.toString()}`;
  const data = await jsonFetch(url);
  return data.album || null;
};

export const lastFmArtistSimilar = async (artist, limit = 10) => {
  const qs = new URLSearchParams({
    method: 'artist.getsimilar',
    api_key: LASTFM_API_KEY,
    artist,
    limit: String(limit),
    format: 'json',
  });
  const url = `https://ws.audioscrobbler.com/2.0/?${qs.toString()}`;
  const data = await jsonFetch(url);
  return (data.similarartists?.artist || []).map((a) => ({
    name: a.name,
    url: a.url,
    match: Number(a.match || 0),
    image: (a.image || []).find((img) => img.size === 'medium')?.['#text'] || '',
  }));
};

export const musicBrainzSearchRelease = async (artist, release, limit = 5) => {
  const qs = new URLSearchParams({
    query: `artist:${artist} AND release:${release}`,
    fmt: 'json',
    limit: String(limit),
  });
  const url = `https://musicbrainz.org/ws/2/release?${qs.toString()}`;
  const data = await jsonFetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'AlbumDiscoveryDashboard/1.0 (https://github.com/GitReapers/team-website)',
    },
  });
  return data.releases || [];
};

export const musicBrainzLookupRelease = async (mbid) => {
  const url = `https://musicbrainz.org/ws/2/release/${mbid}?fmt=json&inc=recordings+artist-credits+labels`;
  const data = await jsonFetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'AlbumDiscoveryDashboard/1.0 (https://github.com/GitReapers/team-website)',
    },
  });
  return data;
};
