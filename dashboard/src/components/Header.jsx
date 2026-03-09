import logo from '../assets/vinyl-logo.svg';

export default function Header({ onClearFilters, filtersActive }) {
  return (
    <header className="header">
      <div className="logo-row">
        <img className="brand-logo" src={logo} alt="Vinyl logo" />
        <div>
          <h1 className="brand-title">Album Discovery</h1>
          <p className="brand-subtitle">Search, explore, and jam with data from iTunes, Last.fm, and MusicBrainz.</p>
        </div>
      </div>
      <div className="header-actions">
        <button className="primary" onClick={onClearFilters} disabled={!filtersActive}>
          Clear Filters
        </button>
      </div>
    </header>
  );
}
