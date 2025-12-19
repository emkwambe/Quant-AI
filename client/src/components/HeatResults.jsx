export function HeatResults({ results, onNewHeat, onViewStudent }) {
  const { leaderboard, stats, heat } = results;

  return (
    <div class="card">
      <div class="flex flex-between mb-3">
        <h3>Heat Results</h3>
        <button class="btn btn-primary" onClick={onNewHeat}>
          Start New Heat
        </button>
      </div>

      {/* Class Stats */}
      <div class="stats mb-3">
        <div>
          <div class="stat-value">{stats.participants}</div>
          <div class="stat-label">Participants</div>
        </div>
        <div>
          <div class="stat-value">{stats.classAccuracy}%</div>
          <div class="stat-label">Class Accuracy</div>
        </div>
        <div>
          <div class="stat-value">{(stats.classAvgTime / 1000).toFixed(1)}s</div>
          <div class="stat-label">Avg Response</div>
        </div>
      </div>

      {/* Podium for top 3 */}
      {leaderboard.length >= 3 && (
        <div class="podium mb-3">
          <div class="podium-place podium-2">
            <div class="podium-name">{leaderboard[1]?.displayName}</div>
            <div class="podium-platform">2</div>
          </div>
          <div class="podium-place podium-1">
            <div class="podium-name">{leaderboard[0]?.displayName}</div>
            <div class="podium-platform">1</div>
          </div>
          <div class="podium-place podium-3">
            <div class="podium-name">{leaderboard[2]?.displayName}</div>
            <div class="podium-platform">3</div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <h4 class="mb-2">Full Rankings</h4>
      <ul class="leaderboard">
        {leaderboard.map((entry) => (
          <li key={entry.studentId} class="leaderboard-item">
            <span class={`leaderboard-rank ${
              entry.rank === 1 ? 'gold' :
              entry.rank === 2 ? 'silver' :
              entry.rank === 3 ? 'bronze' : ''
            }`}>
              {entry.rank}
            </span>
            <span
              class="leaderboard-name"
              style={onViewStudent ? { cursor: 'pointer', textDecoration: 'underline' } : {}}
              onClick={() => onViewStudent && onViewStudent(entry.studentId)}
            >
              {entry.displayName}
            </span>
            <span class="text-light" style={{ marginRight: '1rem' }}>
              {entry.correct}/{entry.total}
            </span>
            <span class="leaderboard-score">{entry.score} pts</span>
          </li>
        ))}
      </ul>

      {leaderboard.length === 0 && (
        <p class="text-light text-center">No students participated in this heat.</p>
      )}
    </div>
  );
}
