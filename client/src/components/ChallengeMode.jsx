import { useState, useEffect } from 'preact/hooks';
import { challenges } from '../api/index.js';

export function ChallengeMode({ classroom, onStartChallenge }) {
  const [view, setView] = useState('list'); // 'list', 'search', 'results'
  const [pendingChallenges, setPendingChallenges] = useState({ incoming: [], outgoing: [] });
  const [myChallenges, setMyChallenges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeResults, setChallengeResults] = useState(null);
  const [difficulty, setDifficulty] = useState(2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  async function loadChallenges() {
    try {
      const [pending, my] = await Promise.all([
        challenges.pending(),
        challenges.my()
      ]);
      setPendingChallenges(pending);
      setMyChallenges(my.challenges);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (searchQuery.length < 2) return;
    try {
      const results = await challenges.search(searchQuery);
      setSearchResults(results.classrooms);
    } catch (err) {
      console.error('Search failed:', err);
    }
  }

  async function handleChallenge(opponentId) {
    try {
      await challenges.create({
        myClassroomId: classroom.id,
        opponentClassroomId: opponentId,
        difficultyLevel: difficulty
      });
      alert('Challenge sent!');
      setView('list');
      loadChallenges();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleAccept(challengeId) {
    try {
      await challenges.accept(challengeId);
      loadChallenges();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDecline(challengeId) {
    try {
      await challenges.decline(challengeId);
      loadChallenges();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleViewResults(challengeId) {
    try {
      const results = await challenges.results(challengeId);
      setChallengeResults(results);
      setView('results');
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return <div class="card text-center">Loading challenges...</div>;
  }

  // Results view
  if (view === 'results' && challengeResults) {
    return (
      <div>
        <button class="btn btn-outline mb-3" onClick={() => setView('list')}>
          ← Back
        </button>

        <div class="card">
          <h3 class="mb-3">Challenge Results</h3>

          <div class="grid grid-2" style={{ gap: '1rem' }}>
            {challengeResults.teams.map((team) => (
              <div
                key={team.classroomId}
                class="card"
                style={{
                  background: team.isWinner ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg)',
                  border: team.isWinner ? '2px solid var(--success)' : 'none'
                }}
              >
                <h4>{team.classroomName}</h4>
                <p class="text-light">{team.teacherName}</p>
                <div class="stats mt-2">
                  <div>
                    <div class="stat-value">{team.totalCorrect}</div>
                    <div class="stat-label">Correct</div>
                  </div>
                  <div>
                    <div class="stat-value">{team.participants}</div>
                    <div class="stat-label">Participants</div>
                  </div>
                </div>
                {team.isWinner && (
                  <div class="text-center mt-2" style={{ fontSize: '2rem' }}>
                    🏆 Winner!
                  </div>
                )}
              </div>
            ))}
          </div>

          {!challengeResults.challenge.winnerId && challengeResults.teams.length === 2 && (
            <div class="text-center mt-3">
              <h3>It's a Tie! 🤝</h3>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Search view
  if (view === 'search') {
    return (
      <div>
        <button class="btn btn-outline mb-3" onClick={() => setView('list')}>
          ← Back
        </button>

        <div class="card mb-3">
          <h3 class="mb-2">Find Opponent</h3>
          <p class="text-light mb-3">Search by school name or class code</p>

          <div class="flex gap-1 mb-3">
            <input
              type="text"
              class="form-input"
              value={searchQuery}
              onInput={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter school name or code..."
            />
            <button class="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>

          <div class="form-group">
            <label>Challenge Difficulty</label>
            <select
              class="form-input"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
            >
              <option value="1">Warm Up (Easy)</option>
              <option value="2">Practice (Medium)</option>
              <option value="3">Challenge (Hard)</option>
            </select>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div class="card">
            <h4 class="mb-2">Results</h4>
            <ul class="leaderboard">
              {searchResults.map((c) => (
                <li key={c.id} class="leaderboard-item">
                  <div>
                    <strong>{c.name}</strong>
                    <p class="text-light" style={{ margin: 0, fontSize: '0.875rem' }}>
                      {c.teacherName} • {c.schoolName || 'No school'}
                    </p>
                  </div>
                  <button
                    class="btn btn-primary"
                    onClick={() => handleChallenge(c.id)}
                  >
                    Challenge!
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {searchQuery && searchResults.length === 0 && (
          <p class="text-light text-center">No classrooms found</p>
        )}
      </div>
    );
  }

  // List view (default)
  return (
    <div>
      <div class="flex flex-between mb-3">
        <h3>Class vs Class Challenges</h3>
        <button class="btn btn-primary" onClick={() => setView('search')}>
          + New Challenge
        </button>
      </div>

      {/* Incoming Challenges */}
      {pendingChallenges.incoming.length > 0 && (
        <div class="card mb-3" style={{ borderLeft: '4px solid var(--warning)' }}>
          <h4 class="mb-2">Incoming Challenges</h4>
          <ul class="leaderboard">
            {pendingChallenges.incoming.map((ch) => (
              <li key={ch.id} class="leaderboard-item">
                <div>
                  <strong>{ch.challenger_name}</strong>
                  <p class="text-light" style={{ margin: 0, fontSize: '0.875rem' }}>
                    {ch.challenger_teacher} • Level {ch.difficulty_level}
                  </p>
                </div>
                <div class="flex gap-1">
                  <button class="btn btn-success" onClick={() => handleAccept(ch.id)}>
                    Accept
                  </button>
                  <button class="btn btn-outline" onClick={() => handleDecline(ch.id)}>
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Outgoing Challenges */}
      {pendingChallenges.outgoing.length > 0 && (
        <div class="card mb-3">
          <h4 class="mb-2">Waiting for Response</h4>
          <ul class="leaderboard">
            {pendingChallenges.outgoing.map((ch) => (
              <li key={ch.id} class="leaderboard-item">
                <div>
                  <strong>{ch.opponent_name}</strong>
                  <p class="text-light" style={{ margin: 0, fontSize: '0.875rem' }}>
                    {ch.opponent_teacher} • Level {ch.difficulty_level}
                  </p>
                </div>
                <span class="text-light">Pending...</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Challenges */}
      <div class="card">
        <h4 class="mb-2">Recent Challenges</h4>
        {myChallenges.length > 0 ? (
          <ul class="leaderboard">
            {myChallenges.slice(0, 10).map((ch) => (
              <li key={ch.id} class="leaderboard-item">
                <div>
                  <strong>
                    {ch.my_role === 'challenger' ? ch.opponent_name : ch.challenger_name}
                  </strong>
                  <p class="text-light" style={{ margin: 0, fontSize: '0.875rem' }}>
                    {ch.status} • Level {ch.difficulty_level}
                  </p>
                </div>
                {ch.status === 'active' || ch.status === 'accepted' ? (
                  <button
                    class="btn btn-primary"
                    onClick={() => onStartChallenge(ch.id)}
                  >
                    Start Heat
                  </button>
                ) : ch.status === 'ended' ? (
                  <button
                    class="btn btn-outline"
                    onClick={() => handleViewResults(ch.id)}
                  >
                    View Results
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p class="text-light">
            No challenges yet. Click "New Challenge" to challenge another class!
          </p>
        )}
      </div>
    </div>
  );
}
