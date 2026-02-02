import { useState, useEffect, useRef } from 'preact/hooks';

const skillsApi = {
  getAll: () => fetch('/api/skills').then(r => r.json()),
  getPowerSix: () => fetch('/api/skills/power-six').then(r => r.json()),
  startSession: (data) => fetch('/api/skill-sessions/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  submitAnswer: (data) => fetch('/api/skill-sessions/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  getResults: (id) => fetch(`/api/skill-sessions/${id}/results`).then(r => r.json())
};

export function SkillsPractice({ student, onBack }) {
  const [view, setView] = useState('skills');
  const [skills, setSkills] = useState([]);
  const [powerSix, setPowerSix] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState({ level: 0, name: 'Not Started', color: '#9ca3af' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const inputRef = useRef();
  const startTime = useRef(Date.now());

  useEffect(() => { loadSkills(); }, []);

  async function loadSkills() {
    try {
      const [allSkills, p6] = await Promise.all([
        skillsApi.getAll(),
        skillsApi.getPowerSix()
      ]);
      setSkills(allSkills);
      setPowerSix(p6.skills || []);
    } catch (err) {
      console.error('Load skills error:', err);
    }
    setLoading(false);
  }

  async function startPractice(skill) {
    setSelectedSkill(skill);
    setLoading(true);
    try {
      const data = await skillsApi.startSession({
        studentId: student.id,
        skillId: skill.id,
        questionCount: 10,
        difficulty: 2
      });
      setSession(data);
      setQuestions(data.questions);
      setCurrentIndex(0);
      setStreak(0);
      setView('practice');
      startTime.current = Date.now();
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error('Start session error:', err);
    }
    setLoading(false);
  }

  async function submitAnswer() {
    if (!answer.trim() || !session) return;
    const responseTimeMs = Date.now() - startTime.current;

    try {
      const result = await skillsApi.submitAnswer({
        sessionId: session.sessionId,
        questionNumber: currentIndex + 1,
        answer: answer.trim(),
        responseTimeMs,
        studentId: student.id
      });

      setFeedback(result.isCorrect ? 'correct' : 'wrong');
      setStreak(result.currentStreak);
      if (result.levelInfo) setLevel(result.levelInfo);

      setTimeout(() => {
        setFeedback(null);
        setAnswer('');
        if (result.isComplete) {
          loadResults();
        } else {
          setCurrentIndex(i => i + 1);
          startTime.current = Date.now();
          inputRef.current?.focus();
        }
      }, 600);
    } catch (err) {
      console.error('Submit error:', err);
    }
  }

  async function loadResults() {
    try {
      const data = await skillsApi.getResults(session.sessionId);
      setResults(data);
      setView('results');
    } catch (err) {
      console.error('Results error:', err);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') submitAnswer();
  }

  // Skills selection view
  if (view === 'skills') {
    if (loading) {
      return (
        <div class="container flex flex-center" style={{ minHeight: '50vh' }}>
          <p>Loading skills...</p>
        </div>
      );
    }

    const powerSixIds = new Set(powerSix.map(s => s.id));

    return (
      <div class="container" style={{ paddingTop: '2rem' }}>
        <div class="flex flex-between mb-3">
          <h2>Skills Practice</h2>
          <button class="btn btn-outline" onClick={onBack}>Back</button>
        </div>

        {/* Power 6 Section */}
        <div class="card mb-3 power-six-card">
          <h3 class="power-six-title">POWER 6 - Master These First!</h3>
          <p class="text-light mb-3">These 6 skills predict Algebra I success</p>
          <div class="grid grid-2">
            {powerSix.map(skill => (
              <button key={skill.id} class="skill-card skill-card-power" onClick={() => startPractice(skill)}>
                <div class="skill-name">{skill.name}</div>
                <div class="skill-desc">{skill.short_name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* All Skills by Tier */}
        <h3 class="mb-2">All Skills by Category</h3>
        {skills.map(tier => {
          const tierSkills = (tier.skills || []).filter(s => !powerSixIds.has(s.id));
          if (tierSkills.length === 0) return null;
          
          return (
            <div key={tier.id} class="card mb-2">
              <h4 class="tier-title" style={{ color: tier.color || 'var(--primary)' }}>{tier.name}</h4>
              <div class="grid grid-3">
                {tierSkills.map(skill => (
                  <button key={skill.id} class="skill-card" onClick={() => startPractice(skill)}>
                    <div class="skill-name">{skill.short_name || skill.name}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Practice view
  if (view === 'practice') {
    const question = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;

    return (
      <div class="container" style={{ paddingTop: '1rem' }}>
        {feedback && <div class={`feedback ${feedback}`}></div>}

        <div class="flex flex-between mb-2">
          <span class="text-light">{selectedSkill?.name}</span>
          {streak > 0 && (
            <span class="streak-badge">{streak} streak</span>
          )}
        </div>

        <div class="flex flex-between mb-2">
          <span style={{ fontWeight: '600' }}>Question {currentIndex + 1} of {questions.length}</span>
        </div>

        <div class="progress-bar mb-3">
          <div class="progress-fill" style={{ width: progress + '%', background: 'var(--brand-teal)' }} />
        </div>

        <div class="card">
          <div class="question-display">{question?.question}</div>
          <input
            ref={inputRef}
            type="text"
            class="form-input answer-input"
            value={answer}
            onInput={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your answer"
            autoFocus
          />
          <button class="btn btn-primary btn-block btn-large mt-2" onClick={submitAnswer} disabled={!answer.trim()}>
            Submit
          </button>
        </div>

        <div class="stats mt-3">
          <div>
            <div class="stat-value" style={{ color: level.color }}>{level.level}</div>
            <div class="stat-label">{level.name}</div>
          </div>
          <div>
            <div class="stat-value text-success">{streak}</div>
            <div class="stat-label">Streak</div>
          </div>
        </div>

        <button class="btn btn-outline btn-block mt-3" onClick={() => setView('skills')}>
          Exit Practice
        </button>
      </div>
    );
  }

  // Results view
  if (view === 'results') {
    const correct = results?.responses?.filter(r => r.is_correct).length || 0;
    const total = results?.responses?.length || 0;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    let grade = 'Keep Practicing!';
    if (accuracy >= 90) grade = 'EXCELLENT!';
    else if (accuracy >= 70) grade = 'Great Job!';
    else if (accuracy >= 50) grade = 'Good Effort!';

    return (
      <div class="container" style={{ paddingTop: '2rem' }}>
        <div class="card text-center">
          <h2 class="mb-2">Practice Complete!</h2>
          <p class="text-light mb-3">{selectedSkill?.name}</p>

          <div class="result-grade">{grade}</div>

          <div class="stats mb-3">
            <div>
              <div class="stat-value text-success">{correct}</div>
              <div class="stat-label">Correct</div>
            </div>
            <div>
              <div class="stat-value">{total}</div>
              <div class="stat-label">Total</div>
            </div>
            <div>
              <div class="stat-value" style={{ color: 'var(--brand-gold)' }}>{accuracy}%</div>
              <div class="stat-label">Accuracy</div>
            </div>
          </div>

          <div class="card mb-3" style={{ background: 'var(--bg)' }}>
            <div class="stat-label">Current Level</div>
            <div class="level-display" style={{ color: level.color || 'var(--primary)' }}>
              Level {level.level} - {level.name}
            </div>
          </div>

          <div class="grid grid-2 gap-2">
            <button class="btn btn-primary" onClick={() => startPractice(selectedSkill)}>Practice Again</button>
            <button class="btn btn-outline" onClick={() => setView('skills')}>Choose Skill</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
