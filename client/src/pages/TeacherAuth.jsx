import { useState } from 'preact/hooks';
import { auth } from '../api/index.js';
import { popularCountries, allCountries, getFlag } from '../utils/countries.js';

export function TeacherAuth({ onSuccess, onBack }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [countryCode, setCountryCode] = useState('US');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const data = await auth.login({ email, password });
        onSuccess(data);
      } else {
        const data = await auth.signup({ email, password, name, schoolName, countryCode });
        onSuccess(data);
      }
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
        <h2 class="text-center mb-3">
          {mode === 'login' ? 'Teacher Login' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <div class="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  class="form-input"
                  value={name}
                  onInput={(e) => setName(e.target.value)}
                  required
                  placeholder="Ms. Smith"
                />
              </div>

              <div class="form-group">
                <label>School Name (optional)</label>
                <input
                  type="text"
                  class="form-input"
                  value={schoolName}
                  onInput={(e) => setSchoolName(e.target.value)}
                  placeholder="Lincoln Elementary"
                />
              </div>

              <div class="form-group">
                <label>Country {getFlag(countryCode)}</label>
                <select
                  class="form-input"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <optgroup label="Popular">
                    {popularCountries.map(c => (
                      <option key={c.code} value={c.code}>{getFlag(c.code)} {c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="All Countries">
                    {allCountries.map(c => (
                      <option key={c.code} value={c.code}>{getFlag(c.code)} {c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </>
          )}

          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              class="form-input"
              value={email}
              onInput={(e) => setEmail(e.target.value)}
              required
              placeholder="teacher@school.edu"
            />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              class="form-input"
              value={password}
              onInput={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p class="text-error mb-2">{error}</p>
          )}

          <button
            type="submit"
            class="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div class="text-center mt-3">
          {mode === 'login' ? (
            <p class="text-light">
              Don't have an account?{' '}
              <a href="#" onClick={() => setMode('signup')} style={{ color: 'var(--primary)' }}>
                Sign up
              </a>
            </p>
          ) : (
            <p class="text-light">
              Already have an account?{' '}
              <a href="#" onClick={() => setMode('login')} style={{ color: 'var(--primary)' }}>
                Login
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
