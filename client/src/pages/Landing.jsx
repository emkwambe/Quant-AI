import { Logo, LogoWithTagline } from '../components/Logo.jsx';

export function Landing({ onTeacherClick, onStudentClick, onDevClick }) {
  return (
    <div class="container" style={{ paddingTop: '2rem' }}>
      {/* Dev Mode Quick Access */}
      {onDevClick && (
        <div class="text-center mb-2">
          <button
            class="btn"
            onClick={onDevClick}
            style={{
              background: '#fef3c7',
              color: '#92400e',
              fontSize: '0.875rem',
              padding: '0.5rem 1rem'
            }}
          >
            🛠️ Dev: Quick Account Switcher
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div class="hero">
        <LogoWithTagline
          size="large"
          tagline="Real-time competitive math for K-8 classrooms"
        />

        {/* CTA Buttons */}
        <div class="grid grid-2 mt-4" style={{ maxWidth: '400px', margin: '2rem auto' }}>
          <button class="btn btn-primary btn-large" onClick={onTeacherClick}>
            I'm a Teacher
          </button>
          <button class="btn btn-outline btn-large" onClick={onStudentClick}>
            I'm a Student
          </button>
        </div>

        {/* Social Proof Stats */}
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-value">229+</div>
            <div class="hero-stat-label">Question Types</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-value">K-8</div>
            <div class="hero-stat-label">Grade Levels</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-value">CCSS</div>
            <div class="hero-stat-label">Aligned</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div class="card mt-4">
        <h3 class="text-center mb-3" style={{ color: 'var(--brand-navy)' }}>
          How It Works
        </h3>
        <div class="grid grid-3">
          <div class="text-center">
            <div class="feature-icon feature-icon-navy" style={{ margin: '0 auto 0.5rem' }}>
              📚
            </div>
            <strong>1. Create Class</strong>
            <p class="text-light" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Teacher sets up a classroom in seconds
            </p>
          </div>
          <div class="text-center">
            <div class="feature-icon feature-icon-teal" style={{ margin: '0 auto 0.5rem' }}>
              🔗
            </div>
            <strong>2. Students Join</strong>
            <p class="text-light" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Simple code entry, no accounts needed
            </p>
          </div>
          <div class="text-center">
            <div class="feature-icon feature-icon-gold" style={{ margin: '0 auto 0.5rem' }}>
              🏆
            </div>
            <strong>3. Race!</strong>
            <p class="text-light" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Compete in real-time math heats
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div class="grid grid-2 mt-3" style={{ gap: '1rem' }}>
        <div class="card">
          <h4 style={{ color: 'var(--brand-navy)' }}>For Teachers</h4>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
            <li class="text-light">Live classroom competitions</li>
            <li class="text-light">Student performance analytics</li>
            <li class="text-light">CCSS-aligned curriculum</li>
            <li class="text-light">Class vs Class challenges</li>
          </ul>
        </div>
        <div class="card">
          <h4 style={{ color: 'var(--brand-gold-dark)' }}>For Students</h4>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
            <li class="text-light">Fun, game-like experience</li>
            <li class="text-light">Instant feedback</li>
            <li class="text-light">Leaderboards & podiums</li>
            <li class="text-light">Represent your country</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div class="text-center mt-4 mb-2">
        <p class="text-light" style={{ fontSize: '0.875rem' }}>
          <Logo size="small" variant="navy" /> — Making math practice feel like a championship
        </p>
      </div>
    </div>
  );
}
