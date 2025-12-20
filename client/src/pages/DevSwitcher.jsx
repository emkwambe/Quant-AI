import { useState } from 'preact/hooks';
import { auth, students } from '../api/index.js';
import { Logo } from '../components/Logo.jsx';

// Demo accounts from seed data
const DEMO_TEACHERS = [
  { email: 'principal@lincoln.edu', name: 'Dr. Sarah Johnson', role: 'Principal', tier: 'pro' },
  { email: 'smith@lincoln.edu', name: 'Ms. Emily Smith', role: '2nd Grade', tier: 'pro' },
  { email: 'garcia@lincoln.edu', name: 'Mr. Carlos Garcia', role: '4th Grade', tier: 'free' },
  { email: 'chen@lincoln.edu', name: 'Ms. Lisa Chen', role: '5th/6th Grade', tier: 'pro' },
  { email: 'wilson@lincoln.edu', name: 'Mr. James Wilson', role: '7th Grade', tier: 'free' },
];

const DEMO_CLASSROOMS = [
  { code: 'MATH2A', name: '2nd Grade Math Stars', grade: 2 },
  { code: 'MATH4A', name: '4th Grade Mathletes', grade: 4 },
  { code: 'MATH5A', name: '5th Grade Champions', grade: 5 },
  { code: 'MATH6A', name: '6th Grade Problem Solvers', grade: 6 },
  { code: 'MATH7A', name: '7th Grade Algebra Prep', grade: 7 },
];

const DEMO_PASSWORD = 'demo123';

export function DevSwitcher({ onTeacherLogin, onStudentJoin, onBack }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [studentName, setStudentName] = useState('TestStudent');

  async function loginAsTeacher(email) {
    setLoading(email);
    setError('');
    try {
      // Logout first if needed
      try { await auth.logout(); } catch (e) {}

      const data = await auth.login({ email, password: DEMO_PASSWORD });
      onTeacherLogin(data);
    } catch (err) {
      setError(`Failed: ${err.message}`);
      setLoading(null);
    }
  }

  async function joinAsStudent(code) {
    setLoading(code);
    setError('');
    try {
      // Leave first if needed
      try { await students.leave(); } catch (e) {}

      const data = await students.join({
        joinCode: code,
        displayName: studentName || 'TestStudent'
      });
      onStudentJoin(data);
    } catch (err) {
      setError(`Failed: ${err.message}`);
      setLoading(null);
    }
  }

  return (
    <div class="container" style={{ paddingTop: '1rem', maxWidth: '1000px' }}>
      <div class="flex flex-between mb-2">
        <button class="btn btn-outline" onClick={onBack}>← Back</button>
        <div style={{ background: '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>
          🛠️ Dev Mode
        </div>
      </div>

      <div class="text-center mb-3">
        <Logo size="medium" variant="gradient" />
        <h2 style={{ marginTop: '0.5rem' }}>Quick Account Switcher</h2>
        <p class="text-light">One-click login for testing (Password: demo123)</p>
      </div>

      {error && <p class="text-error text-center mb-2">{error}</p>}

      <div class="grid grid-2" style={{ gap: '1.5rem' }}>
        {/* Teacher Accounts */}
        <div class="card">
          <h3 style={{ color: 'var(--brand-navy)', marginBottom: '1rem' }}>
            👩‍🏫 Teacher Accounts
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DEMO_TEACHERS.map(teacher => (
              <button
                key={teacher.email}
                class="btn"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem',
                  textAlign: 'left'
                }}
                onClick={() => loginAsTeacher(teacher.email)}
                disabled={loading}
              >
                <div style={{ flex: 1 }}>
                  <strong>{teacher.name}</strong>
                  <div class="text-light" style={{ fontSize: '0.75rem' }}>
                    {teacher.role} • {teacher.tier === 'pro' ? '⭐ Pro' : 'Free'}
                  </div>
                </div>
                {loading === teacher.email ? (
                  <span>...</span>
                ) : (
                  <span style={{ color: 'var(--primary)' }}>Login →</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Student Join */}
        <div class="card">
          <h3 style={{ color: 'var(--brand-gold-dark)', marginBottom: '1rem' }}>
            👨‍🎓 Join as Student
          </h3>

          <div class="form-group mb-3">
            <label>Student Name</label>
            <input
              type="text"
              class="form-input"
              value={studentName}
              onInput={(e) => setStudentName(e.target.value)}
              placeholder="Test Student Name"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DEMO_CLASSROOMS.map(classroom => (
              <button
                key={classroom.code}
                class="btn"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem',
                  textAlign: 'left'
                }}
                onClick={() => joinAsStudent(classroom.code)}
                disabled={loading || !studentName.trim()}
              >
                <div style={{ flex: 1 }}>
                  <strong style={{ fontFamily: 'monospace' }}>{classroom.code}</strong>
                  <div class="text-light" style={{ fontSize: '0.75rem' }}>
                    {classroom.name}
                  </div>
                </div>
                {loading === classroom.code ? (
                  <span>...</span>
                ) : (
                  <span style={{ color: 'var(--success)' }}>Join →</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div class="card mt-3" style={{ background: 'var(--bg)' }}>
        <h4>💡 Testing Tips</h4>
        <ul class="text-light" style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
          <li>Open <strong>two browser windows</strong> (or use incognito) for teacher + student</li>
          <li>Teacher starts a heat → Student sees "waiting" screen update to game</li>
          <li>Pro teachers can access Analytics and Class vs Class</li>
          <li>Re-seed data anytime: <code style={{ background: '#e2e8f0', padding: '0.125rem 0.25rem', borderRadius: '2px' }}>npm run db:seed</code></li>
        </ul>
      </div>
    </div>
  );
}
