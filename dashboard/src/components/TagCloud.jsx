export default function TagCloud({ tags, activeTag, onSelectTag }) {
  if (!tags || !tags.length) return null;

  return (
    <section className="tag-cloud">
      <h2 className="tag-cloud-title">Genre / Tag Cloud</h2>
      <div className="tags">
        {tags.map((tag) => {
          const isActive = activeTag === tag.name;
          return (
            <button
              key={tag.name}
              className={isActive ? 'tag active' : 'tag'}
              onClick={() => onSelectTag(isActive ? null : tag.name)}
              title={`${tag.count} albums`}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
