import { useState, useEffect } from 'preact/hooks';

export default function TournamentList({ onSelect, onCreateNew }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  async function fetchTournaments() {
    try {
      const res = await fetch('/api/tournaments', { credentials: 'include' });
      if (res.ok) {
        setTournaments(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch tournaments:', e);
    }
    setLoading(false);
  }

  function getStatusBadge(status) {
    const colors = {
      draft: 'badge-secondary',
      active: 'badge-success',
      completed: 'badge-primary',
      cancelled: 'badge-error'
    };
    return colors[status] || 'badge-secondary';
  }

  if (loading) {
    return <div class="text-center p-4">Loading tournaments...</div>;
  }

  return (
    <div>
      <div class="flex justify-between items-center mb-3">
        <h2>Tournaments</h2>
        <button class="btn btn-primary" onClick={onCreateNew}>
          + New Tournament
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div class="card text-center p-4">
          <p class="text-muted mb-2">No tournaments yet</p>
          <p class="text-sm text-muted">
            Create a tournament to start a season-long competition in your classroom
          </p>
        </div>
      ) : (
        <div class="tournament-list">
          {tournaments.map(t => (
            <div
              key={t.id}
              class="card mb-2 cursor-pointer hover-shadow"
              onClick={() => onSelect(t)}
              style={{ cursor: 'pointer' }}
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="mb-1">{t.name}</h3>
                  <p class="text-sm text-muted mb-1">{t.classroom_name}</p>
                  <div class="text-sm">
                    <span class="mr-2">📅 {t.season}</span>
                    <span class="mr-2">👥 {t.student_count} students</span>
                    <span>🏁 {t.completed_rounds}/{t.round_count} rounds</span>
                  </div>
                </div>
                <span class={`badge ${getStatusBadge(t.status)}`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
