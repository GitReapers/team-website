import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import AlbumGrid from './components/AlbumGrid';
import AlbumDetailModal from './components/AlbumDetailModal';
import TagCloud from './components/TagCloud';
import {
  averageColorFromImage,
  formatRgb,
} from './utils/colorUtils';
import {
  loadFavorites,
  saveFavorites,
} from './utils/localStorage';
import {
  searchItunesAlbums,
} from './utils/api';
import './App.css';

const SORT_OPTIONS = [
  { value: 'release_desc', label: 'Release (new → old)' },
  { value: 'release_asc', label: 'Release (old → new)' },
  { value: 'alpha', label: 'Album name' },
  { value: 'tracks', label: 'Track count' },
];

const RANDOM_QUERIES = [
  'The Beatles',
  'Beyoncé',
  'Daft Punk',
  'Radiohead',
  'Miles Davis',
  'Fleetwood Mac',
  'Billie Eilish',
  'Nirvana',
  'Taylor Swift',
  'Kendrick Lamar',
];

const getDecade = (year) => {
  if (!year) return '';
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
};

export default function App() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState(() => loadFavorites());

  const [genreFilter, setGenreFilter] = useState(null);
  const [decadeFilter, setDecadeFilter] = useState(null);
  const [countryFilter, setCountryFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [sort, setSort] = useState('release_desc');

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    const album = selected;
    if (!album) return;
    const artwork = album.artworkUrl100.replace('100x100bb', '600x600bb');
    averageColorFromImage(artwork).then((color) => {
      document.documentElement.style.setProperty('--accent', formatRgb(color));
    });
  }, [selected]);

  const tags = useMemo(() => {
    const counts = albums.reduce((acc, album) => {
      const genre = album.primaryGenreName || 'Unknown';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);
  }, [albums]);

  const filtersActive = useMemo(
    () => Boolean(genreFilter || decadeFilter || countryFilter || tagFilter),
    [genreFilter, decadeFilter, countryFilter, tagFilter],
  );

  const clearFilters = () => {
    setGenreFilter(null);
    setDecadeFilter(null);
    setCountryFilter(null);
    setTagFilter(null);
  };

  const visibleAlbums = useMemo(() => {
    const base = albums.slice();
    const filtered = base.filter((album) => {
      if (genreFilter && album.primaryGenreName !== genreFilter) return false;
      if (tagFilter && album.primaryGenreName !== tagFilter) return false;
      if (decadeFilter) {
        const year = new Date(album.releaseDate).getFullYear();
        if (getDecade(year) !== decadeFilter) return false;
      }
      if (countryFilter && album.country !== countryFilter) return false;
      return true;
    });
    const sorted = filtered.sort((a, b) => {
      if (sort === 'alpha') return a.collectionName.localeCompare(b.collectionName);
      if (sort === 'tracks') return (b.trackCount || 0) - (a.trackCount || 0);
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return sort === 'release_asc' ? dateA - dateB : dateB - dateA;
    });

    return sorted;
  }, [albums, genreFilter, decadeFilter, countryFilter, tagFilter, sort]);

  const countryOptions = useMemo(() => {
    const set = new Set(albums.map((album) => album.country).filter(Boolean));
    return Array.from(set).sort();
  }, [albums]);

  const decadeOptions = useMemo(() => {
    const set = new Set(
      albums
        .map((album) => {
          const year = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;
          return getDecade(year);
        })
        .filter(Boolean),
    );
    return Array.from(set).sort();
  }, [albums]);

  const handleSearch = async (term) => {
    setQuery(term);
    setLoading(true);
    setError(null);
    clearFilters();

    try {
      const results = await searchItunesAlbums(term, 60);
      setAlbums(results);
      if (!results.length) {
        setError(`No results found for “${term}”. Try a different artist or album.`);
      }
    } catch (err) {
      setError(err.message || 'Search failed.');
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRandom = () => {
    const random = RANDOM_QUERIES[Math.floor(Math.random() * RANDOM_QUERIES.length)];
    handleSearch(random);
  };

  const toggleFavorite = (album) => {
    setFavorites((prev) => {
      const exists = prev.includes(album.collectionId);
      if (exists) return prev.filter((id) => id !== album.collectionId);
      return [...prev, album.collectionId];
    });
  };

  const favoriteAlbums = useMemo(
    () => albums.filter((album) => favorites.includes(album.collectionId)),
    [albums, favorites],
  );

  return (
    <div className="app">
      <Header onClearFilters={clearFilters} filtersActive={filtersActive} />
      <main>
        <SearchBar onSearch={handleSearch} onRandom={handleRandom} isLoading={loading} />

        <section className="controls">
          <div className="filter-group">
            <label>
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Genre
              <select value={genreFilter || ''} onChange={(e) => setGenreFilter(e.target.value || null)}>
                <option value="">All</option>
                {tags.map((tag) => (
                  <option key={tag.name} value={tag.name}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Decade
              <select value={decadeFilter || ''} onChange={(e) => setDecadeFilter(e.target.value || null)}>
                <option value="">Any</option>
                {decadeOptions.map((decade) => (
                  <option key={decade} value={decade}>
                    {decade}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Country
              <select value={countryFilter || ''} onChange={(e) => setCountryFilter(e.target.value || null)}>
                <option value="">Any</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <TagCloud tags={tags} activeTag={tagFilter} onSelectTag={setTagFilter} />

        {error && (
          <div className="notice error">
            <p>{error}</p>
          </div>
        )}

        <AlbumGrid
          albums={visibleAlbums}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelect={setSelected}
        />

        {favoriteAlbums.length ? (
          <section className="favorites">
            <h2>Saved Albums</h2>
            <p className="hint">Your favorites are stored in localStorage. Add more to build a playlist.</p>
            <AlbumGrid
              albums={favoriteAlbums}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSelect={setSelected}
            />
          </section>
        ) : null}

        {selected && <AlbumDetailModal album={selected} onClose={() => setSelected(null)} />}
      </main>

      <footer className="footer">
        <p>
          Album Discovery Dashboard • Powered by iTunes, Last.fm, MusicBrainz • Built by GitReapers
        </p>
      </footer>
    </div>
  );
}
