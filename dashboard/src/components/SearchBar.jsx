import { useMemo, useState } from 'react';

export default function SearchBar({ onSearch, onRandom, isLoading }) {
  const [query, setQuery] = useState('');

  const trimmed = useMemo(() => query.trim(), [query]);

  return (
    <section className="search">
      <div className="search-main">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && trimmed) {
              onSearch(trimmed);
            }
          }}
          placeholder="Search artist or album..."
          aria-label="Search artist or album"
          disabled={isLoading}
        />
        <button
          className="primary"
          disabled={!trimmed || isLoading}
          onClick={() => onSearch(trimmed)}
        >
          Search
        </button>
        <button className="secondary" onClick={onRandom} disabled={isLoading}>
          Surprise me
        </button>
      </div>
      <p className="search-hint">Tip: Try “Taylor Swift”, “Daft Punk”, or “Radiohead” for quick results.</p>
    </section>
  );
}
