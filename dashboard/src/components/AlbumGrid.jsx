import AlbumCard from './AlbumCard';

export default function AlbumGrid({ albums, favorites, onToggleFavorite, onSelect }) {
  if (!albums?.length) {
    return (
      <div className="empty-state">
        <p>No albums found yet. Try a different search, or click “Surprise me” to explore.</p>
      </div>
    );
  }

  return (
    <section className="grid">
      {albums.map((album) => (
        <AlbumCard
          key={album.collectionId}
          album={album}
          onToggleFavorite={onToggleFavorite}
          onSelect={onSelect}
          isFavorite={favorites.includes(album.collectionId)}
        />
      ))}
    </section>
  );
}
