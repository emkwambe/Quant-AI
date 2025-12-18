import { useState } from 'preact/hooks';
import { classrooms, students } from '../api/index.js';

export function StudentJoin({ onJoin, onBack }) {
  const [step, setStep] = useState('code'); // 'code' or 'name'
  const [joinCode, setJoinCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [classroom, setClassroom] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCodeSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await classrooms.getByCode(joinCode);
      setClassroom(data);
      setStep('name');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleNameSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await students.join({
        joinCode,
        displayName: displayName.trim()
      });
      onJoin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="container" style={{ paddingTop: '2rem' }}>
      <button class="btn btn-outline mb-3" onClick={onBack}>
        ← Back
      </button>

      <div class="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 class="text-center mb-3">Join Classroom</h2>

        {step === 'code' ? (
          <form onSubmit={handleCodeSubmit}>
            <div class="form-group">
              <label>Enter Class Code</label>
              <input
                type="text"
                class="form-input form-input-large"
                value={joinCode}
                onInput={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="ABC123"
                required
                autoFocus
              />
              <p class="text-light text-center mt-1">
                Ask your teacher for the code
              </p>
            </div>

            {error && <p class="text-error mb-2">{error}</p>}

            <button
              type="submit"
              class="btn btn-primary btn-block btn-large"
              disabled={loading || joinCode.length < 6}
            >
              {loading ? 'Checking...' : 'Next'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit}>
            <div class="card mb-3" style={{ background: 'var(--bg)' }}>
              <p class="text-light">Joining:</p>
              <h3>{classroom?.name}</h3>
              <p class="text-light">Teacher: {classroom?.teacher_name}</p>
            </div>

            <div class="form-group">
              <label>Your Name</label>
              <input
                type="text"
                class="form-input"
                value={displayName}
                onInput={(e) => setDisplayName(e.target.value)}
                maxLength={20}
                placeholder="Your first name"
                required
                autoFocus
              />
            </div>

            {error && <p class="text-error mb-2">{error}</p>}

            <button
              type="submit"
              class="btn btn-success btn-block btn-large"
              disabled={loading || !displayName.trim()}
            >
              {loading ? 'Joining...' : 'Join Class!'}
            </button>

            <button
              type="button"
              class="btn btn-outline btn-block mt-2"
              onClick={() => {
                setStep('code');
                setClassroom(null);
              }}
            >
              Use Different Code
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
