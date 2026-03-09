import { useEffect, useState } from 'react';
import { lastFmAlbumInfo, lastFmArtistSimilar, lookupItunesAlbumTracks, musicBrainzSearchRelease } from '../utils/api';

export default function AlbumDetailModal({ album, onClose }) {
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState([]);
  const [tags, setTags] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [releaseInfo, setReleaseInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!album) return;

    setLoading(true);
    setError(null);
    setTracks([]);
    setTags([]);
    setSimilar([]);
    setReleaseInfo(null);

    const fetchAll = async () => {
      try {
        const [{ tracks: itunesTracks }, lastfm, similarArtists, mbReleases] = await Promise.all([
          lookupItunesAlbumTracks(album.collectionId),
          lastFmAlbumInfo(album.artistName, album.collectionName),
          lastFmArtistSimilar(album.artistName, 8),
          musicBrainzSearchRelease(album.artistName, album.collectionName, 3),
        ]);

        setTracks(itunesTracks);
        setTags((lastfm?.tags?.tag || []).map((t) => ({ name: t.name, count: Number(t.count) || 0 })));
        setSimilar(similarArtists);
        setReleaseInfo(mbReleases[0] || null);
      } catch (err) {
        setError(err.message || 'Failed to load album details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [album]);

  if (!album) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-header">
          <div>
            <h2>{album.collectionName}</h2>
            <p className="modal-subtitle">
              {album.artistName} • {new Date(album.releaseDate).getFullYear()}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close details">
            ×
          </button>
        </header>

        {loading && <div className="modal-loading">Loading album info…</div>}
        {error && <div className="modal-error">{error}</div>}

        {!loading && !error && (
          <div className="modal-body">
            <div className="modal-grid">
              <div className="modal-cover">
                <img
                  src={album.artworkUrl100.replace('100x100bb', '600x600bb')}
                  alt={`${album.collectionName} cover`}
                  loading="lazy"
                />
                <p className="modal-meta">{album.primaryGenreName}</p>
                <p className="modal-meta">{album.trackCount} tracks</p>
              </div>

              <div className="modal-details">
                <section className="modal-section">
                  <h3>Tracklist</h3>
                  <ol className="tracklist">
                    {tracks.slice(0, 30).map((track) => (
                      <li key={track.trackId}>
                        <span className="track-title">{track.trackName}</span>
                        <span className="track-length">{Math.floor(track.trackTimeMillis / 60000)}:{String(Math.floor((track.trackTimeMillis % 60000) / 1000)).padStart(2, '0')}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="modal-section">
                  <h3>Genre tags</h3>
                  <div className="tag-list">
                    {tags.length ? (
                      tags.map((tag) => (
                        <span key={tag.name} className="tag">
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <p className="hint">No genres found via Last.fm.</p>
                    )}
                  </div>
                </section>

                <section className="modal-section">
                  <h3>Similar artists</h3>
                  {similar.length ? (
                    <ul className="similar-artists">
                      {similar.slice(0, 8).map((artist) => (
                        <li key={artist.name}>
                          <a href={artist.url} target="_blank" rel="noreferrer">
                            {artist.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="hint">No similar artists found.</p>
                  )}
                </section>

                {releaseInfo && (
                  <section className="modal-section">
                    <h3>Release (MusicBrainz)</h3>
                    <p>
                      {releaseInfo.title} • {releaseInfo['release-group']?.primarytype || releaseInfo.status}
                    </p>
                    <p className="hint">
                      {releaseInfo.date ? `Released: ${releaseInfo.date}` : 'Release date not available.'}
                    </p>
                    <p className="hint">Label: {releaseInfo['label-info']?.[0]?.label?.name || 'Unknown'}</p>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
