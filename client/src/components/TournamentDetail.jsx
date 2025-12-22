import { useState, useEffect } from 'preact/hooks';

export default function TournamentDetail({ tournamentId, onBack }) {
  const [tournament, setTournament] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [roundMatchups, setRoundMatchups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournament();
  }, [tournamentId]);

  async function fetchTournament() {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTournament(data);
        // Auto-select active or latest round
        const activeRound = data.rounds.find(r => r.status === 'active') || data.rounds[0];
        if (activeRound) {
          loadRound(activeRound.round_number);
        }
      }
    } catch (e) {
      console.error('Failed to fetch tournament:', e);
    }
    setLoading(false);
  }

  async function loadRound(roundNumber) {
    setSelectedRound(roundNumber);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/rounds/${roundNumber}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setRoundMatchups(data.matchups);
      }
    } catch (e) {
      console.error('Failed to fetch round:', e);
    }
  }

  async function startTournament() {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/start`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        fetchTournament();
      }
    } catch (e) {
      console.error('Failed to start tournament:', e);
    }
  }

  function getRankEmoji(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  function getStatusColor(status) {
    return {
      pending: '#6b7280',
      active: '#10b981',
      completed: '#3b82f6'
    }[status] || '#6b7280';
  }

  if (loading) {
    return <div class="text-center p-4">Loading tournament...</div>;
  }

  if (!tournament) {
    return <div class="text-center p-4">Tournament not found</div>;
  }

  return (
    <div>
      {/* Header */}
      <div class="flex justify-between items-start mb-3">
        <div>
          <button class="btn btn-link mb-2" onClick={onBack}>← Back to Tournaments</button>
          <h2>{tournament.name}</h2>
          <p class="text-muted">{tournament.classroom_name} • {tournament.season}</p>
        </div>
        <div class="text-right">
          <span
            class="badge"
            style={{ backgroundColor: getStatusColor(tournament.status), color: 'white' }}
          >
            {tournament.status}
          </span>
          {tournament.status === 'draft' && (
            <button class="btn btn-primary ml-2" onClick={startTournament}>
              Start Tournament
            </button>
          )}
        </div>
      </div>

      <div class="grid grid-2 gap-3">
        {/* Standings */}
        <div class="card">
          <h3 class="mb-2">Standings</h3>
          {tournament.standings.length === 0 ? (
            <p class="text-muted">No standings yet</p>
          ) : (
            <table class="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>W-L-T</th>
                  <th>Pts</th>
                  <th>Acc%</th>
                </tr>
              </thead>
              <tbody>
                {tournament.standings.map(s => (
                  <tr key={s.student_id}>
                    <td>{getRankEmoji(s.rank)}</td>
                    <td>{s.display_name}</td>
                    <td>{s.matches_won}-{s.matches_lost}-{s.matches_tied}</td>
                    <td><strong>{s.total_points}</strong></td>
                    <td>{s.avg_accuracy.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Rounds */}
        <div class="card">
          <h3 class="mb-2">Rounds</h3>

          {/* Round tabs */}
          <div class="flex gap-1 mb-3 flex-wrap">
            {tournament.rounds.map(r => (
              <button
                key={r.round_number}
                class={`btn btn-sm ${selectedRound === r.round_number ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => loadRound(r.round_number)}
                style={{
                  borderBottom: `3px solid ${getStatusColor(r.status)}`
                }}
              >
                R{r.round_number}
              </button>
            ))}
          </div>

          {/* Selected round matchups */}
          {selectedRound && (
            <div>
              <p class="text-sm text-muted mb-2">
                Round {selectedRound} •{' '}
                {tournament.rounds.find(r => r.round_number === selectedRound)?.status}
              </p>

              {roundMatchups.length === 0 ? (
                <p class="text-muted">Loading matchups...</p>
              ) : (
                <div class="matchup-list">
                  {roundMatchups.map(m => (
                    <div
                      key={m.id}
                      class="matchup-card p-2 mb-2"
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: m.status === 'completed' ? '#f9fafb' : 'white'
                      }}
                    >
                      <div class="flex justify-between items-center">
                        <div class="flex-1">
                          <span
                            class={m.winner_student_id === m.student_a_id ? 'font-bold text-success' : ''}
                          >
                            {m.student_a_name}
                          </span>
                          {m.status === 'completed' && (
                            <span class="text-sm ml-1">({m.student_a_score})</span>
                          )}
                        </div>

                        <div class="px-2 text-muted">vs</div>

                        <div class="flex-1 text-right">
                          {m.student_b_id ? (
                            <>
                              <span
                                class={m.winner_student_id === m.student_b_id ? 'font-bold text-success' : ''}
                              >
                                {m.student_b_name}
                              </span>
                              {m.status === 'completed' && (
                                <span class="text-sm ml-1">({m.student_b_score})</span>
                              )}
                            </>
                          ) : (
                            <span class="text-muted italic">BYE</span>
                          )}
                        </div>
                      </div>

                      {m.is_tie === 1 && (
                        <div class="text-center text-sm text-muted mt-1">TIE</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {tournament.events.length > 0 && (
        <div class="card mt-3">
          <h3 class="mb-2">Recent Activity</h3>
          <div class="activity-log text-sm">
            {tournament.events.slice(0, 5).map(e => (
              <div key={e.id} class="activity-item py-1 border-bottom">
                <span class="text-muted">{new Date(e.created_at).toLocaleString()}</span>
                <span class="ml-2">{formatEvent(e)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatEvent(event) {
  const details = event.details ? JSON.parse(event.details) : {};

  switch (event.event_type) {
    case 'created':
      return `Tournament created with ${details.student_count} students, ${details.rounds} rounds`;
    case 'started':
      return 'Tournament started';
    case 'round_completed':
      return `Round ${details.round_number} completed`;
    case 'match_completed':
      return 'Match completed';
    case 'completed':
      return 'Tournament completed!';
    default:
      return event.event_type;
  }
}
