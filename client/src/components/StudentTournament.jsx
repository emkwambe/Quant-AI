import { useState, useEffect } from 'preact/hooks';

export default function StudentTournament({ onStartMatch }) {
  const [data, setData] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchTournamentData();
  }, []);

  async function fetchTournamentData() {
    try {
      const [activeRes, standingsRes] = await Promise.all([
        fetch('/api/tournaments/student/active', { credentials: 'include' }),
        fetch('/api/tournaments/student/standings', { credentials: 'include' })
      ]);

      if (activeRes.ok) {
        setData(await activeRes.json());
      }
      if (standingsRes.ok) {
        const standingsData = await standingsRes.json();
        setStandings(standingsData.standings || []);
      }
    } catch (e) {
      console.error('Failed to fetch tournament data:', e);
    }
    setLoading(false);
  }

  async function handleStartMatch() {
    if (!data?.currentMatchup) return;

    setStarting(true);
    try {
      const res = await fetch(`/api/tournaments/student/match/${data.currentMatchup.id}/start`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        const matchData = await res.json();

        if (matchData.bye) {
          // Bye - auto-win, refresh
          alert('You have a BYE this round - automatic win!');
          fetchTournamentData();
        } else {
          // Start the match
          onStartMatch(matchData.heatId, data.currentMatchup.id);
        }
      }
    } catch (e) {
      console.error('Failed to start match:', e);
    }
    setStarting(false);
  }

  function getRankEmoji(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  if (loading) {
    return <div class="text-center p-4">Loading tournament...</div>;
  }

  if (!data?.active) {
    return (
      <div class="card text-center p-4">
        <h3 class="mb-2">No Active Tournament</h3>
        <p class="text-muted">
          Your classroom doesn't have an active tournament right now.
          Check back later!
        </p>
      </div>
    );
  }

  const { tournament, currentRound, standing, currentMatchup } = data;

  return (
    <div>
      {/* Tournament Header */}
      <div class="card mb-3">
        <div class="flex justify-between items-start">
          <div>
            <h2>{tournament.name}</h2>
            <p class="text-muted">{tournament.season}</p>
          </div>
          <div class="text-right">
            {standing && (
              <div class="text-2xl font-bold">
                {getRankEmoji(standing.rank)}
              </div>
            )}
          </div>
        </div>

        {/* Your Stats */}
        {standing && (
          <div class="grid grid-4 gap-2 mt-3 text-center">
            <div class="stat-box">
              <div class="text-2xl font-bold text-success">{standing.matches_won}</div>
              <div class="text-sm text-muted">Wins</div>
            </div>
            <div class="stat-box">
              <div class="text-2xl font-bold text-error">{standing.matches_lost}</div>
              <div class="text-sm text-muted">Losses</div>
            </div>
            <div class="stat-box">
              <div class="text-2xl font-bold">{standing.total_points}</div>
              <div class="text-sm text-muted">Points</div>
            </div>
            <div class="stat-box">
              <div class="text-2xl font-bold">{standing.avg_accuracy.toFixed(0)}%</div>
              <div class="text-sm text-muted">Accuracy</div>
            </div>
          </div>
        )}
      </div>

      {/* Current Match */}
      {currentRound && currentMatchup && (
        <div class="card mb-3" style={{ borderLeft: '4px solid var(--brand-gold)' }}>
          <h3 class="mb-2">Round {currentRound.round_number} - Your Match</h3>

          {currentMatchup.status === 'completed' ? (
            <div class="text-center p-3">
              <div class="text-lg mb-2">
                {currentMatchup.winner_student_id === standing?.student_id ? (
                  <span class="text-success font-bold">🎉 You Won!</span>
                ) : currentMatchup.is_tie ? (
                  <span class="text-muted">It's a Tie</span>
                ) : (
                  <span class="text-error">You Lost</span>
                )}
              </div>
              <p class="text-muted">Match complete. Wait for the next round!</p>
            </div>
          ) : currentMatchup.student_b_id === null ? (
            <div class="text-center p-3">
              <p class="text-lg mb-2">You have a <strong>BYE</strong> this round</p>
              <button
                class="btn btn-primary"
                onClick={handleStartMatch}
                disabled={starting}
              >
                {starting ? 'Processing...' : 'Claim Free Win'}
              </button>
            </div>
          ) : (
            <div class="text-center p-3">
              <p class="text-lg mb-2">
                You vs <strong>{currentMatchup.opponent_name}</strong>
              </p>
              <p class="text-sm text-muted mb-3">
                Answer {tournament.questions_per_match} questions. Most correct wins!
              </p>
              <button
                class="btn btn-primary btn-large"
                onClick={handleStartMatch}
                disabled={starting || currentMatchup.status === 'active'}
              >
                {starting ? 'Starting...' :
                 currentMatchup.status === 'active' ? 'Match in Progress' :
                 'Start Match'}
              </button>
            </div>
          )}

          <p class="text-sm text-muted text-center mt-2">
            Round closes: {new Date(currentRound.closes_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Leaderboard */}
      <div class="card">
        <h3 class="mb-2">Leaderboard</h3>
        {standings.length === 0 ? (
          <p class="text-muted">No standings yet</p>
        ) : (
          <div class="leaderboard">
            {standings.map((s, i) => (
              <div
                key={s.student_id}
                class={`leaderboard-item flex justify-between items-center p-2 ${s.is_me ? 'bg-highlight' : ''}`}
                style={{
                  backgroundColor: s.is_me ? 'rgba(245, 158, 11, 0.1)' : (i < 3 ? 'rgba(0,0,0,0.02)' : ''),
                  borderRadius: '4px',
                  marginBottom: '4px'
                }}
              >
                <div class="flex items-center gap-2">
                  <span class="rank-badge" style={{ minWidth: '40px' }}>
                    {getRankEmoji(s.rank)}
                  </span>
                  <span class={s.is_me ? 'font-bold' : ''}>
                    {s.display_name} {s.is_me && '(You)'}
                  </span>
                </div>
                <div class="flex gap-3 text-sm">
                  <span>{s.matches_won}W-{s.matches_lost}L</span>
                  <span class="font-bold">{s.total_points} pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
