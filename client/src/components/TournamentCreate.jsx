import { useState, useEffect } from 'preact/hooks';

export default function TournamentCreate({ classrooms, onCreated, onCancel }) {
  const [formData, setFormData] = useState({
    classroomId: '',
    name: '',
    season: `${new Date().getFullYear()}`,
    difficultyLevel: 3,
    roundsPerWeek: 1,
    questionsPerMatch: 10,
    startDate: new Date().toISOString().split('T')[0]
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter to classrooms with enough students
  const eligibleClassrooms = classrooms.filter(c => c.studentCount >= 2);

  useEffect(() => {
    if (formData.classroomId) {
      const classroom = classrooms.find(c => c.id === parseInt(formData.classroomId));
      if (classroom) {
        calculatePreview(classroom.studentCount);
      }
    }
  }, [formData.classroomId, formData.roundsPerWeek]);

  function calculatePreview(studentCount) {
    const effectiveCount = studentCount % 2 === 0 ? studentCount : studentCount + 1;
    const totalRounds = effectiveCount - 1;
    const matchupsPerRound = effectiveCount / 2;
    const weeksNeeded = Math.ceil(totalRounds / formData.roundsPerWeek);

    setPreview({
      totalRounds,
      matchupsPerRound,
      weeksNeeded,
      totalMatches: totalRounds * matchupsPerRound,
      hasByes: studentCount % 2 !== 0
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create tournament');
      }

      const tournament = await res.json();
      onCreated(tournament);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div class="card">
      <h2 class="mb-3">Create Tournament</h2>

      {error && <div class="alert alert-error mb-3">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div class="form-group">
          <label>Classroom</label>
          <select
            class="form-input"
            value={formData.classroomId}
            onChange={e => setFormData({ ...formData, classroomId: e.target.value })}
            required
          >
            <option value="">Select a classroom...</option>
            {eligibleClassrooms.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.studentCount} students)
              </option>
            ))}
          </select>
          {classrooms.length > eligibleClassrooms.length && (
            <p class="text-sm text-muted mt-1">
              * Classrooms with fewer than 2 students are not shown
            </p>
          )}
        </div>

        <div class="form-group">
          <label>Tournament Name</label>
          <input
            type="text"
            class="form-input"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Fall Math Championship"
          />
        </div>

        <div class="grid grid-2 gap-2">
          <div class="form-group">
            <label>Season</label>
            <input
              type="text"
              class="form-input"
              value={formData.season}
              onChange={e => setFormData({ ...formData, season: e.target.value })}
              placeholder="e.g., Fall 2025"
            />
          </div>

          <div class="form-group">
            <label>Start Date</label>
            <input
              type="date"
              class="form-input"
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div class="grid grid-3 gap-2">
          <div class="form-group">
            <label>Difficulty</label>
            <select
              class="form-input"
              value={formData.difficultyLevel}
              onChange={e => setFormData({ ...formData, difficultyLevel: parseInt(e.target.value) })}
            >
              <option value="1">Level 1 (Easy)</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3 (Medium)</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5 (Hard)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Rounds/Week</label>
            <select
              class="form-input"
              value={formData.roundsPerWeek}
              onChange={e => setFormData({ ...formData, roundsPerWeek: parseInt(e.target.value) })}
            >
              <option value="1">1 round</option>
              <option value="2">2 rounds</option>
              <option value="3">3 rounds</option>
            </select>
          </div>

          <div class="form-group">
            <label>Questions/Match</label>
            <select
              class="form-input"
              value={formData.questionsPerMatch}
              onChange={e => setFormData({ ...formData, questionsPerMatch: parseInt(e.target.value) })}
            >
              <option value="5">5 questions</option>
              <option value="10">10 questions</option>
              <option value="15">15 questions</option>
              <option value="20">20 questions</option>
            </select>
          </div>
        </div>

        {preview && (
          <div class="card bg-light p-3 mb-3">
            <h4 class="mb-2">Tournament Preview</h4>
            <div class="grid grid-2 gap-2 text-sm">
              <div>📊 <strong>{preview.totalRounds}</strong> total rounds</div>
              <div>⚔️ <strong>{preview.matchupsPerRound}</strong> matches per round</div>
              <div>📅 <strong>{preview.weeksNeeded}</strong> weeks duration</div>
              <div>🎯 <strong>{preview.totalMatches}</strong> total matches</div>
            </div>
            {preview.hasByes && (
              <p class="text-sm text-muted mt-2">
                * Odd number of students - each student will have one bye round
              </p>
            )}
          </div>
        )}

        <div class="flex gap-2">
          <button type="button" class="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" disabled={loading || !formData.classroomId}>
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>
        </div>
      </form>
    </div>
  );
}
