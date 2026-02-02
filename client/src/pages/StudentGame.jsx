import { useState, useEffect, useRef } from 'preact/hooks';
import { heats } from '../api/index.js';
import { getFlag } from '../utils/countries.js';
import { Logo } from '../components/Logo.jsx';
import { SkillsPractice } from '../components/SkillsPractice.jsx';

export function StudentGame({ student, onLeave }) {
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'results', 'skills'
  const [heat, setHeat] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState({ answered: 0, correct: 0 });
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState(null);

  const inputRef = useRef();
  const questionStartTime = useRef(Date.now());

  // Poll for active heat
  useEffect(() => {
    if (gameState === 'skills') return; // Don't poll during skills practice
    checkForHeat();
    const interval = setInterval(checkForHeat, 3000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(t => t - 1);
      if (timeLeft <= 1) {
        endHeat();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  async function checkForHeat() {
    try {
      const data = await heats.active();
      if (data.active && gameState === 'waiting') {
        setHeat(data.heat);
        setQuestions(data.questions);
        setProgress(data.progress);

        const firstUnanswered = data.questions.findIndex(q => !q.answered);
        setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);

        const startTime = new Date(data.heat.startedAt).getTime();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, data.heat.durationSeconds - elapsed);

        if (remaining > 0) {
          setTimeLeft(remaining);
          setGameState('playing');
          questionStartTime.current = Date.now();
        } else {
          endHeat();
        }
      } else if (!data.active && gameState === 'playing') {
        endHeat();
      }
    } catch (err) {
      console.error('Check heat error:', err);
    }
  }

  async function endHeat() {
    if (heat) {
      try {
        const resultData = await heats.results(heat.id);
        setResults(resultData);
      } catch (e) {}
    }
    setGameState('results');
  }

  async function submitAnswer() {
    if (!answer.trim() || !heat) return;

    const responseTimeMs = Date.now() - questionStartTime.current;

    try {
      const result = await heats.answer({
        heatId: heat.id,
        questionIndex: currentIndex,
        answer: parseInt(answer),
        responseTimeMs
      });

      setFeedback(result.correct ? 'correct' : 'wrong');
      setProgress(result.progress);

      setTimeout(() => {
        setFeedback(null);
        setAnswer('');

        if (currentIndex < questions.length - 1) {
          setCurrentIndex(i => i + 1);
          questionStartTime.current = Date.now();
          inputRef.current?.focus();
        } else {
          endHeat();
        }
      }, 500);
    } catch (err) {
      console.error('Submit error:', err);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      submitAnswer();
    }
  }

  // Skills Practice view
  if (gameState === 'skills') {
    return (
      <SkillsPractice 
        student={student} 
        onBack={() => setGameState('waiting')} 
      />
    );
  }

  // Waiting screen
  if (gameState === 'waiting') {
    return (
      <div class="container" style={{ paddingTop: '4rem' }}>
        <div class="card text-center">
          <div class="mb-2"><Logo size="medium" variant="gradient" /></div>
          <p class="text-light mb-3">Hi, {student.display_name}! {getFlag(student.country_code)}</p>
          <p class="text-light">Class: {student.classroom_name}</p>

          <div class="mt-4">
            <div class="countdown" style={{ fontSize: '2rem' }}>
              Waiting for teacher to start...
            </div>
            <p class="text-light mt-2">Get ready to race!</p>
          </div>

          {/* NEW: Skills Practice Button */}
          <button 
            class="btn btn-primary btn-large mt-4"
            onClick={() => setGameState('skills')}
            style={{ background: 'var(--brand-teal)' }}
          >
            Practice Skills While Waiting
          </button>

          <button class="btn btn-outline mt-2" onClick={onLeave}>
            Leave Class
          </button>
        </div>
      </div>
    );
  }

  // Results screen
  if (gameState === 'results') {
    const myRank = results?.leaderboard.find(r => r.studentId === student.id);

    return (
      <div class="container" style={{ paddingTop: '2rem' }}>
        <div class="card text-center">
          <h2 class="mb-2">Heat Complete!</h2>

          {myRank && (
            <div class="mb-3">
              <div style={{ fontSize: '4rem' }}>
                {myRank.rank === 1 ? '??' : myRank.rank === 2 ? '??' : myRank.rank === 3 ? '??' : `#${myRank.rank}`}
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {myRank.correct} / {myRank.total} correct
              </p>
            </div>
          )}

          <div class="stats mb-3">
            <div>
              <div class="stat-value">{results?.stats.participants || 0}</div>
              <div class="stat-label">Racers</div>
            </div>
            <div>
              <div class="stat-value">{results?.stats.classAccuracy || 0}%</div>
              <div class="stat-label">Class Accuracy</div>
            </div>
          </div>

          {results?.leaderboard.slice(0, 3).length > 0 && (
            <div class="podium">
              {results.leaderboard[1] && (
                <div class="podium-place podium-2">
                  <div class="podium-name">
                    <span class="podium-flag">{getFlag(results.leaderboard[1].countryCode)}</span>
                    {results.leaderboard[1].displayName}
                  </div>
                  <div class="podium-platform">2</div>
                </div>
              )}
              {results.leaderboard[0] && (
                <div class="podium-place podium-1">
                  <div class="podium-name">
                    <span class="podium-flag">{getFlag(results.leaderboard[0].countryCode)}</span>
                    {results.leaderboard[0].displayName}
                  </div>
                  <div class="podium-platform">1</div>
                </div>
              )}
              {results.leaderboard[2] && (
                <div class="podium-place podium-3">
                  <div class="podium-name">
                    <span class="podium-flag">{getFlag(results.leaderboard[2].countryCode)}</span>
                    {results.leaderboard[2].displayName}
                  </div>
                  <div class="podium-platform">3</div>
                </div>
              )}
            </div>
          )}

          <div class="grid grid-2 gap-2 mt-3">
            <button
              class="btn btn-primary"
              onClick={() => {
                setGameState('waiting');
                setHeat(null);
                setResults(null);
                setCurrentIndex(0);
                setProgress({ answered: 0, correct: 0 });
              }}
            >
              Ready for Next Heat
            </button>
            <button
              class="btn btn-outline"
              onClick={() => setGameState('skills')}
              style={{ borderColor: 'var(--brand-teal)', color: 'var(--brand-teal)' }}
            >
              Practice Skills
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  const currentQuestion = questions[currentIndex];

  return (
    <div class="container" style={{ paddingTop: '1rem' }}>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      {/* Header */}
=======
=======
>>>>>>> Stashed changes
      {feedback && (
        <div class={`feedback ${feedback}`}>
          {feedback === 'correct' ? '?' : '?'}
        </div>
      )}

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      <div class="flex flex-between mb-2">
        <span class="text-light">
          Question {currentIndex + 1} / {questions.length}
        </span>
        <span style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: timeLeft < 30 ? 'var(--error)' : 'var(--primary)'
        }}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
      </div>

      <div class="progress-bar mb-3">
        <div
          class="progress-fill"
          style={{ width: `${(progress.answered / questions.length) * 100}%` }}
        />
      </div>

<<<<<<< Updated upstream
<<<<<<< Updated upstream
      {/* Question Card */}
      <div class={`card question-card ${feedback ? `feedback-${feedback}` : ''}`}>
        {/* Feedback Overlay */}
        {feedback && (
          <div class={`feedback-overlay ${feedback}`}>
            <span class="feedback-icon">{feedback === 'correct' ? '✓' : '✗'}</span>
          </div>
        )}

=======
=======
>>>>>>> Stashed changes
      <div class="card">
>>>>>>> Stashed changes
        <div class="question-display">
          {currentQuestion?.display}
        </div>

        <input
          ref={inputRef}
          type="number"
          class="form-input answer-input"
          value={answer}
          onInput={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="?"
          autoFocus
          disabled={!!feedback}
        />

        <button
          class="btn btn-primary btn-block btn-large mt-2"
          onClick={submitAnswer}
          disabled={!answer.trim() || !!feedback}
          style={{ fontSize: '1.25rem', padding: '1rem' }}
        >
          Submit ↵
        </button>
      </div>

      <div class="stats mt-3">
        <div>
          <div class="stat-value text-success">{progress.correct}</div>
          <div class="stat-label">Correct</div>
        </div>
        <div>
          <div class="stat-value">{progress.answered}</div>
          <div class="stat-label">Answered</div>
        </div>
      </div>
    </div>
  );
}

