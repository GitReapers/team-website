import { useMemo } from 'react';

export default function AlbumCard({ album, isFavorite, onToggleFavorite, onSelect }) {
  const releaseYear = useMemo(() => {
    if (!album.releaseDate) return '';
    const d = new Date(album.releaseDate);
    return d.getFullYear();
  }, [album.releaseDate]);

  return (
    <article className="card">
      <button type="button" className="card-art" onClick={() => onSelect(album)}>
        <img
          src={album.artworkUrl100.replace('100x100bb', '300x300bb')}
          alt={`${album.collectionName} cover`}
          loading="lazy"
        />
      </button>
      <div className="card-body">
        <h3 className="card-title">{album.collectionName}</h3>
        <p className="card-subtitle">
          {album.artistName} • {album.primaryGenreName || 'Unknown'} {releaseYear ? `• ${releaseYear}` : ''}
        </p>
        <p className="card-meta">
          {album.trackCount} tracks • {album.collectionPrice ? `$${album.collectionPrice}` : '—'}
        </p>
        <div className="card-actions">
          <button className="secondary" onClick={() => onSelect(album)}>
            Details
          </button>
          <button className={isFavorite ? 'favorite active' : 'favorite'} onClick={() => onToggleFavorite(album)}>
            {isFavorite ? '★ Saved' : '☆ Save'}
          </button>
        </div>
      </div>
    </article>
  );
}
