import { useState, useEffect } from 'preact/hooks';
import { resources } from '../api/index.js';

export function ResourceCenter() {
  const [resourceList, setResourceList] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [myLibrary, setMyLibrary] = useState([]);
  const [types, setTypes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('browse'); // 'browse', 'bundles', 'library'

  // Filters
  const [selectedType, setSelectedType] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (view === 'browse') {
      loadResources();
    } else if (view === 'bundles') {
      loadBundles();
    } else if (view === 'library') {
      loadMyLibrary();
    }
  }, [view, selectedType, selectedGrade, showFreeOnly, searchQuery]);

  async function loadInitialData() {
    try {
      const [typesData, gradesData] = await Promise.all([
        resources.types(),
        resources.grades()
      ]);
      setTypes(typesData);
      setGrades(gradesData);
      await loadResources();
    } catch (e) {
      console.error('Failed to load resource data:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadResources() {
    try {
      const data = await resources.list({
        type: selectedType || undefined,
        grade: selectedGrade || undefined,
        free: showFreeOnly ? 'true' : undefined,
        search: searchQuery || undefined
      });
      setResourceList(data);
    } catch (e) {
      console.error('Failed to load resources:', e);
    }
  }

  async function loadBundles() {
    try {
      const data = await resources.bundles();
      setBundles(data);
    } catch (e) {
      console.error('Failed to load bundles:', e);
    }
  }

  async function loadMyLibrary() {
    try {
      const data = await resources.myDownloads();
      setMyLibrary(data);
    } catch (e) {
      console.error('Failed to load library:', e);
    }
  }

  async function handleDownload(resource) {
    try {
      const result = await resources.download(resource.id);
      alert(`Ready to download: ${result.title}`);
      // In production, trigger actual file download
      // window.open(result.downloadUrl, '_blank');
    } catch (e) {
      if (e.message.includes('not purchased')) {
        handlePurchase(resource);
      } else {
        alert(e.message);
      }
    }
  }

  async function handlePurchase(resource) {
    if (!confirm(`Purchase "${resource.title}" for ${resource.priceDisplay}?`)) {
      return;
    }

    setPurchasing(resource.id);
    try {
      const result = await resources.purchase(resource.id);
      alert(result.message);
      loadResources();
      if (view === 'library') loadMyLibrary();
    } catch (e) {
      alert(e.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  }

  async function handlePurchaseBundle(bundle) {
    if (!confirm(`Purchase "${bundle.name}" for ${bundle.priceDisplay}? (Save ${bundle.savingsDisplay})`)) {
      return;
    }

    setPurchasing(`bundle-${bundle.id}`);
    try {
      const result = await resources.purchaseBundle(bundle.id);
      alert(result.message);
      loadBundles();
    } catch (e) {
      alert(e.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  }

  function getTypeIcon(type) {
    const icons = { guide: '📖', worksheet: '📝', 'answer-key': '✅', 'competition-prep': '🏆' };
    return icons[type] || '📄';
  }

  function getDifficultyColor(diff) {
    const colors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
    return colors[diff] || '#6b7280';
  }

  if (loading) {
    return <div class="card text-center">Loading resources...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div class="flex flex-between mb-3">
        <h2>Resource Center</h2>
        <div class="flex gap-1">
          <button
            class={`btn ${view === 'browse' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('browse')}
          >
            Browse
          </button>
          <button
            class={`btn ${view === 'bundles' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('bundles')}
          >
            Bundles
          </button>
          <button
            class={`btn ${view === 'library' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('library')}
          >
            My Library
          </button>
        </div>
      </div>

      {/* Browse View */}
      {view === 'browse' && (
        <>
          {/* Filters */}
          <div class="card mb-3">
            <div class="grid grid-4" style={{ gap: '1rem', alignItems: 'end' }}>
              <div class="form-group" style={{ marginBottom: 0 }}>
                <label>Type</label>
                <select
                  class="form-input"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {types.map(t => (
                    <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                  ))}
                </select>
              </div>
              <div class="form-group" style={{ marginBottom: 0 }}>
                <label>Grade Level</label>
                <select
                  class="form-input"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div class="form-group" style={{ marginBottom: 0 }}>
                <label>Search</label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onInput={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="freeOnly"
                  checked={showFreeOnly}
                  onChange={(e) => setShowFreeOnly(e.target.checked)}
                />
                <label for="freeOnly" style={{ marginBottom: 0 }}>Free only</label>
              </div>
            </div>
          </div>

          {/* Resource Grid */}
          <div class="grid grid-3" style={{ gap: '1rem' }}>
            {resourceList.map(resource => (
              <div key={resource.id} class="card">
                <div class="flex flex-between mb-2">
                  <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(resource.type)}</span>
                  <span
                    style={{
                      background: resource.is_free ? 'var(--success)' : 'var(--primary)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {resource.priceDisplay}
                  </span>
                </div>
                <h4 style={{ marginBottom: '0.5rem' }}>{resource.title}</h4>
                <p class="text-light" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  {resource.description}
                </p>
                <div class="flex gap-1 mb-2" style={{ flexWrap: 'wrap' }}>
                  {resource.grade_level && (
                    <span class="badge" style={{ background: '#e5e7eb', color: '#374151' }}>
                      {resource.grade_level}
                    </span>
                  )}
                  {resource.difficulty && (
                    <span
                      class="badge"
                      style={{ background: getDifficultyColor(resource.difficulty), color: 'white' }}
                    >
                      {resource.difficulty}
                    </span>
                  )}
                  <span class="badge" style={{ background: '#e5e7eb', color: '#374151' }}>
                    {resource.page_count} pages
                  </span>
                </div>
                <button
                  class={`btn ${resource.is_free ? 'btn-success' : 'btn-primary'}`}
                  style={{ width: '100%' }}
                  onClick={() => resource.is_free ? handleDownload(resource) : handlePurchase(resource)}
                  disabled={purchasing === resource.id}
                >
                  {purchasing === resource.id ? 'Processing...' : (resource.is_free ? 'Download Free' : `Buy ${resource.priceDisplay}`)}
                </button>
              </div>
            ))}
          </div>

          {resourceList.length === 0 && (
            <div class="card text-center text-light">
              No resources found matching your filters.
            </div>
          )}
        </>
      )}

      {/* Bundles View */}
      {view === 'bundles' && (
        <div class="grid grid-2" style={{ gap: '1rem' }}>
          {bundles.map(bundle => (
            <div key={bundle.id} class="card" style={{ border: '2px solid var(--primary)' }}>
              <div class="flex flex-between mb-2">
                <h3>{bundle.name}</h3>
                <span
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}
                >
                  Save {bundle.discount_percent}%
                </span>
              </div>
              <p class="text-light mb-2">{bundle.description}</p>

              <div style={{ background: '#f3f4f6', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div class="flex flex-between mb-1">
                  <span>Total value:</span>
                  <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>{bundle.totalValueDisplay}</span>
                </div>
                <div class="flex flex-between">
                  <span style={{ fontWeight: 'bold' }}>Bundle price:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--success)', fontSize: '1.25rem' }}>{bundle.priceDisplay}</span>
                </div>
              </div>

              <p class="text-light mb-2" style={{ fontSize: '0.875rem' }}>
                Includes {bundle.item_count} resources:
              </p>
              <ul style={{ marginBottom: '1rem', paddingLeft: '1.25rem' }}>
                {bundle.items.slice(0, 4).map(item => (
                  <li key={item.id} style={{ fontSize: '0.875rem' }}>
                    {getTypeIcon(item.type)} {item.title}
                  </li>
                ))}
                {bundle.items.length > 4 && (
                  <li style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    +{bundle.items.length - 4} more...
                  </li>
                )}
              </ul>

              <button
                class="btn btn-success"
                style={{ width: '100%' }}
                onClick={() => handlePurchaseBundle(bundle)}
                disabled={purchasing === `bundle-${bundle.id}`}
              >
                {purchasing === `bundle-${bundle.id}` ? 'Processing...' : `Get Bundle - ${bundle.priceDisplay}`}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Library View */}
      {view === 'library' && (
        <>
          {myLibrary.length === 0 ? (
            <div class="card text-center">
              <p class="text-light mb-2">Your library is empty</p>
              <button class="btn btn-primary" onClick={() => setView('browse')}>
                Browse Resources
              </button>
            </div>
          ) : (
            <div class="grid grid-3" style={{ gap: '1rem' }}>
              {myLibrary.map(resource => (
                <div key={resource.id} class="card">
                  <div class="flex flex-between mb-2">
                    <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(resource.type)}</span>
                    {resource.is_free ? (
                      <span class="badge" style={{ background: 'var(--success)', color: 'white' }}>Free</span>
                    ) : (
                      <span class="badge" style={{ background: 'var(--primary)', color: 'white' }}>Purchased</span>
                    )}
                  </div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{resource.title}</h4>
                  <p class="text-light" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {resource.grade_level} | {resource.page_count} pages
                  </p>
                  <button
                    class="btn btn-success"
                    style={{ width: '100%' }}
                    onClick={() => handleDownload(resource)}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
