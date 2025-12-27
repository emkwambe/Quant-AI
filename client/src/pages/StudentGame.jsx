import { useState, useEffect, useRef } from 'preact/hooks';
import { heats } from '../api/index.js';
import { getFlag } from '../utils/countries.js';
import { Logo } from '../components/Logo.jsx';

export function StudentGame({ student, onLeave }) {
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'results'
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
    checkForHeat();
    const interval = setInterval(checkForHeat, 3000);
    return () => clearInterval(interval);
  }, []);

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

        // Find first unanswered question
        const firstUnanswered = data.questions.findIndex(q => !q.answered);
        setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);

        // Calculate remaining time
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

      // Show feedback
      setFeedback(result.correct ? 'correct' : 'wrong');
      setProgress(result.progress);

      // Clear feedback and move to next question
      setTimeout(() => {
        setFeedback(null);
        setAnswer('');

        if (currentIndex < questions.length - 1) {
          setCurrentIndex(i => i + 1);
          questionStartTime.current = Date.now();
          inputRef.current?.focus();
        } else {
          // Completed all questions
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

          <button class="btn btn-outline mt-4" onClick={onLeave}>
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
                {myRank.rank === 1 ? '🥇' : myRank.rank === 2 ? '🥈' : myRank.rank === 3 ? '🥉' : `#${myRank.rank}`}
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

          {/* Top 3 podium */}
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

          <button
            class="btn btn-primary btn-large mt-3"
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
        </div>
      </div>
    );
  }

  // Playing screen
  const currentQuestion = questions[currentIndex];

  return (
    <div class="container" style={{ paddingTop: '1rem' }}>
      {/* Feedback overlay */}
      {feedback && (
        <div class={`feedback ${feedback}`}>
          {feedback === 'correct' ? '✓' : '✗'}
        </div>
      )}

      {/* Header */}
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

      {/* Progress bar */}
      <div class="progress-bar mb-3">
        <div
          class="progress-fill"
          style={{ width: `${(progress.answered / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div class={`card question-card ${feedback ? `feedback-${feedback}` : ''}`}>
        {/* Feedback Overlay */}
        {feedback && (
          <div class={`feedback-overlay ${feedback}`}>
            {feedback === 'correct' ? '✓' : '✗'}
          </div>
        )}

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

      {/* Score */}
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
